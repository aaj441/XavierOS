import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";
import { minioClient } from "~/server/minio";
import PDFDocument from "pdfkit";

export const exportScanPdf = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      scanId: z.number(),
    })
  )
  .mutation(async ({ input }) => {
    const user = await getAuthenticatedUser(input.authToken);
    
    // Fetch user's branding settings
    let branding = {
      logoUrl: null as string | null,
      primaryColor: "#6366F1",
      secondaryColor: "#8B5CF6",
      accentColor: "#EC4899",
    };

    const license = await db.license.findFirst({
      where: {
        customerId: user.id,
        status: "active",
        type: "white_label",
        brandingEnabled: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (license) {
      branding = {
        logoUrl: license.logoUrl,
        primaryColor: license.primaryColor || "#6366F1",
        secondaryColor: license.secondaryColor || "#8B5CF6",
        accentColor: license.accentColor || "#EC4899",
      };
    }
    
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
    
    // Create PDF document
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });
    
    // Collect PDF data in a buffer
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    
    const pdfPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
    });
    
    // Define colors for severity levels
    const severityColors = {
      critical: "#DC2626",
      serious: "#EA580C",
      moderate: "#CA8A04",
      minor: "#2563EB",
    };
    
    // Header with branding
    if (branding.logoUrl) {
      try {
        // Fetch logo from Minio
        const logoResponse = await fetch(branding.logoUrl);
        if (logoResponse.ok) {
          const logoBuffer = Buffer.from(await logoResponse.arrayBuffer());
          doc.image(logoBuffer, 50, 40, { height: 40, align: "left" });
          doc.moveDown(3);
        }
      } catch (error) {
        console.error("Failed to load logo:", error);
        // Continue without logo
      }
    }

    doc.fontSize(24).fillColor(branding.primaryColor).text("Accessibility Scan Report", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor("#6B7280").text(scan.url.url, { align: "center", link: scan.url.url });
    doc.moveDown(0.3);
    doc.fontSize(10).text(`Scanned on ${scan.startedAt.toLocaleString()}`, { align: "center" });
    doc.moveDown(1);
    
    // Add a line separator
    doc.strokeColor("#E5E7EB").lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);
    
    // Summary section
    if (report) {
      doc.fontSize(16).fillColor("#1F2937").text("Summary", { underline: true });
      doc.moveDown(0.5);
      
      // Statistics grid
      const statsY = doc.y;
      const colWidth = 120;
      const rowHeight = 60;
      
      const stats = [
        { label: "Risk Score", value: report.riskScore.toString(), color: branding.primaryColor },
        { label: "Total Issues", value: report.totalIssues.toString(), color: "#6B7280" },
        { label: "Critical", value: report.criticalIssues.toString(), color: severityColors.critical },
        { label: "Serious", value: report.seriousIssues.toString(), color: severityColors.serious },
        { label: "Moderate", value: report.moderateIssues.toString(), color: severityColors.moderate },
        { label: "Minor", value: report.minorIssues.toString(), color: severityColors.minor },
      ];
      
      stats.forEach((stat, index) => {
        const col = index % 4;
        const row = Math.floor(index / 4);
        const x = 50 + col * colWidth;
        const y = statsY + row * rowHeight;
        
        doc.rect(x, y, colWidth - 10, rowHeight - 10).fillAndStroke("#F9FAFB", "#E5E7EB");
        doc.fontSize(24).fillColor(stat.color).text(stat.value, x, y + 10, { width: colWidth - 10, align: "center" });
        doc.fontSize(9).fillColor("#6B7280").text(stat.label, x, y + 40, { width: colWidth - 10, align: "center" });
      });
      
      doc.y = statsY + Math.ceil(stats.length / 4) * rowHeight + 10;
      doc.moveDown(1);
      
      // Summary text
      doc.fontSize(12).fillColor("#374151").text(report.summary, { align: "left", lineGap: 4 });
      doc.moveDown(1.5);
    }
    
    // Violations section
    doc.fontSize(16).fillColor("#1F2937").text("Violations by Severity", { underline: true });
    doc.moveDown(1);
    
    // Group violations by severity
    const groupedViolations: Record<string, typeof scan.violations> = {
      critical: [],
      serious: [],
      moderate: [],
      minor: [],
    };
    
    scan.violations.forEach((v) => {
      if (groupedViolations[v.severity]) {
        groupedViolations[v.severity].push(v);
      }
    });
    
    // Render each severity group
    for (const severity of ["critical", "serious", "moderate", "minor"] as const) {
      const violations = groupedViolations[severity];
      if (violations.length === 0) continue;
      
      const color = severityColors[severity];
      
      // Severity header
      doc.fontSize(14).fillColor(color).text(`${severity.charAt(0).toUpperCase() + severity.slice(1)} Issues (${violations.length})`, { underline: false });
      doc.moveDown(0.5);
      
      // Render each violation
      for (const violation of violations) {
        // Check if we need a new page
        if (doc.y > 700) {
          doc.addPage();
        }
        
        // Violation box
        const boxY = doc.y;
        doc.roundedRect(50, boxY, 495, 10, 5).fillAndStroke("#F9FAFB", "#E5E7EB");
        
        // Badges
        doc.fontSize(8).fillColor("#FFFFFF");
        doc.roundedRect(60, boxY + 5, 60, 16, 3).fill(color);
        doc.fillColor("#FFFFFF").text(`WCAG ${violation.wcagLevel}`, 60, boxY + 8, { width: 60, align: "center" });
        
        doc.roundedRect(125, boxY + 5, 50, 16, 3).fill(color);
        doc.fillColor("#FFFFFF").text(`${violation.risk.toUpperCase()}`, 125, boxY + 8, { width: 50, align: "center" });
        
        doc.y = boxY + 30;
        
        // Description
        doc.fontSize(11).fillColor("#1F2937").text(violation.description, 60, doc.y, { width: 475 });
        doc.moveDown(0.3);
        
        // Code
        doc.fontSize(9).fillColor("#6B7280").font("Courier").text(violation.code, 60, doc.y, { width: 475 });
        doc.font("Helvetica");
        doc.moveDown(0.5);
        
        // Element section
        doc.fontSize(9).fillColor("#374151").text("Affected Element:", 60, doc.y);
        doc.moveDown(0.2);
        doc.fontSize(8).fillColor("#6B7280").font("Courier").text(violation.element, 60, doc.y, { width: 475 });
        doc.font("Helvetica");
        doc.moveDown(0.5);
        
        // Suggestion section
        doc.fontSize(9).fillColor("#374151").text("Suggestion:", 60, doc.y);
        doc.moveDown(0.2);
        doc.fontSize(9).fillColor("#6B7280").text(violation.suggestion, 60, doc.y, { width: 475 });
        doc.moveDown(1);
      }
      
      doc.moveDown(0.5);
    }
    
    // Footer
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor("#9CA3AF").text(
        `Page ${i + 1} of ${pageCount}`,
        50,
        doc.page.height - 50,
        { align: "center" }
      );
    }
    
    // Finalize the PDF
    doc.end();
    
    // Wait for PDF generation to complete
    const pdfBuffer = await pdfPromise;
    
    // Upload to Minio
    const filename = `scan-${scan.id}-${Date.now()}.pdf`;
    
    await minioClient.putObject(
      "scan-reports",
      filename,
      pdfBuffer,
      pdfBuffer.length,
      {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="accessibility-scan-${scan.id}.pdf"`,
      }
    );
    
    return {
      filename,
      success: true,
    };
  });
