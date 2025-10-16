import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";

export const getShuffleDetails = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      sessionId: z.number(),
    })
  )
  .query(async ({ input }) => {
    const user = await getAuthenticatedUser(input.authToken);
    
    const session = await db.shuffleSession.findUnique({
      where: { id: input.sessionId },
      include: {
        project: true,
        companies: {
          include: {
            leads: true,
            hubspotIntegration: true,
            url: {
              include: {
                scans: {
                  orderBy: { startedAt: "desc" },
                  take: 1,
                  include: {
                    reports: true,
                  },
                },
              },
            },
          },
          orderBy: { discoveredAt: "asc" },
        },
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
        message: "You don't have permission to view this shuffle session",
      });
    }
    
    return {
      id: session.id,
      category: session.category,
      demographics: session.demographics,
      status: session.status,
      totalSites: session.totalSites,
      scannedSites: session.scannedSites,
      compliantSites: session.compliantSites,
      nonCompliantSites: session.nonCompliantSites,
      leadsGenerated: session.leadsGenerated,
      startedAt: session.startedAt,
      finishedAt: session.finishedAt,
      errorMessage: session.errorMessage,
      projectName: session.project.name,
      companies: session.companies.map((company) => ({
        id: company.id,
        companyName: company.companyName,
        websiteUrl: company.websiteUrl,
        scanStatus: company.scanStatus,
        isCompliant: company.isCompliant,
        riskScore: company.riskScore,
        totalIssues: company.totalIssues,
        scannedAt: company.scannedAt,
        discoveredAt: company.discoveredAt,
        scanId: company.url?.scans[0]?.id,
        leads: company.leads.map((lead) => ({
          id: lead.id,
          name: lead.name,
          title: lead.title,
          linkedinUrl: lead.linkedinUrl,
          email: lead.email,
          phone: lead.phone,
        })),
        hubspotIntegration: company.hubspotIntegration ? {
          hubspotCompanyId: company.hubspotIntegration.hubspotCompanyId,
          syncStatus: company.hubspotIntegration.syncStatus,
          syncedAt: company.hubspotIntegration.syncedAt,
        } : null,
      })),
    };
  });
