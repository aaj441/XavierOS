import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { generateText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";
import { env } from "~/server/env";

export const generateAccessibilityStatement = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      projectId: z.number(),
      contactEmail: z.string().email().optional(),
      isPremium: z.boolean().default(false),
    })
  )
  .mutation(async ({ input }) => {
    const user = await getAuthenticatedUser(input.authToken);
    
    // Fetch project with latest scan data
    const project = await db.project.findUnique({
      where: { id: input.projectId },
      include: {
        urls: {
          include: {
            scans: {
              where: { status: "completed" },
              orderBy: { startedAt: "desc" },
              take: 1,
              include: {
                violations: {
                  orderBy: { severity: "desc" },
                  take: 10, // Top 10 issues
                },
                reports: true,
              },
            },
          },
        },
      },
    });
    
    if (!project || project.ownerId !== user.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to access this project",
      });
    }
    
    // Gather violation data for the statement
    const allViolations: Array<{ code: string; description: string; severity: string }> = [];
    project.urls.forEach(url => {
      url.scans.forEach(scan => {
        scan.violations.forEach(v => {
          allViolations.push({
            code: v.code,
            description: v.description,
            severity: v.severity,
          });
        });
      });
    });
    
    // Count violations by severity
    const criticalCount = allViolations.filter(v => v.severity === "critical").length;
    const seriousCount = allViolations.filter(v => v.severity === "serious").length;
    const moderateCount = allViolations.filter(v => v.severity === "moderate").length;
    
    // Prepare prompt for AI
    const premiumContext = input.isPremium
      ? "This is a PREMIUM legally-reviewed statement. Use precise legal terminology and include specific references to ADA Title III, WCAG 2.1 Level AA standards, and demonstrate clear good-faith compliance efforts. The language should be suitable for presentation in legal proceedings."
      : "This is a standard accessibility statement. Use clear, professional language.";
    
    const violationContext = allViolations.length > 0
      ? `The website currently has ${allViolations.length} identified accessibility issues: ${criticalCount} critical, ${seriousCount} serious, and ${moderateCount} moderate. The top issues include: ${allViolations.slice(0, 5).map(v => v.code).join(", ")}.`
      : "The website has been audited and no significant accessibility barriers were identified.";
    
    const prompt = `Generate a professional accessibility statement for a website. ${premiumContext}

Project: ${project.name}
Contact Email: ${input.contactEmail || user.email}
Current Status: ${violationContext}

The statement should:
1. Acknowledge commitment to WCAG 2.1 Level AA standards
2. Document the current accessibility status honestly
3. If there are known issues, provide a realistic remediation timeline (30-90 days for critical issues)
4. Include contact information for accessibility concerns
5. Reference the use of automated scanning tools (Lucy Accessibility Platform)
6. Demonstrate good faith compliance efforts
7. Be suitable for display on the website footer

Format the statement in clear paragraphs. Do not use markdown formatting. Keep it professional and legally sound.`;
    
    // Generate the statement using AI
    const openrouter = createOpenRouter({
      apiKey: env.OPENROUTER_API_KEY,
    });
    
    const { text } = await generateText({
      model: openrouter("anthropic/claude-3.5-sonnet"),
      prompt,
      temperature: 0.3, // Lower temperature for more consistent, professional output
    });
    
    // Deactivate previous statements
    await db.accessibilityStatement.updateMany({
      where: {
        projectId: project.id,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });
    
    // Create new statement
    const statement = await db.accessibilityStatement.create({
      data: {
        projectId: project.id,
        content: text,
        wcagLevel: "AA",
        contactEmail: input.contactEmail || user.email,
        isPremium: input.isPremium,
        isActive: true,
        version: 1,
      },
    });
    
    return {
      success: true,
      statement: {
        id: statement.id,
        content: statement.content,
        lastUpdated: statement.lastUpdated,
        isPremium: statement.isPremium,
      },
    };
  });
