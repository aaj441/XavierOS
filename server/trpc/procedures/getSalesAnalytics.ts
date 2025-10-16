import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";

export const getSalesAnalytics = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      projectId: z.number().optional(),
      timeRange: z.enum(["7d", "30d", "90d", "all"]).default("30d"),
    })
  )
  .query(async ({ input }) => {
    const user = await getAuthenticatedUser(input.authToken);
    
    // Calculate date range
    const now = new Date();
    let startDate: Date | undefined;
    
    if (input.timeRange !== "all") {
      const days = input.timeRange === "7d" ? 7 : input.timeRange === "30d" ? 30 : 90;
      startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    }
    
    // Build where clause
    const whereClause: any = {};
    
    if (input.projectId) {
      // Verify user owns the project
      const project = await db.project.findUnique({
        where: { id: input.projectId },
      });
      
      if (!project || project.ownerId !== user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to access this project",
        });
      }
      
      whereClause.projectId = input.projectId;
    } else {
      // Get all user's projects
      const userProjects = await db.project.findMany({
        where: { ownerId: user.id },
        select: { id: true },
      });
      
      whereClause.projectId = {
        in: userProjects.map(p => p.id),
      };
    }
    
    if (startDate) {
      whereClause.startedAt = { gte: startDate };
    }
    
    // Get all shuffle sessions
    const sessions = await db.shuffleSession.findMany({
      where: whereClause,
      include: {
        companies: {
          include: {
            leads: true,
            salesScript: true,
          },
        },
      },
    });
    
    // Calculate funnel metrics
    const totalSessions = sessions.length;
    const totalDiscovered = sessions.reduce((sum, s) => sum + s.totalSites, 0);
    const totalScanned = sessions.reduce((sum, s) => sum + s.scannedSites, 0);
    const totalCompliant = sessions.reduce((sum, s) => sum + s.compliantSites, 0);
    const totalNonCompliant = sessions.reduce((sum, s) => sum + s.nonCompliantSites, 0);
    const totalLeads = sessions.reduce((sum, s) => sum + s.leadsGenerated, 0);
    
    // Get all companies across sessions
    const allCompanies = sessions.flatMap(s => s.companies);
    
    // Count by contact status
    const contactStatusCounts = {
      not_contacted: allCompanies.filter(c => c.contactStatus === "not_contacted").length,
      contacted: allCompanies.filter(c => c.contactStatus === "contacted").length,
      responded: allCompanies.filter(c => c.contactStatus === "responded").length,
      scheduled: allCompanies.filter(c => c.contactStatus === "scheduled").length,
      closed_won: allCompanies.filter(c => c.contactStatus === "closed_won").length,
      closed_lost: allCompanies.filter(c => c.contactStatus === "closed_lost").length,
    };
    
    // Count companies with scripts
    const companiesWithScripts = allCompanies.filter(c => c.salesScriptId !== null).length;
    
    // Calculate conversion rates
    const scanConversionRate = totalDiscovered > 0 ? (totalScanned / totalDiscovered) * 100 : 0;
    const nonCompliantRate = totalScanned > 0 ? (totalNonCompliant / totalScanned) * 100 : 0;
    const leadExtractionRate = totalNonCompliant > 0 ? (totalLeads / totalNonCompliant) : 0;
    const scriptGenerationRate = totalNonCompliant > 0 ? (companiesWithScripts / totalNonCompliant) * 100 : 0;
    const contactRate = totalNonCompliant > 0 
      ? ((contactStatusCounts.contacted + contactStatusCounts.responded + contactStatusCounts.scheduled + contactStatusCounts.closed_won) / totalNonCompliant) * 100 
      : 0;
    const closeRate = (contactStatusCounts.contacted + contactStatusCounts.responded + contactStatusCounts.scheduled) > 0
      ? (contactStatusCounts.closed_won / (contactStatusCounts.contacted + contactStatusCounts.responded + contactStatusCounts.scheduled + contactStatusCounts.closed_won + contactStatusCounts.closed_lost)) * 100
      : 0;
    
    // Get industry/category breakdown
    const categoryBreakdown: Record<string, number> = {};
    sessions.forEach(s => {
      categoryBreakdown[s.category] = (categoryBreakdown[s.category] || 0) + s.nonCompliantSites;
    });
    
    // Calculate average risk scores
    const companiesWithRisk = allCompanies.filter(c => c.riskScore !== null);
    const avgRiskScore = companiesWithRisk.length > 0
      ? Math.round(companiesWithRisk.reduce((sum, c) => sum + (c.riskScore || 0), 0) / companiesWithRisk.length)
      : 0;
    
    // Get top opportunities (highest risk, not yet contacted)
    const topOpportunities = allCompanies
      .filter(c => c.contactStatus === "not_contacted" && c.riskScore !== null)
      .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0))
      .slice(0, 10)
      .map(c => ({
        companyId: c.id,
        companyName: c.companyName,
        websiteUrl: c.websiteUrl,
        riskScore: c.riskScore,
        totalIssues: c.totalIssues,
        leadsCount: c.leads.length,
      }));
    
    return {
      funnel: {
        totalSessions,
        totalDiscovered,
        totalScanned,
        totalCompliant,
        totalNonCompliant,
        totalLeads,
        companiesWithScripts,
      },
      conversionRates: {
        scanConversionRate: Math.round(scanConversionRate),
        nonCompliantRate: Math.round(nonCompliantRate),
        leadExtractionRate: Math.round(leadExtractionRate * 100) / 100, // Leads per company
        scriptGenerationRate: Math.round(scriptGenerationRate),
        contactRate: Math.round(contactRate),
        closeRate: Math.round(closeRate),
      },
      contactStatus: contactStatusCounts,
      categoryBreakdown,
      avgRiskScore,
      topOpportunities,
    };
  });
