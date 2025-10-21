import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getAvailablePlans = baseProcedure
  .query(async () => {
    const plans = await db.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { monthlyPrice: "asc" },
    });
    
    return {
      plans: plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        displayName: plan.displayName,
        description: plan.description,
        pricing: {
          monthly: plan.monthlyPrice,
          annual: plan.annualPrice,
          annualSavings: (plan.monthlyPrice * 12) - plan.annualPrice,
        },
        limits: {
          projects: plan.maxProjects,
          urlsPerProject: plan.maxUrlsPerProject,
          scansPerMonth: plan.maxScansPerMonth,
          teamMembers: plan.maxTeamMembers,
        },
        aiCredits: {
          included: plan.includedAiCredits,
          costPerCredit: plan.aiCreditCost,
        },
        features: {
          advancedReports: plan.hasAdvancedReports,
          apiAccess: plan.hasApiAccess,
          prioritySupport: plan.hasPrioritySupport,
          priorityProcessing: plan.hasPriorityProcessing,
          whiteLabel: plan.hasWhiteLabel,
          marketplaceAccess: plan.hasMarketplaceAccess,
          dataVault: plan.hasDataVault,
          distribution: plan.hasDistribution,
          certification: plan.hasCertification,
          enterpriseAudit: plan.hasEnterpriseAudit,
          courtReadyDocuments: plan.courtReadyDocuments,
          complianceInsurance: plan.complianceInsurance,
        },
      })),
    };
  });
