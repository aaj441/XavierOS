import { db } from "~/server/db";
import { createCaller } from "~/server/trpc/root";
import { createAuditLog } from "~/server/utils/audit";

function calculateNextRun(
  frequency: string,
  timeOfDay: string,
  dayOfWeek?: number | null,
  dayOfMonth?: number | null
): Date {
  const now = new Date();
  const [hours, minutes] = timeOfDay.split(":").map(Number);
  
  const next = new Date(now);
  next.setHours(hours, minutes, 0, 0);
  
  if (frequency === "daily") {
    next.setDate(next.getDate() + 1);
  } else if (frequency === "weekly" && dayOfWeek !== null && dayOfWeek !== undefined) {
    const currentDay = next.getDay();
    let daysUntilNext = dayOfWeek - currentDay;
    if (daysUntilNext <= 0) {
      daysUntilNext += 7;
    }
    next.setDate(next.getDate() + daysUntilNext);
  } else if (frequency === "monthly" && dayOfMonth !== null && dayOfMonth !== undefined) {
    next.setMonth(next.getMonth() + 1);
    next.setDate(dayOfMonth);
  }
  
  return next;
}

function calculateNextReportRun(
  frequency: string,
  timeOfDay: string,
  dayOfWeek?: number | null,
  dayOfMonth?: number | null,
  monthOfQuarter?: number | null
): Date {
  const now = new Date();
  const [hours, minutes] = timeOfDay.split(":").map(Number);
  
  const next = new Date(now);
  next.setHours(hours, minutes, 0, 0);
  
  if (frequency === "daily") {
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
  } else if (frequency === "weekly" && dayOfWeek !== null && dayOfWeek !== undefined) {
    const currentDay = next.getDay();
    let daysUntilNext = dayOfWeek - currentDay;
    if (daysUntilNext <= 0 || (daysUntilNext === 0 && next <= now)) {
      daysUntilNext += 7;
    }
    next.setDate(next.getDate() + daysUntilNext);
  } else if (frequency === "monthly" && dayOfMonth !== null && dayOfMonth !== undefined) {
    next.setDate(dayOfMonth);
    if (next <= now) {
      next.setMonth(next.getMonth() + 1);
      next.setDate(dayOfMonth);
    }
  } else if (frequency === "quarterly" && monthOfQuarter !== null && monthOfQuarter !== undefined) {
    const currentMonth = now.getMonth();
    const currentQuarter = Math.floor(currentMonth / 3);
    const targetMonthInQuarter = monthOfQuarter - 1;
    
    let targetMonth = currentQuarter * 3 + targetMonthInQuarter;
    let targetYear = now.getFullYear();
    
    if (targetMonth < currentMonth || (targetMonth === currentMonth && next <= now)) {
      targetMonth += 3;
      if (targetMonth >= 12) {
        targetMonth -= 12;
        targetYear += 1;
      }
    }
    
    next.setFullYear(targetYear);
    next.setMonth(targetMonth);
    next.setDate(dayOfMonth || 1);
  }
  
  return next;
}

export async function runScheduledScans() {
  console.log("Checking for scheduled scans...");
  
  const now = new Date();
  
  // Find all enabled schedules that are due to run
  const dueSchedules = await db.scanSchedule.findMany({
    where: {
      enabled: true,
      nextRunAt: {
        lte: now,
      },
    },
    include: {
      url: {
        include: {
          project: {
            include: {
              owner: true,
            },
          },
        },
      },
    },
  });
  
  console.log(`Found ${dueSchedules.length} scheduled scans to run`);
  
  for (const schedule of dueSchedules) {
    try {
      console.log(`Running scheduled scan for URL: ${schedule.url.url}`);
      
      // Check if URL is already being scanned
      if (schedule.url.status === "scanning") {
        console.log(`Skipping - URL is already being scanned: ${schedule.url.url}`);
        continue;
      }
      
      // Create a tRPC caller with the owner's auth token
      // For scheduled scans, we'll use a system-level approach
      // by directly calling the scan logic
      
      // Update the schedule's last run time and calculate next run
      const nextRunAt = calculateNextRun(
        schedule.frequency,
        schedule.timeOfDay,
        schedule.dayOfWeek,
        schedule.dayOfMonth
      );
      
      await db.scanSchedule.update({
        where: { id: schedule.id },
        data: {
          lastRunAt: now,
          nextRunAt,
        },
      });
      
      // Trigger the scan by updating URL status and creating scan record
      await db.uRL.update({
        where: { id: schedule.urlId },
        data: { status: "scanning" },
      });
      
      const scan = await db.scan.create({
        data: {
          urlId: schedule.urlId,
          status: "running",
        },
      });
      
      // Import the scan logic dynamically to avoid circular dependencies
      const { chromium } = await import("playwright");
      const AxeBuilder = (await import("@axe-core/playwright")).default;
      
      // Run scan in background
      (async () => {
        let browser;
        try {
          browser = await chromium.launch({ headless: true });
          const context = await browser.newContext();
          const page = await context.newPage();
          
          await page.goto(schedule.url.url, { 
            waitUntil: "networkidle",
            timeout: 30000 
          });
          
          const axeResults = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag2aaa"])
            .analyze();
          
          await browser.close();
          browser = null;
          
          // Process results (same logic as startScan)
          const violations = axeResults.violations.flatMap((violation) =>
            violation.nodes.map((node) => ({
              code: violation.id,
              description: violation.description,
              severity: violation.impact || "moderate",
              risk: violation.impact === "critical" || violation.impact === "serious" ? "high" :
                    violation.impact === "moderate" ? "medium" : "low",
              wcagLevel: violation.tags.some(t => t.includes("wcag2aaa")) ? "AAA" :
                        violation.tags.some(t => t.includes("wcag2aa")) ? "AA" : "A",
              element: node.html,
              suggestion: `${violation.help}. More info: ${violation.helpUrl}`,
            }))
          );
          
          await Promise.all(
            violations.map((v) =>
              db.violation.create({
                data: { scanId: scan.id, ...v },
              })
            )
          );
          
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
          
          await db.scan.update({
            where: { id: scan.id },
            data: {
              status: "completed",
              finishedAt: new Date(),
              resultsJson: JSON.stringify({
                totalViolations: violations.length,
                url: schedule.url.url,
                timestamp: new Date().toISOString(),
                scheduled: true,
              }),
            },
          });
          
          await db.report.create({
            data: {
              scanId: scan.id,
              summary: totalIssues > 0
                ? `Found ${totalIssues} accessibility issue${totalIssues !== 1 ? 's' : ''}`
                : "No accessibility issues found.",
              riskScore,
              totalIssues,
              criticalIssues: criticalCount,
              seriousIssues: seriousCount,
              moderateIssues: moderateCount,
              minorIssues: minorCount,
            },
          });
          
          await db.uRL.update({
            where: { id: schedule.urlId },
            data: { status: "completed", lastScan: new Date() },
          });
          
          // Send notification if enabled
          const owner = schedule.url.project.owner;
          if (owner.receiveEmailNotifications && owner.notifyOnScheduledScan) {
            const { sendScanCompleteEmail } = await import("~/server/utils/email");
            const { getBaseUrl } = await import("~/server/utils/base-url");
            
            const emailTo = owner.notificationEmail || owner.email;
            const scanUrl = `${getBaseUrl()}/scans/${scan.id}`;
            
            await sendScanCompleteEmail(emailTo, {
              userName: owner.name,
              projectName: schedule.url.project.name,
              url: schedule.url.url,
              totalIssues,
              criticalIssues: criticalCount,
              seriousIssues: seriousCount,
              moderateIssues: moderateCount,
              minorIssues: minorCount,
              riskScore,
              scanUrl,
            });
          }
          
          console.log(`Scheduled scan completed for: ${schedule.url.url}`);
        } catch (error) {
          if (browser) {
            await browser.close().catch(() => {});
          }
          
          console.error("Scheduled scan error:", error);
          
          await db.scan.update({
            where: { id: scan.id },
            data: {
              status: "error",
              finishedAt: new Date(),
              resultsJson: JSON.stringify({
                error: error instanceof Error ? error.message : "Unknown error",
                scheduled: true,
              }),
            },
          });
          
          await db.uRL.update({
            where: { id: schedule.urlId },
            data: { status: "error" },
          });
        }
      })();
      
    } catch (error) {
      console.error(`Error processing schedule ${schedule.id}:`, error);
    }
  }
}

export async function runScheduledReports() {
  console.log("Checking for scheduled reports...");
  
  const now = new Date();
  
  // Find all enabled report schedules that are due
  const dueSchedules = await db.reportSchedule.findMany({
    where: {
      enabled: true,
      nextRunAt: {
        lte: now,
      },
    },
    include: {
      project: {
        include: {
          owner: true,
        },
      },
      creator: true,
      template: true,
    },
  });
  
  console.log(`Found ${dueSchedules.length} scheduled reports to generate`);
  
  for (const schedule of dueSchedules) {
    try {
      console.log(`Generating scheduled report: ${schedule.reportType} for project ${schedule.project.name}`);
      
      // Update schedule's last run time and calculate next run
      const nextRunAt = calculateNextReportRun(
        schedule.frequency,
        schedule.timeOfDay,
        schedule.dayOfWeek,
        schedule.dayOfMonth,
        schedule.monthOfQuarter
      );
      
      await db.reportSchedule.update({
        where: { id: schedule.id },
        data: {
          lastRunAt: now,
          nextRunAt,
          lastStatus: "success",
          lastError: null,
        },
      });
      
      // Generate report in background
      (async () => {
        try {
          const { getBaseUrl } = await import("~/server/utils/base-url");
          const { sendEmail } = await import("~/server/utils/email");
          const { minioClient } = await import("~/server/minio");
          
          let filename: string;
          let documentType: string;
          let title: string;
          
          // Generate report based on type
          switch (schedule.reportType) {
            case "executive_summary": {
              // Get most recent scan for the project
              const recentScan = await db.scan.findFirst({
                where: {
                  url: {
                    projectId: schedule.projectId,
                  },
                  status: "completed",
                },
                orderBy: { finishedAt: "desc" },
              });
              
              if (!recentScan) {
                throw new Error("No completed scans found for this project");
              }
              
              const { generateExecutiveSummary } = await import("~/server/trpc/procedures/generateExecutiveSummary");
              const result = await generateExecutiveSummary._def.mutation({
                input: {
                  authToken: "", // System-level execution
                  scanId: recentScan.id,
                },
                ctx: {} as any,
              });
              
              filename = result.filename;
              documentType = "executive_summary";
              title = `Executive Summary - ${schedule.project.name}`;
              break;
            }
            
            case "compliance_document": {
              const recentScan = await db.scan.findFirst({
                where: {
                  url: {
                    projectId: schedule.projectId,
                  },
                  status: "completed",
                },
                orderBy: { finishedAt: "desc" },
              });
              
              if (!recentScan) {
                throw new Error("No completed scans found for this project");
              }
              
              const { generateComplianceDocument } = await import("~/server/trpc/procedures/generateComplianceDocument");
              const result = await generateComplianceDocument._def.mutation({
                input: {
                  authToken: "",
                  scanId: recentScan.id,
                },
                ctx: {} as any,
              });
              
              filename = result.filename;
              documentType = "compliance_document";
              title = `Compliance Document - ${schedule.project.name}`;
              break;
            }
            
            case "analytics_pdf": {
              const { exportAnalyticsPdf } = await import("~/server/trpc/procedures/exportAnalyticsPdf");
              const result = await exportAnalyticsPdf._def.mutation({
                input: {
                  authToken: "",
                  days: 30,
                  projectId: schedule.projectId,
                },
                ctx: {} as any,
              });
              
              filename = result.filename;
              documentType = "analytics_report";
              title = `Analytics Report - ${schedule.project.name}`;
              break;
            }
            
            default:
              throw new Error(`Unsupported report type: ${schedule.reportType}`);
          }
          
          // Create document record
          const document = await db.legalDocument.create({
            data: {
              projectId: schedule.projectId,
              userId: schedule.project.ownerId,
              documentType,
              title,
              filename,
              generatedAt: new Date(),
            },
          });
          
          // Create audit log
          await createAuditLog({
            userId: schedule.creatorId,
            action: "report_generated",
            resourceType: "report",
            resourceId: document.id,
            description: `Scheduled ${schedule.reportType} generated for project ${schedule.project.name}`,
            metadata: {
              scheduleId: schedule.id,
              reportType: schedule.reportType,
              frequency: schedule.frequency,
            },
            success: true,
          });
          
          // Send email to recipients
          const recipientEmails: string[] = JSON.parse(schedule.recipientEmails);
          if (schedule.includeOwner) {
            recipientEmails.push(schedule.project.owner.email);
          }
          
          const reportUrl = await minioClient.presignedGetObject(
            "scan-reports",
            filename,
            7 * 24 * 60 * 60 // 7 days
          );
          
          for (const email of recipientEmails) {
            await sendEmail({
              to: email,
              subject: `Scheduled Report: ${title}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #1F2937;">Your Scheduled Report is Ready</h2>
                  <p>Hello,</p>
                  <p>Your scheduled <strong>${schedule.reportType.replace(/_/g, ' ')}</strong> report for <strong>${schedule.project.name}</strong> has been generated.</p>
                  <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Report:</strong> ${title}</p>
                    <p style="margin: 10px 0 0 0;"><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                    <p style="margin: 10px 0 0 0;"><strong>Schedule:</strong> ${schedule.frequency}</p>
                  </div>
                  <a href="${reportUrl}" style="display: inline-block; background-color: #6366F1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">Download Report</a>
                  <p style="margin-top: 30px; color: #6B7280; font-size: 14px;">This link will expire in 7 days.</p>
                </div>
              `,
            });
          }
          
          console.log(`Scheduled report generated and distributed: ${filename}`);
        } catch (error) {
          console.error("Scheduled report generation error:", error);
          
          await db.reportSchedule.update({
            where: { id: schedule.id },
            data: {
              lastStatus: "error",
              lastError: error instanceof Error ? error.message : "Unknown error",
            },
          });
          
          await createAuditLog({
            userId: schedule.creatorId,
            action: "report_generated",
            resourceType: "report",
            description: `Failed to generate scheduled ${schedule.reportType} for project ${schedule.project.name}`,
            metadata: {
              scheduleId: schedule.id,
              reportType: schedule.reportType,
            },
            success: false,
            errorMessage: error instanceof Error ? error.message : "Unknown error",
          });
        }
      })();
      
    } catch (error) {
      console.error(`Error processing report schedule ${schedule.id}:`, error);
    }
  }
}

// Run the scheduler every 5 minutes
export function startScheduler() {
  console.log("Starting scan and report scheduler...");
  
  // Run immediately on startup
  runScheduledScans().catch(console.error);
  runScheduledReports().catch(console.error);
  
  // Then run every 5 minutes
  setInterval(() => {
    runScheduledScans().catch(console.error);
    runScheduledReports().catch(console.error);
  }, 5 * 60 * 1000); // 5 minutes
}
