import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";
import { minioClient, minioBaseUrl } from "~/server/minio";
import { sendEmail } from "~/server/utils/email";

export const shareReportByEmail = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      documentId: z.number(),
      recipients: z.array(z.string().email()).min(1).max(10),
      message: z.string().optional(),
      includeLink: z.boolean().default(true),
    })
  )
  .mutation(async ({ input }) => {
    const user = await getAuthenticatedUser(input.authToken);
    
    // Fetch the document and verify ownership
    const document = await db.legalDocument.findUnique({
      where: { id: input.documentId },
      include: {
        project: true,
        user: true,
      },
    });
    
    if (!document) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Document not found",
      });
    }
    
    // Verify user has access to this document
    const hasAccess = 
      document.userId === user.id || 
      (document.project && document.project.ownerId === user.id);
    
    if (!hasAccess) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to share this document",
      });
    }

    // Generate presigned URL (valid for 7 days)
    const expirySeconds = 7 * 24 * 60 * 60; // 7 days
    
    let documentUrl = "";
    if (input.includeLink) {
      try {
        documentUrl = await minioClient.presignedGetObject(
          "scan-reports",
          document.filename,
          expirySeconds
        );
      } catch (error) {
        console.error("Failed to generate presigned URL:", error);
        // Fallback to direct URL if presigned fails
        documentUrl = `${minioBaseUrl}/scan-reports/${document.filename}`;
      }
    }

    // Send email to each recipient
    const emailPromises = input.recipients.map(async (recipient) => {
      const subject = `Accessibility Report: ${document.title}`;
      
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 30px; 
                text-align: center; 
                border-radius: 8px 8px 0 0; 
              }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .document-info {
                background: white;
                border-left: 4px solid #667eea;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .button { 
                display: inline-block; 
                padding: 12px 24px; 
                background: #667eea; 
                color: white; 
                text-decoration: none; 
                border-radius: 6px; 
                margin: 20px 0;
                font-weight: bold;
              }
              .footer { 
                text-align: center; 
                color: #666; 
                font-size: 12px; 
                margin-top: 30px; 
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
              }
              .message-box {
                background: #fff;
                border: 1px solid #e5e7eb;
                padding: 15px;
                margin: 15px 0;
                border-radius: 6px;
                font-style: italic;
                color: #6b7280;
              }
              .badge {
                display: inline-block;
                padding: 4px 12px;
                background: #dc2626;
                color: white;
                font-size: 11px;
                font-weight: bold;
                border-radius: 4px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📊 Accessibility Report Shared</h1>
                <p>You've received an accessibility compliance report</p>
              </div>
              <div class="content">
                <p>Hello,</p>
                <p><strong>${user.name}</strong> has shared an accessibility report with you.</p>
                
                <div class="document-info">
                  <h3 style="margin-top: 0; color: #1f2937;">
                    ${document.title}
                    ${document.isCourtReady ? '<span class="badge">Court-Ready</span>' : ''}
                  </h3>
                  <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                    <strong>Document Type:</strong> ${document.documentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                  ${document.project ? `<p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                    <strong>Project:</strong> ${document.project.name}
                  </p>` : ''}
                  <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                    <strong>Generated:</strong> ${document.generatedAt.toLocaleDateString()}
                  </p>
                </div>
                
                ${input.message ? `
                <div class="message-box">
                  <strong>Message from ${user.name}:</strong><br>
                  ${input.message}
                </div>
                ` : ''}
                
                ${input.includeLink ? `
                <div style="text-align: center;">
                  <a href="${documentUrl}" class="button">View Report</a>
                </div>
                <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                  This link will expire in 7 days
                </p>
                ` : `
                <p style="color: #6b7280;">
                  The report has been shared with you. Please contact ${user.name} directly to access the document.
                </p>
                `}
                
                ${document.isCourtReady ? `
                <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 15px; margin: 20px 0; border-radius: 6px;">
                  <p style="margin: 0; color: #991b1b; font-size: 13px;">
                    <strong>⚠️ Legal Document Notice:</strong> This is a court-ready compliance document prepared with legally precise language. Handle this document with appropriate confidentiality and consult with legal counsel regarding its use in proceedings or regulatory filings.
                  </p>
                </div>
                ` : ''}
                
                <div class="footer">
                  <p>This report was generated using Lucy Accessibility Platform</p>
                  <p>For questions about this report, please contact ${user.email}</p>
                  <p style="margin-top: 15px; color: #9ca3af;">
                    This email was sent because ${user.name} shared a report with you.<br>
                    If you believe you received this in error, please contact the sender.
                  </p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;
      
      await sendEmail({
        to: recipient,
        subject,
        html,
      });
    });
    
    await Promise.all(emailPromises);

    return {
      success: true,
      recipientCount: input.recipients.length,
      documentTitle: document.title,
      expiresIn: input.includeLink ? "7 days" : null,
    };
  });
