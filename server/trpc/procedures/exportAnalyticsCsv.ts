import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";
import { minioClient } from "~/server/minio";

export const exportAnalyticsCsv = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      days: z.number().default(30),
    })
  )
  .mutation(async ({ input }) => {
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
    
    // Calculate statistics
    let totalScans = 0;
    let completedScans = 0;
    let runningScans = 0;
    let errorScans = 0;
    let totalIssues = 0;
    let criticalIssues = 0;
    let seriousIssues = 0;
    let moderateIssues = 0;
    let minorIssues = 0;
    
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
    
    recentActivity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    const averageIssuesPerScan = completedScans > 0 ? Math.round(totalIssues / completedScans) : 0;

    // Helper function to escape CSV fields
    const escapeCSV = (field: string | number | null | undefined): string => {
      if (field === null || field === undefined) return "";
      const str = String(field);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    
    // Generate CSV content
    const csvRows: string[] = [];
    
    // Header section
    csvRows.push("Analytics Report");
    csvRows.push("");
    csvRows.push(`Period,Last ${input.days} days`);
    csvRows.push(`Generated On,${new Date().toLocaleString()}`);
    csvRows.push("");
    
    // Summary Statistics
    csvRows.push("Summary Statistics");
    csvRows.push(`Total Scans,${totalScans}`);
    csvRows.push(`Completed Scans,${completedScans}`);
    csvRows.push(`Running Scans,${runningScans}`);
    csvRows.push(`Error Scans,${errorScans}`);
    csvRows.push(`Total Issues,${totalIssues}`);
    csvRows.push(`Average Issues per Scan,${averageIssuesPerScan}`);
    csvRows.push("");
    
    // Issue Distribution
    csvRows.push("Issue Distribution");
    csvRows.push("Severity,Count,Percentage");
    if (totalIssues > 0) {
      csvRows.push(`Critical,${criticalIssues},${((criticalIssues / totalIssues) * 100).toFixed(1)}%`);
      csvRows.push(`Serious,${seriousIssues},${((seriousIssues / totalIssues) * 100).toFixed(1)}%`);
      csvRows.push(`Moderate,${moderateIssues},${((moderateIssues / totalIssues) * 100).toFixed(1)}%`);
      csvRows.push(`Minor,${minorIssues},${((minorIssues / totalIssues) * 100).toFixed(1)}%`);
    } else {
      csvRows.push("No issues found in this period");
    }
    csvRows.push("");
    
    // Scan Trend
    csvRows.push("Scan Trend");
    csvRows.push("Date,Scans");
    Object.entries(scansByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([date, count]) => {
        csvRows.push(`${date},${count}`);
      });
    csvRows.push("");
    
    // Issue Trend
    csvRows.push("Issue Trend");
    csvRows.push("Date,Issues");
    Object.entries(issuesByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([date, count]) => {
        csvRows.push(`${date},${count}`);
      });
    csvRows.push("");
    
    // Recent Activity
    csvRows.push("Recent Activity");
    csvRows.push("Type,Project,URL,Timestamp,Risk Score,Total Issues");
    recentActivity.slice(0, 50).forEach((activity) => {
      csvRows.push(
        [
          escapeCSV(activity.type),
          escapeCSV(activity.projectName),
          escapeCSV(activity.url),
          escapeCSV(activity.timestamp.toLocaleString()),
          escapeCSV(activity.riskScore),
          escapeCSV(activity.totalIssues),
        ].join(",")
      );
    });
    
    const csvContent = csvRows.join("\n");

    // Upload to Minio
    const filename = `analytics-${user.id}-${Date.now()}.csv`;
    const buffer = Buffer.from(csvContent, "utf-8");
    
    await minioClient.putObject(
      "scan-reports",
      filename,
      buffer,
      buffer.length,
      {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="analytics-report.csv"`,
      }
    );
    
    return {
      filename,
      success: true,
    };
  });
