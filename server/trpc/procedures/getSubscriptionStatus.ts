import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";

export const getSubscriptionStatus = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
    })
  )
  .query(async ({ input }) => {
    const user = await getAuthenticatedUser(input.authToken);
    
    // Fetch subscription with plan details
    const subscription = await db.userSubscription.findUnique({
      where: { userId: user.id },
      include: {
        plan: true,
      },
    });
    
    // Fetch AI credit balance
    const creditBalance = await db.aiCreditBalance.findUnique({
      where: { userId: user.id },
    });
    
    // If no subscription, return free tier defaults
    if (!subscription) {
      return {
        hasSubscription: false,
        plan: {
          name: "free",
          displayName: "Free",
          features: {
            maxProjects: 1,
            maxUrlsPerProject: 5,
            maxScansPerMonth: 10,
            maxTeamMembers: 1,
            hasAdvancedReports: false,
            hasApiAccess: false,
            hasPrioritySupport: false,
            hasPriorityProcessing: false,
            hasWhiteLabel: false,
            hasMarketplaceAccess: true,
            hasDataVault: false,
            hasDistribution: false,
            hasCertification: false,
            hasEnterpriseAudit: false,
            courtReadyDocuments: false,
            complianceInsurance: false,
          },
        },
        usage: {
          projectsUsed: 0,
          scansThisMonth: 0,
        },
        aiCredits: {
          balance: creditBalance?.balance || 0,
          totalEarned: creditBalance?.totalEarned || 0,
          totalSpent: creditBalance?.totalSpent || 0,
        },
        billing: null,
      };
    }
    
    return {
      hasSubscription: true,
      plan: {
        name: subscription.plan.name,
        displayName: subscription.plan.displayName,
        description: subscription.plan.description,
        pricing: {
          monthly: subscription.plan.monthlyPrice,
          annual: subscription.plan.annualPrice,
        },
        features: {
          maxProjects: subscription.plan.maxProjects,
          maxUrlsPerProject: subscription.plan.maxUrlsPerProject,
          maxScansPerMonth: subscription.plan.maxScansPerMonth,
          maxTeamMembers: subscription.plan.maxTeamMembers,
          includedAiCredits: subscription.plan.includedAiCredits,
          hasAdvancedReports: subscription.plan.hasAdvancedReports,
          hasApiAccess: subscription.plan.hasApiAccess,
          hasPrioritySupport: subscription.plan.hasPrioritySupport,
          hasPriorityProcessing: subscription.plan.hasPriorityProcessing,
          hasWhiteLabel: subscription.plan.hasWhiteLabel,
          hasMarketplaceAccess: subscription.plan.hasMarketplaceAccess,
          hasDataVault: subscription.plan.hasDataVault,
          hasDistribution: subscription.plan.hasDistribution,
          hasCertification: subscription.plan.hasCertification,
          hasEnterpriseAudit: subscription.plan.hasEnterpriseAudit,
          courtReadyDocuments: subscription.plan.courtReadyDocuments,
          complianceInsurance: subscription.plan.complianceInsurance,
        },
      },
      usage: {
        projectsUsed: subscription.projectsUsed,
        scansThisMonth: subscription.scansThisMonth,
        lastUsageReset: subscription.lastUsageReset,
      },
      aiCredits: {
        balance: creditBalance?.balance || 0,
        totalEarned: creditBalance?.totalEarned || 0,
        totalSpent: creditBalance?.totalSpent || 0,
        lastRefill: creditBalance?.lastRefill,
      },
      billing: {
        status: subscription.status,
        billingCycle: subscription.billingCycle,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelledAt: subscription.cancelledAt,
      },
    };
  });
