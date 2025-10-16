import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { generateText } from "ai";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";

export const generateScriptForCompany = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      companyId: z.number(),
      tone: z.enum(["professional", "friendly", "urgent"]).default("professional"),
    })
  )
  .mutation(async ({ input }) => {
    const user = await getAuthenticatedUser(input.authToken);
    
    // Fetch company details with scan results
    const company = await db.discoveredCompany.findUnique({
      where: { id: input.companyId },
      include: {
        url: {
          include: {
            scans: {
              include: {
                violations: true,
                reports: true,
              },
              orderBy: { startedAt: "desc" },
              take: 1,
            },
          },
        },
        leads: true,
        shuffleSession: {
          include: {
            project: true,
          },
        },
      },
    });
    
    if (!company) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Company not found",
      });
    }
    
    // Verify user owns the project
    if (company.shuffleSession.project.ownerId !== user.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to generate scripts for this company",
      });
    }
    
    if (!company.url || !company.url.scans[0]) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Company has not been scanned yet",
      });
    }
    
    const scan = company.url.scans[0];
    const report = scan.reports[0];
    
    if (!report) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Scan report not available",
      });
    }
    
    // Get top violations
    const topViolations = scan.violations
      .filter(v => v.severity === "critical" || v.severity === "serious")
      .slice(0, 5);
    
    // Build tone-specific prompts
    const toneInstructions = {
      professional: "Use a formal, business-appropriate tone. Focus on compliance, risk mitigation, and professional standards.",
      friendly: "Use a warm, helpful tone. Emphasize partnership and mutual benefit. Be conversational but respectful.",
      urgent: "Use a direct, action-oriented tone. Emphasize immediate risks, legal implications, and time-sensitive nature.",
    };
    
    // Generate script using AI
    const model = openrouter("anthropic/claude-3.5-sonnet");
    
    const { text } = await generateText({
      model,
      prompt: `Generate a personalized sales outreach email for ${company.companyName} (${company.websiteUrl}).

Context:
- Company: ${company.companyName}
- Website: ${company.websiteUrl}
- Accessibility Risk Score: ${company.riskScore}/100 (${company.riskScore && company.riskScore >= 70 ? "HIGH RISK" : company.riskScore && company.riskScore >= 40 ? "MEDIUM RISK" : "LOW RISK"})
- Total Issues Found: ${company.totalIssues}
- Critical Issues: ${topViolations.filter(v => v.severity === "critical").length}
- Serious Issues: ${topViolations.filter(v => v.severity === "serious").length}

Top Violations:
${topViolations.map((v, i) => `${i + 1}. ${v.description} (${v.severity}, WCAG ${v.wcagLevel})`).join("\n")}

${company.leads.length > 0 ? `Decision Makers:
${company.leads.map(l => `- ${l.name}, ${l.title}`).join("\n")}` : ""}

Tone: ${toneInstructions[input.tone]}

Generate a compelling email that:
1. Opens with a personalized greeting (use decision-maker name if available)
2. Mentions their website specifically
3. Highlights the accessibility risks found (be specific but not overwhelming)
4. Explains the business impact (legal risk, user exclusion, lost revenue)
5. Offers a clear solution and next steps
6. Includes a strong call-to-action
7. Closes professionally

Keep the email concise (300-400 words) and actionable. Make it feel personal, not like a template.`,
    });
    
    // Save the script and link it to the company
    const salesScript = await db.salesScript.create({
      data: {
        projectId: company.shuffleSession.projectId,
        content: text,
        tone: input.tone,
      },
    });
    
    // Link the script to the company
    await db.discoveredCompany.update({
      where: { id: input.companyId },
      data: { salesScriptId: salesScript.id },
    });
    
    // Log the action
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "sales_script_generated",
        resourceType: "company",
        resourceId: input.companyId,
        description: `Generated ${input.tone} sales script for ${company.companyName}`,
        metadata: JSON.stringify({
          companyName: company.companyName,
          tone: input.tone,
          scriptId: salesScript.id,
        }),
        success: true,
      },
    });
    
    return {
      scriptId: salesScript.id,
      content: text,
      companyName: company.companyName,
      riskScore: company.riskScore,
      totalIssues: company.totalIssues,
    };
  });
