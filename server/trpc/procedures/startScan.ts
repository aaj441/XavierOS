import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";
import { sendScanCompleteEmail, sendScanErrorEmail } from "~/server/utils/email";
import { getBaseUrl } from "~/server/utils/base-url";

function extractWcagLevel(tags: string[]): string {
  if (tags.some(tag => tag.includes("wcag2aaa"))) return "AAA";
  if (tags.some(tag => tag.includes("wcag2aa"))) return "AA";
  if (tags.some(tag => tag.includes("wcag2a"))) return "A";
  return "A"; // default to A if not specified
}

function mapImpactToRisk(impact: string): string {
  switch (impact) {
    case "critical":
    case "serious":
      return "high";
    case "moderate":
      return "medium";
    case "minor":
      return "low";
    default:
      return "medium";
  }
}

async function createOrUpdateSnapshot(projectId: number, scanDate: Date) {
  // Normalize date to midnight UTC for consistent snapshots
  const snapshotDate = new Date(scanDate);
  snapshotDate.setUTCHours(0, 0, 0, 0);
  
  // Get all scans for this project on this date
  const endOfDay = new Date(snapshotDate);
  endOfDay.setUTCHours(23, 59, 59, 999);
  
  const scans = await db.scan.findMany({
    where: {
      url: {
        projectId: projectId,
      },
      startedAt: {
        gte: snapshotDate,
        lte: endOfDay,
      },
      status: "completed",
    },
    include: {
      reports: true,
      violations: true,
    },
  });
  
  if (scans.length === 0) return;
  
  // Calculate aggregate metrics
  const totalScans = scans.length;
  const completedScans = scans.filter(s => s.status === "completed").length;
  
  let totalViolations = 0;
  let criticalCount = 0;
  let seriousCount = 0;
  let moderateCount = 0;
  let minorCount = 0;
  let totalRiskScore = 0;
  let riskScoreCount = 0;
  
  scans.forEach(scan => {
    totalViolations += scan.violations.length;
    criticalCount += scan.violations.filter(v => v.severity === "critical").length;
    seriousCount += scan.violations.filter(v => v.severity === "serious").length;
    moderateCount += scan.violations.filter(v => v.severity === "moderate").length;
    minorCount += scan.violations.filter(v => v.severity === "minor").length;
    
    if (scan.reports.length > 0) {
      totalRiskScore += scan.reports[0].riskScore;
      riskScoreCount++;
    }
  });
  
  // Calculate accessibility debt (weighted sum)
  const accessibilityDebt = (criticalCount * 10) + (seriousCount * 7) + (moderateCount * 4) + (minorCount * 1);
  const averageRiskScore = riskScoreCount > 0 ? Math.round(totalRiskScore / riskScoreCount) : 0;
  
  // Upsert snapshot
  await db.projectSnapshot.upsert({
    where: {
      projectId_snapshotDate: {
        projectId: projectId,
        snapshotDate: snapshotDate,
      },
    },
    update: {
      totalScans,
      completedScans,
      totalViolations,
      criticalCount,
      seriousCount,
      moderateCount,
      minorCount,
      averageRiskScore,
      accessibilityDebt,
    },
    create: {
      projectId,
      snapshotDate,
      totalScans,
      completedScans,
      totalViolations,
      criticalCount,
      seriousCount,
      moderateCount,
      minorCount,
      averageRiskScore,
      accessibilityDebt,
    },
  });
}

async function detectRemediationsAndRegressions(
  projectId: number,
  urlId: number,
  currentViolations: Array<{ code: string; description: string; severity: string; wcagLevel: string }>,
  scanId: number
) {
  // Get the most recent previous scan for this URL
  const previousScan = await db.scan.findFirst({
    where: {
      urlId: urlId,
      id: { not: scanId },
      status: "completed",
    },
    include: {
      violations: true,
    },
    orderBy: {
      startedAt: "desc",
    },
  });
  
  if (!previousScan) return; // No previous scan to compare against
  
  // Create a map of current violations by code
  const currentViolationCodes = new Set(currentViolations.map(v => v.code));
  const previousViolationCodes = new Set(previousScan.violations.map(v => v.code));
  
  // Find violations that were in previous scan but not in current (remediated)
  const remediatedCodes = Array.from(previousViolationCodes).filter(
    code => !currentViolationCodes.has(code)
  );
  
  // Create RemediatedViolation records for newly fixed issues
  for (const code of remediatedCodes) {
    const violation = previousScan.violations.find(v => v.code === code);
    if (!violation) continue;
    
    await db.remediatedViolation.create({
      data: {
        projectId,
        urlId,
        code: violation.code,
        description: violation.description,
        severity: violation.severity,
        wcagLevel: violation.wcagLevel,
        lastSeenAt: previousScan.startedAt,
        remediatedAt: new Date(),
      },
    });
  }
  
  // Find violations that were previously remediated but have reappeared (regressions)
  const remediatedViolations = await db.remediatedViolation.findMany({
    where: {
      urlId: urlId,
      hasRegressed: false,
    },
  });
  
  for (const remediated of remediatedViolations) {
    if (currentViolationCodes.has(remediated.code)) {
      // This violation has regressed!
      await db.remediatedViolation.update({
        where: { id: remediated.id },
        data: {
          hasRegressed: true,
          regressedAt: new Date(),
          regressionScanId: scanId,
        },
      });
    }
  }
}

export const startScan = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      urlId: z.number(),
    })
  )
  .mutation(async ({ input }) => {
    const user = await getAuthenticatedUser(input.authToken);
    
    // Verify user owns the URL's project
    const url = await db.uRL.findUnique({
      where: { id: input.urlId },
      include: { project: true },
    });
    
    if (!url || url.project.ownerId !== user.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to scan this URL",
      });
    }
    
    // Update URL status
    await db.uRL.update({
      where: { id: input.urlId },
      data: { status: "scanning" },
    });
    
    // Create scan
    const scan = await db.scan.create({
      data: {
        urlId: input.urlId,
        status: "running",
      },
    });
    
    // Perform scan asynchronously in the background
    (async () => {
      let browser;
      try {
        // Launch browser
        browser = await chromium.launch({
          headless: true,
        });
        
        const context = await browser.newContext();
        const page = await context.newPage();
        
        // Navigate to URL with timeout
        await page.goto(url.url, { 
          waitUntil: "networkidle",
          timeout: 30000 
        });
        
        // Run axe-core accessibility scan
        const axeResults = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag2aaa"])
          .analyze();
        
        await browser.close();
        browser = null;
        
        // Map axe-core violations to our schema
        const violations = axeResults.violations.flatMap((violation) =>
          violation.nodes.map((node) => ({
            code: violation.id,
            description: violation.description,
            severity: violation.impact || "moderate",
            risk: mapImpactToRisk(violation.impact || "moderate"),
            wcagLevel: extractWcagLevel(violation.tags),
            element: node.html,
            suggestion: `${violation.help}. More info: ${violation.helpUrl}`,
          }))
        );
        
        // Create violations in database
        await Promise.all(
          violations.map((v) =>
            db.violation.create({
              data: {
                scanId: scan.id,
                ...v,
              },
            })
          )
        );
        
        // Calculate metrics
        const criticalCount = violations.filter((v) => v.severity === "critical").length;
        const seriousCount = violations.filter((v) => v.severity === "serious").length;
        const moderateCount = violations.filter((v) => v.severity === "moderate").length;
        const minorCount = violations.filter((v) => v.severity === "minor").length;
        const totalIssues = violations.length;
        const riskScore = totalIssues > 0 
          ? Math.round(
              (criticalCount * 10 + seriousCount * 7 + moderateCount * 4 + minorCount * 1) / totalIssues * 10
            )
          : 0;
        
        // Update scan status
        await db.scan.update({
          where: { id: scan.id },
          data: {
            status: "completed",
            finishedAt: new Date(),
            resultsJson: JSON.stringify({
              totalViolations: violations.length,
              url: url.url,
              timestamp: new Date().toISOString(),
              axeSummary: {
                passes: axeResults.passes.length,
                violations: axeResults.violations.length,
                incomplete: axeResults.incomplete.length,
                inapplicable: axeResults.inapplicable.length,
              }
            }),
          },
        });
        
        // Create report
        await db.report.create({
          data: {
            scanId: scan.id,
            summary: totalIssues > 0
              ? `Found ${totalIssues} accessibility issue${totalIssues !== 1 ? 's' : ''} across ${axeResults.violations.length} WCAG criteria`
              : "No accessibility issues found. The page meets WCAG compliance standards.",
            riskScore,
            totalIssues,
            criticalIssues: criticalCount,
            seriousIssues: seriousCount,
            moderateIssues: moderateCount,
            minorIssues: minorCount,
          },
        });
        
        // Create or update daily snapshot for historical tracking
        await createOrUpdateSnapshot(url.project.id, new Date());
        
        // Detect remediated violations and regressions
        await detectRemediationsAndRegressions(
          url.project.id,
          url.id,
          violations,
          scan.id
        );
        
        // Send email notification if enabled
        const owner = await db.user.findUnique({
          where: { id: url.project.ownerId },
        });
        
        if (owner && owner.receiveEmailNotifications && owner.notifyOnScanComplete) {
          const emailTo = owner.notificationEmail || owner.email;
          const scanUrl = `${getBaseUrl()}/scans/${scan.id}`;
          
          await sendScanCompleteEmail(emailTo, {
            userName: owner.name,
            projectName: url.project.name,
            url: url.url,
            totalIssues,
            criticalIssues: criticalCount,
            seriousIssues: seriousCount,
            moderateIssues: moderateCount,
            minorIssues: minorCount,
            riskScore,
            scanUrl,
          });
        }
        
        // Update URL status
        await db.uRL.update({
          where: { id: input.urlId },
          data: {
            status: "completed",
            lastScan: new Date(),
          },
        });
      } catch (error) {
        // Clean up browser if still open
        if (browser) {
          await browser.close().catch(() => {});
        }
        
        console.error("Scan error:", error);
        
        // Update scan and URL status to error
        await db.scan.update({
          where: { id: scan.id },
          data: {
            status: "error",
            finishedAt: new Date(),
            resultsJson: JSON.stringify({
              error: error instanceof Error ? error.message : "Unknown error occurred",
            }),
          },
        });
        
        // Send error notification email if enabled
        const owner = await db.user.findUnique({
          where: { id: url.project.ownerId },
        });
        
        if (owner && owner.receiveEmailNotifications && owner.notifyOnScanError) {
          const emailTo = owner.notificationEmail || owner.email;
          
          await sendScanErrorEmail(emailTo, {
            userName: owner.name,
            projectName: url.project.name,
            url: url.url,
            error: error instanceof Error ? error.message : "Unknown error occurred",
          });
        }
        
        await db.uRL.update({
          where: { id: input.urlId },
          data: {
            status: "error",
          },
        });
      }
    })();
    
    return {
      scanId: scan.id,
      status: "running",
    };
  });
