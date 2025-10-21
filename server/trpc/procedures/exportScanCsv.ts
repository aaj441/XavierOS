import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";
import { minioClient } from "~/server/minio";

export const exportScanCsv = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      scanId: z.number(),
    })
  )
  .mutation(async ({ input }) => {
    const user = await getAuthenticatedUser(input.authToken);
    
    // Fetch the scan with all related data
    const scan = await db.scan.findUnique({
      where: { id: input.scanId },
      include: {
        url: {
          include: {
            project: true,
          },
        },
        violations: {
          orderBy: [
            { severity: "desc" },
            { createdAt: "asc" },
          ],
        },
        reports: true,
      },
    });
    
    if (!scan || scan.url.project.ownerId !== user.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to export this scan",
      });
    }
    
    const report = scan.reports[0];
    
    // Generate CSV content
    const csvRows: string[] = [];
    
    // Helper function to escape CSV fields
    const escapeCSV = (field: string | number | null | undefined): string => {
      if (field === null || field === undefined) return "";
      const str = String(field);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    
    // Header section
    csvRows.push("Accessibility Scan Report");
    csvRows.push("");
    csvRows.push(`URL,${escapeCSV(scan.url.url)}`);
    csvRows.push(`Scan Date,${escapeCSV(scan.startedAt.toLocaleString())}`);
    csvRows.push(`Status,${escapeCSV(scan.status)}`);
    
    if (report) {
      csvRows.push("");
      csvRows.push("Summary Statistics");
      csvRows.push(`Risk Score,${report.riskScore}`);
      csvRows.push(`Total Issues,${report.totalIssues}`);
      csvRows.push(`Critical Issues,${report.criticalIssues}`);
      csvRows.push(`Serious Issues,${report.seriousIssues}`);
      csvRows.push(`Moderate Issues,${report.moderateIssues}`);
      csvRows.push(`Minor Issues,${report.minorIssues}`);
      csvRows.push("");
      csvRows.push(`Summary,${escapeCSV(report.summary)}`);
    }
    
    // Violations section
    csvRows.push("");
    csvRows.push("");
    csvRows.push("Violations");
    csvRows.push("Severity,Risk,WCAG Level,Code,Description,Element,Suggestion");
    
    for (const violation of scan.violations) {
      csvRows.push(
        [
          escapeCSV(violation.severity),
          escapeCSV(violation.risk),
          escapeCSV(violation.wcagLevel),
          escapeCSV(violation.code),
          escapeCSV(violation.description),
          escapeCSV(violation.element),
          escapeCSV(violation.suggestion),
        ].join(",")
      );
    }
    
    const csvContent = csvRows.join("\n");
    
    // Upload to Minio
    const filename = `scan-${scan.id}-${Date.now()}.csv`;
    const buffer = Buffer.from(csvContent, "utf-8");
    
    await minioClient.putObject(
      "scan-reports",
      filename,
      buffer,
      buffer.length,
      {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="accessibility-scan-${scan.id}.csv"`,
      }
    );
    
    return {
      filename,
      success: true,
    };
  });
