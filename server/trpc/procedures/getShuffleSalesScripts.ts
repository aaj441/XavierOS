import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";

export const getShuffleSalesScripts = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      sessionId: z.number(),
    })
  )
  .query(async ({ input }) => {
    const user = await getAuthenticatedUser(input.authToken);
    
    // Verify user owns the shuffle session
    const session = await db.shuffleSession.findUnique({
      where: { id: input.sessionId },
      include: {
        project: true,
      },
    });
    
    if (!session) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Shuffle session not found",
      });
    }
    
    if (session.project.ownerId !== user.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to access this shuffle session",
      });
    }
    
    // Get all companies with their sales scripts
    const companies = await db.discoveredCompany.findMany({
      where: {
        shuffleSessionId: input.sessionId,
        salesScriptId: { not: null },
      },
      include: {
        salesScript: true,
        leads: true,
      },
      orderBy: {
        riskScore: "desc",
      },
    });
    
    return companies.map((company) => ({
      companyId: company.id,
      companyName: company.companyName,
      websiteUrl: company.websiteUrl,
      riskScore: company.riskScore,
      totalIssues: company.totalIssues,
      contactStatus: company.contactStatus,
      contactedAt: company.contactedAt,
      notes: company.notes,
      script: company.salesScript ? {
        id: company.salesScript.id,
        content: company.salesScript.content,
        tone: company.salesScript.tone,
        generatedAt: company.salesScript.generatedAt,
      } : null,
      leads: company.leads.map((lead) => ({
        id: lead.id,
        name: lead.name,
        title: lead.title,
        email: lead.email,
        linkedinUrl: lead.linkedinUrl,
      })),
    }));
  });
