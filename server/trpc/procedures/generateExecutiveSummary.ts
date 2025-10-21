import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { generateText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";
import { minioClient } from "~/server/minio";
import { env } from "~/server/env";
import PDFDocument from "pdfkit";

export const generateExecutiveSummary = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      scanId: z.number(),
      includeRecommendations: z.boolean().default(true),
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
            project: {
              include: {
                riskAssessments: {
                  orderBy: { calculatedAt: "desc" },
                  take: 1,
                },
              },
            },
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
        message: "You don't have permission to generate a report for this scan",
      });
    }
    
    const report = scan.reports[0];
    if (!report) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No report available for this scan",
      });
    }

    // Gather violation statistics
    const criticalViolations = scan.violations.filter(v => v.severity === "critical");
    const seriousViolations = scan.violations.filter(v => v.severity === "serious");
    const moderateViolations = scan.violations.filter(v => v.severity === "moderate");
    
    // Get unique violation types
    const violationTypes = [...new Set(scan.violations.map(v => v.code))];
    const topViolations = violationTypes.slice(0, 5).join(", ");
    
    // Get risk assessment if available
    const riskAssessment = scan.url.project.riskAssessments[0];
    
    const context = {
      projectName: scan.url.project.name,
      url: scan.url.url,
      scanDate: scan.startedAt.toLocaleDateString(),
      riskScore: report.riskScore,
      totalIssues: report.totalIssues,
      criticalCount: report.criticalIssues,
      seriousCount: report.seriousIssues,
      moderateCount: report.moderateIssues,
      minorCount: report.minorIssues,
      topViolations,
      hasRiskAssessment: !!riskAssessment,
      lawsuitProbability: riskAssessment?.lawsuitProbability,
      estimatedCost: riskAssessment?.totalExposure,
    };

    // Generate executive summary using AI
    const openrouter = createOpenRouter({
      apiKey: env.OPENROUTER_API_KEY,
    });
    
    const prompt = `Generate a professional executive summary for a website accessibility audit. This summary is for C-suite executives and business stakeholders who need to understand the business implications of accessibility issues.

Project: ${context.projectName}
Website: ${context.url}
Scan Date: ${context.scanDate}
Risk Score: ${context.riskScore}/100

Findings:
- Total Issues: ${context.totalIssues}
- Critical: ${context.criticalCount}
- Serious: ${context.seriousCount}
- Moderate: ${context.moderateCount}
- Minor: ${context.minorCount}

Top Issue Types: ${context.topViolations}

${context.hasRiskAssessment ? `Legal Risk Assessment:
- Lawsuit Probability: ${((context.lawsuitProbability || 0) * 100).toFixed(1)}%
- Estimated Total Exposure: $${(context.estimatedCost || 0).toLocaleString()}` : ''}

The executive summary should include:
1. **Executive Overview** - A 2-3 sentence high-level summary of the accessibility status
2. **Business Impact** - Explain the business implications (legal risk, market reach, brand reputation)
3. **Key Findings** - Summarize the most critical issues in business terms
4. **Risk Assessment** - Explain the potential legal and financial exposure
${input.includeRecommendations ? '5. **Recommended Actions** - High-level strategic recommendations with timeline' : ''}
6. **Next Steps** - Clear action items for leadership

Write in clear, professional business language. Avoid technical jargon. Focus on business value, risk mitigation, and strategic importance. Be direct and actionable.

Format the output in clear sections with headers. Do not use markdown formatting.`;
    
    const { text: summaryText } = await generateText({
      model: openrouter("anthropic/claude-3.5-sonnet"),
      prompt,
      temperature: 0.4,
    });

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
    
    // Header with branding
    doc.fontSize(28).fillColor("#1F2937").text("Executive Summary", { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(16).fillColor("#6366F1").text("Accessibility Audit Report", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor("#6B7280").text(context.projectName, { align: "center" });
    doc.moveDown(0.2);
    doc.fontSize(10).fillColor("#9CA3AF").text(context.url, { align: "center", link: context.url });
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor("#9CA3AF").text(`Report Generated: ${new Date().toLocaleDateString()}`, { align: "center" });
    doc.moveDown(1);
    
    // Separator line
    doc.strokeColor("#E5E7EB").lineWidth(2).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1.5);
    
    // Risk Score Badge
    const riskColor = context.riskScore >= 70 ? "#DC2626" : context.riskScore >= 40 ? "#F59E0B" : "#10B981";
    const riskLabel = context.riskScore >= 70 ? "HIGH RISK" : context.riskScore >= 40 ? "MEDIUM RISK" : "LOW RISK";
    
    doc.rect(200, doc.y, 195, 80).fillAndStroke("#F9FAFB", "#E5E7EB");
    doc.fontSize(48).fillColor(riskColor).text(context.riskScore.toString(), 200, doc.y + 10, { width: 195, align: "center" });
    doc.fontSize(12).fillColor("#6B7280").text("Risk Score", 200, doc.y + 55, { width: 195, align: "center" });
    doc.fontSize(10).fillColor(riskColor).text(riskLabel, 200, doc.y + 70, { width: 195, align: "center" });
    
    doc.moveDown(6);
    
    // Key Metrics
    doc.fontSize(14).fillColor("#1F2937").text("Key Metrics", { underline: true });
    doc.moveDown(0.5);
    
    const metricsY = doc.y;
    const metrics = [
      { label: "Total Issues", value: context.totalIssues.toString(), color: "#6B7280" },
      { label: "Critical", value: context.criticalCount.toString(), color: "#DC2626" },
      { label: "Serious", value: context.seriousCount.toString(), color: "#EA580C" },
      { label: "Moderate", value: context.moderateCount.toString(), color: "#F59E0B" },
    ];
    
    metrics.forEach((metric, index) => {
      const x = 50 + (index * 125);
      doc.rect(x, metricsY, 115, 50).fillAndStroke("#F9FAFB", "#E5E7EB");
      doc.fontSize(24).fillColor(metric.color).text(metric.value, x, metricsY + 8, { width: 115, align: "center" });
      doc.fontSize(9).fillColor("#6B7280").text(metric.label, x, metricsY + 35, { width: 115, align: "center" });
    });
    
    doc.y = metricsY + 60;
    doc.moveDown(1.5);
    
    // AI-Generated Summary Content
    const sections = summaryText.split(/\n\n+/);
    
    sections.forEach((section) => {
      if (doc.y > 700) {
        doc.addPage();
      }
      
      // Check if this is a header (all caps or ends with colon)
      const lines = section.split('\n');
      const firstLine = lines[0];
      
      if (firstLine.endsWith(':') || firstLine === firstLine.toUpperCase()) {
        // This is a header
        doc.fontSize(14).fillColor("#1F2937").text(firstLine.replace(':', ''), { underline: true });
        doc.moveDown(0.5);
        
        // Render the rest of the section
        if (lines.length > 1) {
          const content = lines.slice(1).join('\n').trim();
          doc.fontSize(11).fillColor("#374151").text(content, { align: "left", lineGap: 5 });
        }
      } else {
        // Regular paragraph
        doc.fontSize(11).fillColor("#374151").text(section, { align: "left", lineGap: 5 });
      }
      
      doc.moveDown(1);
    });
    
    // Footer with disclaimer
    if (doc.y > 650) {
      doc.addPage();
    }
    
    doc.moveDown(2);
    doc.strokeColor("#E5E7EB").lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);
    
    doc.fontSize(8).fillColor("#9CA3AF").text(
      "This executive summary is based on automated accessibility scanning and AI analysis. For detailed technical findings and remediation guidance, please refer to the full technical report. This document is confidential and intended for internal stakeholder review.",
      { align: "center", lineGap: 3 }
    );
    
    // Page numbers
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor("#9CA3AF").text(
        `Page ${i + 1} of ${pageCount} | Confidential`,
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
    const filename = `executive-summary-${scan.id}-${Date.now()}.pdf`;
    
    await minioClient.putObject(
      "scan-reports",
      filename,
      pdfBuffer,
      pdfBuffer.length,
      {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="executive-summary-${scan.url.project.name}.pdf"`,
      }
    );
    
    // Create legal document record
    const legalDocument = await db.legalDocument.create({
      data: {
        projectId: scan.url.project.id,
        userId: user.id,
        documentType: "executive_summary",
        title: `Executive Summary - ${scan.url.project.name}`,
        filename,
        isPremium: false,
        isCourtReady: false,
      },
    });
    
    return {
      success: true,
      filename,
      documentId: legalDocument.id,
      summary: summaryText.substring(0, 500) + "...",
    };
  });
