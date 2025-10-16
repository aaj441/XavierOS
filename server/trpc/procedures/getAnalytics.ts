import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";

export const getAnalytics = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      days: z.number().default(30), // Number of days to look back
    })
  )
  .query(async ({ input }) => {
    const user = await getAuthenticatedUser(input.authToken);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - input.days);
    
    // Get all projects for the user
    const projects = await db.project.findMany({
      where: { ownerId: user.id },
      include: {
        urls: {
          include: {
            scans: {
              where: {
                startedAt: {
                  gte: startDate,
                },
              },
              include: {
                reports: true,
              },
            },
          },
        },
      },
    });
    
    // Calculate statistics for current period
    let totalScans = 0;
    let completedScans = 0;
    let runningScans = 0;
    let errorScans = 0;
    let totalIssues = 0;
    let criticalIssues = 0;
    let seriousIssues = 0;
    let moderateIssues = 0;
    let minorIssues = 0;
    let totalScanDuration = 0;
    let completedScansWithDuration = 0;
    
    // For previous period comparison
    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (input.days * 2));
    const previousPeriodEnd = new Date(startDate);
    
    // Track violation types and WCAG levels
    const violationTypes: Record<string, number> = {};
    const wcagLevelDistribution: Record<string, number> = { A: 0, AA: 0, AAA: 0 };
    const riskDistribution: Record<string, number> = { high: 0, medium: 0, low: 0 };
    
    const scansByDate: Record<string, number> = {};
    const issuesByDate: Record<string, number> = {};
    const recentActivity: Array<{
      id: number;
      type: "scan_complete" | "scan_error" | "scan_started";
      projectName: string;
      url: string;
      timestamp: Date;
      riskScore?: number;
      totalIssues?: number;
    }> = [];
    
    projects.forEach((project) => {
      project.urls.forEach((url) => {
        url.scans.forEach((scan) => {
          totalScans++;
          
          const dateKey = scan.startedAt.toISOString().split("T")[0];
          scansByDate[dateKey] = (scansByDate[dateKey] || 0) + 1;
          
          if (scan.status === "completed") {
            completedScans++;
            
            // Calculate scan duration
            if (scan.finishedAt) {
              const duration = scan.finishedAt.getTime() - scan.startedAt.getTime();
              totalScanDuration += duration;
              completedScansWithDuration++;
            }
            
            if (scan.reports.length > 0) {
              const report = scan.reports[0];
              totalIssues += report.totalIssues;
              criticalIssues += report.criticalIssues;
              seriousIssues += report.seriousIssues;
              moderateIssues += report.moderateIssues;
              minorIssues += report.minorIssues;
              
              issuesByDate[dateKey] = (issuesByDate[dateKey] || 0) + report.totalIssues;
              
              recentActivity.push({
                id: scan.id,
                type: "scan_complete",
                projectName: project.name,
                url: url.url,
                timestamp: scan.finishedAt || scan.startedAt,
                riskScore: report.riskScore,
                totalIssues: report.totalIssues,
              });
            }
          } else if (scan.status === "running") {
            runningScans++;
            recentActivity.push({
              id: scan.id,
              type: "scan_started",
              projectName: project.name,
              url: url.url,
              timestamp: scan.startedAt,
            });
          } else if (scan.status === "error") {
            errorScans++;
            recentActivity.push({
              id: scan.id,
              type: "scan_error",
              projectName: project.name,
              url: url.url,
              timestamp: scan.finishedAt || scan.startedAt,
            });
          }
        });
      });
    });
    
    // Get all violations for the current period for detailed analysis
    const allViolations = await db.violation.findMany({
      where: {
        scan: {
          startedAt: {
            gte: startDate,
          },
          url: {
            project: {
              ownerId: user.id,
            },
          },
        },
      },
      select: {
        code: true,
        severity: true,
        risk: true,
        wcagLevel: true,
      },
    });
    
    // Aggregate violation data
    allViolations.forEach((violation) => {
      // Count by type
      violationTypes[violation.code] = (violationTypes[violation.code] || 0) + 1;
      
      // Count by WCAG level
      wcagLevelDistribution[violation.wcagLevel] = (wcagLevelDistribution[violation.wcagLevel] || 0) + 1;
      
      // Count by risk
      riskDistribution[violation.risk] = (riskDistribution[violation.risk] || 0) + 1;
    });
    
    // Get top 5 most common violation types
    const topViolationTypes = Object.entries(violationTypes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([code, count]) => ({ code, count }));
    
    // Calculate previous period stats for comparison
    const previousPeriodScans = await db.scan.count({
      where: {
        startedAt: {
          gte: previousPeriodStart,
          lt: previousPeriodEnd,
        },
        url: {
          project: {
            ownerId: user.id,
          },
        },
        status: "completed",
      },
    });
    
    const previousPeriodReports = await db.report.findMany({
      where: {
        scan: {
          startedAt: {
            gte: previousPeriodStart,
            lt: previousPeriodEnd,
          },
          url: {
            project: {
              ownerId: user.id,
            },
          },
          status: "completed",
        },
      },
      select: {
        totalIssues: true,
      },
    });
    
    const previousPeriodIssues = previousPeriodReports.reduce((sum, report) => sum + report.totalIssues, 0);
    
    // Calculate improvement metrics
    const scanGrowth = previousPeriodScans > 0 
      ? Math.round(((completedScans - previousPeriodScans) / previousPeriodScans) * 100)
      : 0;
    
    const issueChange = previousPeriodIssues > 0
      ? Math.round(((totalIssues - previousPeriodIssues) / previousPeriodIssues) * 100)
      : 0;
    
    // Calculate average scan duration in seconds
    const averageScanDuration = completedScansWithDuration > 0
      ? Math.round(totalScanDuration / completedScansWithDuration / 1000)
      : 0;
    
    // Sort recent activity by timestamp (most recent first)
    recentActivity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // Convert date maps to arrays for charting
    const scanTrend = Object.entries(scansByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
    
    const issueTrend = Object.entries(issuesByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
    
    // Fetch historical snapshots for long-term trends (up to 90 days)
    const historicalStartDate = new Date();
    historicalStartDate.setDate(historicalStartDate.getDate() - 90);
    
    const historicalSnapshots = await db.projectSnapshot.findMany({
      where: {
        projectId: {
          in: projects.map(p => p.id),
        },
        snapshotDate: {
          gte: historicalStartDate,
        },
      },
      orderBy: {
        snapshotDate: "asc",
      },
    });
    
    // Aggregate snapshots by date for trend visualization
    const snapshotsByDate: Record<string, {
      totalViolations: number;
      accessibilityDebt: number;
      averageRiskScore: number;
      criticalCount: number;
      seriousCount: number;
      moderateCount: number;
      minorCount: number;
    }> = {};
    
    historicalSnapshots.forEach(snapshot => {
      const dateKey = snapshot.snapshotDate.toISOString().split("T")[0];
      if (!snapshotsByDate[dateKey]) {
        snapshotsByDate[dateKey] = {
          totalViolations: 0,
          accessibilityDebt: 0,
          averageRiskScore: 0,
          criticalCount: 0,
          seriousCount: 0,
          moderateCount: 0,
          minorCount: 0,
        };
      }
      snapshotsByDate[dateKey].totalViolations += snapshot.totalViolations;
      snapshotsByDate[dateKey].accessibilityDebt += snapshot.accessibilityDebt;
      snapshotsByDate[dateKey].averageRiskScore += snapshot.averageRiskScore;
      snapshotsByDate[dateKey].criticalCount += snapshot.criticalCount;
      snapshotsByDate[dateKey].seriousCount += snapshot.seriousCount;
      snapshotsByDate[dateKey].moderateCount += snapshot.moderateCount;
      snapshotsByDate[dateKey].minorCount += snapshot.minorCount;
    });
    
    // Convert to array for charting
    const accessibilityDebtTrend = Object.entries(snapshotsByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        debt: data.accessibilityDebt,
        violations: data.totalViolations,
        riskScore: data.averageRiskScore,
        critical: data.criticalCount,
        serious: data.seriousCount,
        moderate: data.moderateCount,
        minor: data.minorCount,
      }));
    
    // Calculate longest trend days
    const longestTrendDays = historicalSnapshots.length > 0 && historicalSnapshots[0]
      ? Math.floor((new Date().getTime() - historicalSnapshots[0].snapshotDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    // Fetch regression data
    const regressions = await db.remediatedViolation.findMany({
      where: {
        projectId: {
          in: projects.map(p => p.id),
        },
        hasRegressed: true,
      },
      include: {
        url: true,
      },
      orderBy: {
        regressedAt: "desc",
      },
    });
    
    const totalRegressions = regressions.length;
    const recentRegressions = regressions
      .filter(r => r.regressedAt && r.regressedAt >= startDate)
      .slice(0, 10)
      .map(r => ({
        id: r.id,
        code: r.code,
        description: r.description,
        severity: r.severity,
        url: r.url.url,
        remediatedAt: r.remediatedAt,
        regressedAt: r.regressedAt,
      }));
    
    // Group regressions by URL
    const regressionsByUrl: Record<string, number> = {};
    regressions.forEach(r => {
      regressionsByUrl[r.url.url] = (regressionsByUrl[r.url.url] || 0) + 1;
    });
    
    // Fetch remediation data
    const allRemediatedViolations = await db.remediatedViolation.findMany({
      where: {
        projectId: {
          in: projects.map(p => p.id),
        },
      },
    });
    
    const totalRemediated = allRemediatedViolations.filter(r => !r.hasRegressed).length;
    const remediatedThisPeriod = allRemediatedViolations.filter(
      r => !r.hasRegressed && r.remediatedAt >= startDate
    ).length;
    
    // Calculate remediation rate (issues fixed vs issues found in current period)
    const remediationRate = totalIssues > 0 
      ? Math.round((remediatedThisPeriod / (totalIssues + remediatedThisPeriod)) * 100)
      : 0;
    
    return {
      totalScans,
      completedScans,
      runningScans,
      errorScans,
      totalIssues,
      issueDistribution: {
        critical: criticalIssues,
        serious: seriousIssues,
        moderate: moderateIssues,
        minor: minorIssues,
      },
      wcagLevelDistribution,
      riskDistribution,
      topViolationTypes,
      scanTrend,
      issueTrend,
      recentActivity: recentActivity.slice(0, 10), // Last 10 activities
      averageIssuesPerScan: completedScans > 0 ? Math.round(totalIssues / completedScans) : 0,
      averageScanDuration, // in seconds
      comparisonMetrics: {
        scanGrowth, // percentage change
        issueChange, // percentage change (negative is good!)
        previousPeriodScans,
        previousPeriodIssues,
      },
      historicalData: {
        snapshots: historicalSnapshots,
        accessibilityDebtTrend,
        longestTrendDays,
      },
      regressionData: {
        totalRegressions,
        recentRegressions,
        regressionsByUrl,
      },
      remediationData: {
        totalRemediated,
        remediatedThisPeriod,
        remediationRate,
      },
    };
  });
