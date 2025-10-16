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

export const generateComplianceDocument = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      scanId: z.number(),
      includeVPAT: z.boolean().default(false),
      isCourtReady: z.boolean().default(false),
    })
  )
  .mutation(async ({ input }) => {
    const user = await getAuthenticatedUser(input.authToken);
    
    // Check subscription for court-ready documents
    const subscription = await db.userSubscription.findUnique({
      where: { userId: user.id },
      include: { plan: true },
    });
    
    if (input.isCourtReady && (!subscription || !subscription.plan.courtReadyDocuments)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Court-ready documents require a Professional or Enterprise subscription",
      });
    }
    
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
            { wcagLevel: "asc" },
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

    // Group violations by WCAG level
    const violationsByWCAG = {
      A: scan.violations.filter(v => v.wcagLevel === "A"),
      AA: scan.violations.filter(v => v.wcagLevel === "AA"),
      AAA: scan.violations.filter(v => v.wcagLevel === "AAA"),
    };
    
    // Get unique violation codes by level
    const uniqueViolationsByLevel = {
      A: [...new Set(violationsByWCAG.A.map(v => v.code))],
      AA: [...new Set(violationsByWCAG.AA.map(v => v.code))],
      AAA: [...new Set(violationsByWCAG.AAA.map(v => v.code))],
    };
    
    const riskAssessment = scan.url.project.riskAssessments[0];
    
    const context = {
      projectName: scan.url.project.name,
      url: scan.url.url,
      scanDate: scan.startedAt.toLocaleDateString(),
      riskScore: report.riskScore,
      totalIssues: report.totalIssues,
      criticalCount: report.criticalIssues,
      seriousCount: report.seriousIssues,
      wcagA: violationsByWCAG.A.length,
      wcagAA: violationsByWCAG.AA.length,
      wcagAAA: violationsByWCAG.AAA.length,
      isCourtReady: input.isCourtReady,
      hasRiskAssessment: !!riskAssessment,
    };

    // Generate compliance narrative using AI
    const openrouter = createOpenRouter({
      apiKey: env.OPENROUTER_API_KEY,
    });
    
    const courtReadyContext = input.isCourtReady 
      ? "This is a COURT-READY document. Use precise legal terminology, cite specific ADA Title III requirements, Section 508 standards, and WCAG 2.1 Level AA criteria. Include references to relevant case law and DOJ guidance. Language must be suitable for legal proceedings and regulatory compliance documentation."
      : "This is a standard compliance document. Use professional language appropriate for compliance officers and technical teams.";
    
    const prompt = `Generate a detailed compliance documentation narrative for a website accessibility audit. ${courtReadyContext}

Project: ${context.projectName}
Website: ${context.url}
Audit Date: ${context.scanDate}

Compliance Status:
- WCAG Level A Violations: ${context.wcagA}
- WCAG Level AA Violations: ${context.wcagAA}
- WCAG Level AAA Violations: ${context.wcagAAA}
- Overall Risk Score: ${context.riskScore}/100

The compliance narrative should include:
1. **Regulatory Framework** - Reference to ADA Title III, Section 508, WCAG 2.1 Level AA standards
2. **Compliance Assessment** - Detailed analysis of conformance levels
3. **Technical Findings** - Summary of violations by WCAG success criteria
4. **Legal Implications** - Potential regulatory exposure and compliance requirements
5. **Remediation Requirements** - Technical and procedural steps needed for compliance
6. **Timeline Recommendations** - Suggested remediation schedule based on severity

${input.isCourtReady ? 'Use legally precise language with specific citations. This document may be used in legal proceedings.' : 'Use clear professional language suitable for compliance documentation.'}

Format the output in clear sections with headers. Do not use markdown formatting.`;
    
    const { text: complianceNarrative } = await generateText({
      model: openrouter("anthropic/claude-3.5-sonnet"),
      prompt,
      temperature: input.isCourtReady ? 0.2 : 0.3, // Lower temperature for court-ready docs
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
    
    // Header
    doc.fontSize(24).fillColor("#1F2937").text("Accessibility Compliance Documentation", { align: "center" });
    doc.moveDown(0.3);
    if (input.isCourtReady) {
      doc.fontSize(12).fillColor("#DC2626").text("COURT-READY LEGAL DOCUMENT", { align: "center" });
      doc.moveDown(0.3);
    }
    doc.fontSize(11).fillColor("#6B7280").text(context.projectName, { align: "center" });
    doc.moveDown(0.2);
    doc.fontSize(10).fillColor("#9CA3AF").text(context.url, { align: "center", link: context.url });
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor("#9CA3AF").text(`Audit Date: ${context.scanDate}`, { align: "center" });
    doc.fontSize(9).fillColor("#9CA3AF").text(`Document Generated: ${new Date().toLocaleDateString()}`, { align: "center" });
    doc.moveDown(1);
    
    // Separator
    doc.strokeColor("#E5E7EB").lineWidth(2).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1.5);
    
    // Document Information
    doc.fontSize(14).fillColor("#1F2937").text("Document Information", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor("#374151");
    doc.text(`Document Type: ${input.isCourtReady ? "Court-Ready Compliance Report" : "Standard Compliance Report"}`);
    doc.text(`Prepared For: ${user.name}`);
    doc.text(`Organization: ${context.projectName}`);
    doc.text(`Audit Scope: ${context.url}`);
    doc.text(`Standards Referenced: WCAG 2.1 Level AA, ADA Title III, Section 508`);
    doc.moveDown(1.5);
    
    // Compliance Summary
    doc.fontSize(14).fillColor("#1F2937").text("Compliance Summary", { underline: true });
    doc.moveDown(0.5);
    
    const summaryY = doc.y;
    
    // WCAG Conformance Levels
    doc.fontSize(11).fillColor("#374151").text("WCAG 2.1 Conformance Analysis:", 60, summaryY);
    doc.moveDown(0.5);
    
    const wcagLevels = [
      { level: "Level A (Must Have)", count: context.wcagA, color: "#DC2626", status: context.wcagA === 0 ? "PASS" : "FAIL" },
      { level: "Level AA (Should Have)", count: context.wcagAA, color: "#EA580C", status: context.wcagAA === 0 ? "PASS" : "FAIL" },
      { level: "Level AAA (Enhanced)", count: context.wcagAAA, color: "#F59E0B", status: context.wcagAAA === 0 ? "PASS" : "ADVISORY" },
    ];
    
    wcagLevels.forEach((level) => {
      doc.fontSize(10).fillColor("#6B7280").text(`${level.level}:`, 70, doc.y, { continued: true });
      doc.fillColor(level.color).text(` ${level.count} violations - ${level.status}`, { continued: false });
      doc.moveDown(0.3);
    });
    
    doc.moveDown(1);
    
    // Overall Compliance Status
    const complianceStatus = context.wcagA === 0 && context.wcagAA === 0 ? "COMPLIANT" : "NON-COMPLIANT";
    const statusColor = complianceStatus === "COMPLIANT" ? "#10B981" : "#DC2626";
    
    doc.rect(60, doc.y, 475, 50).fillAndStroke("#F9FAFB", "#E5E7EB");
    doc.fontSize(11).fillColor("#6B7280").text("Overall Compliance Status:", 70, doc.y + 10);
    doc.fontSize(18).fillColor(statusColor).text(complianceStatus, 70, doc.y + 25);
    
    doc.y += 60;
    doc.moveDown(1);
    
    // AI-Generated Compliance Narrative
    doc.addPage();
    doc.fontSize(14).fillColor("#1F2937").text("Detailed Compliance Analysis", { underline: true });
    doc.moveDown(0.5);
    
    const sections = complianceNarrative.split(/\n\n+/);
    
    sections.forEach((section) => {
      if (doc.y > 700) {
        doc.addPage();
      }
      
      const lines = section.split('\n');
      const firstLine = lines[0];
      
      if (firstLine.endsWith(':') || firstLine === firstLine.toUpperCase()) {
        doc.fontSize(13).fillColor("#1F2937").text(firstLine.replace(':', ''), { underline: true });
        doc.moveDown(0.5);
        
        if (lines.length > 1) {
          const content = lines.slice(1).join('\n').trim();
          doc.fontSize(10).fillColor("#374151").text(content, { align: "left", lineGap: 4 });
        }
      } else {
        doc.fontSize(10).fillColor("#374151").text(section, { align: "left", lineGap: 4 });
      }
      
      doc.moveDown(0.8);
    });
    
    // Detailed Violation Breakdown
    doc.addPage();
    doc.fontSize(14).fillColor("#1F2937").text("Detailed Violation Breakdown", { underline: true });
    doc.moveDown(0.5);
    
    ["A", "AA", "AAA"].forEach((level) => {
      const violations = violationsByWCAG[level as keyof typeof violationsByWCAG];
      if (violations.length === 0) return;
      
      if (doc.y > 650) {
        doc.addPage();
      }
      
      doc.fontSize(12).fillColor("#1F2937").text(`WCAG Level ${level} Violations (${violations.length})`, { underline: false });
      doc.moveDown(0.5);
      
      // Group by unique codes
      const uniqueCodes = [...new Set(violations.map(v => v.code))];
      
      uniqueCodes.slice(0, 10).forEach((code) => {
        const codeViolations = violations.filter(v => v.code === code);
        const firstViolation = codeViolations[0];
        
        if (doc.y > 700) {
          doc.addPage();
        }
        
        doc.fontSize(10).fillColor("#374151").text(`• ${code}`, 60, doc.y, { continued: true });
        doc.fillColor("#6B7280").text(` (${codeViolations.length} instance${codeViolations.length !== 1 ? 's' : ''})`, { continued: false });
        doc.fontSize(9).fillColor("#6B7280").text(`  ${firstViolation.description}`, 65, doc.y);
        doc.moveDown(0.5);
      });
      
      if (uniqueCodes.length > 10) {
        doc.fontSize(9).fillColor("#6B7280").text(`  ... and ${uniqueCodes.length - 10} more violation types`, 65, doc.y);
      }
      
      doc.moveDown(1);
    });
    
    // Legal Disclaimer and Certification
    doc.addPage();
    doc.fontSize(14).fillColor("#1F2937").text("Certification and Disclaimer", { underline: true });
    doc.moveDown(0.5);
    
    if (input.isCourtReady) {
      doc.fontSize(10).fillColor("#374151").text(
        "This document has been prepared as a court-ready compliance report using automated accessibility scanning tools and professional analysis. The findings documented herein represent the accessibility compliance status as of the audit date specified. This document may be used for legal proceedings, regulatory compliance filings, and internal compliance documentation.",
        { align: "left", lineGap: 4 }
      );
      doc.moveDown(0.5);
      doc.text(
        "The audit was conducted in accordance with WCAG 2.1 Level AA standards, ADA Title III requirements, and Section 508 guidelines. All findings are based on automated scanning supplemented with AI-powered analysis.",
        { align: "left", lineGap: 4 }
      );
    } else {
      doc.fontSize(10).fillColor("#374151").text(
        "This compliance documentation is based on automated accessibility scanning and AI-powered analysis. While comprehensive, automated tools may not identify all accessibility issues. For complete WCAG 2.1 conformance validation, manual testing by accessibility experts is recommended.",
        { align: "left", lineGap: 4 }
      );
      doc.moveDown(0.5);
      doc.text(
        "This document is intended for internal compliance review and planning purposes. It provides a detailed assessment of the current accessibility status and recommended remediation steps.",
        { align: "left", lineGap: 4 }
      );
    }
    
    doc.moveDown(1);
    doc.strokeColor("#E5E7EB").lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);
    
    doc.fontSize(8).fillColor("#9CA3AF").text(
      `Document ID: COMP-${scan.id}-${Date.now()} | Generated by Lucy Accessibility Platform | ${input.isCourtReady ? "COURT-READY DOCUMENT" : "CONFIDENTIAL"}`,
      { align: "center" }
    );
    
    // Page numbers
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor("#9CA3AF").text(
        `Page ${i + 1} of ${pageCount} | ${input.isCourtReady ? "Court-Ready Document" : "Confidential"}`,
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
    const filename = `compliance-doc-${scan.id}-${Date.now()}.pdf`;
    
    await minioClient.putObject(
      "scan-reports",
      filename,
      pdfBuffer,
      pdfBuffer.length,
      {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="compliance-documentation-${scan.url.project.name}.pdf"`,
      }
    );
    
    // Create legal document record
    const certificateId = `COMP-${scan.id}-${Date.now()}`;
    
    const legalDocument = await db.legalDocument.create({
      data: {
        projectId: scan.url.project.id,
        userId: user.id,
        documentType: "compliance_report",
        title: `${input.isCourtReady ? "Court-Ready " : ""}Compliance Documentation - ${scan.url.project.name}`,
        filename,
        isPremium: input.isCourtReady,
        isCourtReady: input.isCourtReady,
        certificateId,
      },
    });
    
    return {
      success: true,
      filename,
      documentId: legalDocument.id,
      certificateId,
      isCourtReady: input.isCourtReady,
    };
  });
