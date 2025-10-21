import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";
import { minioClient } from "~/server/minio";
import crypto from "crypto";

export const generateCertificate = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      projectId: z.number(),
      certificateType: z.enum(["wcag_aa", "wcag_aaa", "ada_compliant", "section_508"]).default("wcag_aa"),
      businessName: z.string().optional(),
      badgeColor: z.string().optional(), // Hex color code
    })
  )
  .mutation(async ({ input }) => {
    const user = await getAuthenticatedUser(input.authToken);
    
    // Verify user owns the project
    const project = await db.project.findUnique({
      where: { id: input.projectId },
      include: {
        urls: {
          include: {
            scans: {
              include: {
                reports: true,
                violations: true,
              },
              orderBy: { startedAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });
    
    if (!project || project.ownerId !== user.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to generate certificates for this project",
      });
    }
    
    // Check if project has recent scans
    const recentScans = project.urls.flatMap(url => url.scans).filter(scan => scan.reports.length > 0);
    
    if (recentScans.length === 0) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Project must have at least one completed scan to generate a certificate",
      });
    }
    
    // Calculate overall compliance score
    const totalIssues = recentScans.reduce((sum, scan) => sum + (scan.reports[0]?.totalIssues || 0), 0);
    const avgRiskScore = Math.round(
      recentScans.reduce((sum, scan) => sum + (scan.reports[0]?.riskScore || 0), 0) / recentScans.length
    );
    
    // Check if meets certification threshold (risk score < 30 = compliant)
    if (avgRiskScore >= 30) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: `Project does not meet certification threshold. Current risk score: ${avgRiskScore}/100. Required: < 30/100`,
      });
    }
    
    // Generate unique certificate ID
    const certificateId = `WCAG-${input.certificateType.toUpperCase()}-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    
    // Calculate expiry date (1 year from now)
    const issuedDate = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    
    // Count resolved issues
    const issuesResolved = recentScans.reduce((sum, scan) => {
      const criticalResolved = (scan.reports[0]?.criticalIssues || 0) === 0 ? 1 : 0;
      const seriousResolved = (scan.reports[0]?.seriousIssues || 0) === 0 ? 1 : 0;
      return sum + criticalResolved + seriousResolved;
    }, 0);
    
    // Generate digital signature (hash of certificate data)
    const signatureData = `${certificateId}-${project.id}-${issuedDate.toISOString()}-${avgRiskScore}`;
    const digitalSignature = crypto.createHash("sha256").update(signatureData).digest("hex");
    
    // Create certificate record
    const certificate = await db.complianceCertificate.create({
      data: {
        projectId: input.projectId,
        certificateType: input.certificateType,
        certificateId,
        auditDate: issuedDate,
        auditScore: 100 - avgRiskScore, // Convert risk score to compliance score
        issuesFound: totalIssues,
        issuesResolved,
        issuedDate,
        expiryDate,
        isValid: true,
        digitalSignature,
        verificationHash: crypto.createHash("md5").update(certificateId).digest("hex"),
      },
    });
    
    // Generate certificate PDF (simplified - in production, use a proper PDF library)
    const certificateContent = `
      WCAG Compliance Certificate
      Certificate ID: ${certificateId}
      
      This certifies that ${input.businessName || project.name}
      has met the ${input.certificateType.replace("_", " ").toUpperCase()} standards
      for web accessibility.
      
      Audit Score: ${100 - avgRiskScore}/100
      Issues Found: ${totalIssues}
      Issues Resolved: ${issuesResolved}
      
      Issued: ${issuedDate.toLocaleDateString()}
      Valid Until: ${expiryDate.toLocaleDateString()}
      
      Verification: ${certificate.verificationHash}
      Digital Signature: ${digitalSignature}
    `;
    
    const filename = `certificate-${certificateId}.txt`;
    const buffer = Buffer.from(certificateContent, "utf-8");
    
    await minioClient.putObject("scan-reports", filename, buffer, buffer.length, {
      "Content-Type": "text/plain",
    });
    
    // Update certificate with file URL
    await db.complianceCertificate.update({
      where: { id: certificate.id },
      data: {
        certificateUrl: filename,
      },
    });
    
    return {
      certificateId: certificate.certificateId,
      filename,
      auditScore: certificate.auditScore,
      issuedDate: certificate.issuedDate,
      expiryDate: certificate.expiryDate,
      verificationHash: certificate.verificationHash,
      badgeHtml: `<div style="display:inline-block;padding:12px 20px;background:linear-gradient(135deg,${input.badgeColor || "#3B82F6"},#8B5CF6);color:white;border-radius:8px;font-weight:bold;text-align:center;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
        <div style="font-size:14px;">WCAG ${input.certificateType.split("_")[1]?.toUpperCase() || "AA"} Certified</div>
        <div style="font-size:11px;margin-top:4px;opacity:0.9;">Score: ${certificate.auditScore}/100</div>
      </div>`,
    };
  });
