import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";

export interface FeatureAccess {
  hasAccess: boolean;
  planName: string;
  requiredPlan?: string;
  message?: string;
}

export async function checkFeatureAccess(
  userId: number,
  feature: keyof typeof FEATURE_REQUIREMENTS
): Promise<FeatureAccess> {
  const subscription = await db.userSubscription.findUnique({
    where: { userId },
    include: { plan: true },
  });
  
  const requirement = FEATURE_REQUIREMENTS[feature];
  
  // If no subscription, user is on free plan
  if (!subscription) {
    return {
      hasAccess: requirement.allowedPlans.includes("free"),
      planName: "free",
      requiredPlan: requirement.allowedPlans[0],
      message: requirement.message,
    };
  }
  
  const hasAccess = requirement.allowedPlans.includes(subscription.plan.name);
  
  return {
    hasAccess,
    planName: subscription.plan.name,
    requiredPlan: hasAccess ? undefined : requirement.allowedPlans[0],
    message: hasAccess ? undefined : requirement.message,
  };
}

export async function requireFeatureAccess(
  userId: number,
  feature: keyof typeof FEATURE_REQUIREMENTS
): Promise<void> {
  const access = await checkFeatureAccess(userId, feature);
  
  if (!access.hasAccess) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: access.message || `This feature requires ${access.requiredPlan} plan or higher`,
    });
  }
}

export async function getUserPlanFeatures(userId: number) {
  const subscription = await db.userSubscription.findUnique({
    where: { userId },
    include: { plan: true },
  });
  
  if (!subscription) {
    // Return free plan defaults
    return {
      planName: "free",
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
    };
  }
  
  return {
    planName: subscription.plan.name,
    maxProjects: subscription.plan.maxProjects,
    maxUrlsPerProject: subscription.plan.maxUrlsPerProject,
    maxScansPerMonth: subscription.plan.maxScansPerMonth,
    maxTeamMembers: subscription.plan.maxTeamMembers,
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
  };
}

// Define feature requirements
const FEATURE_REQUIREMENTS = {
  advancedReports: {
    allowedPlans: ["professional", "enterprise"],
    message: "Advanced reports are available on Professional and Enterprise plans",
  },
  apiAccess: {
    allowedPlans: ["professional", "enterprise"],
    message: "API access is available on Professional and Enterprise plans",
  },
  reportScheduling: {
    allowedPlans: ["solo", "professional", "enterprise"],
    message: "Report scheduling is available on Solo, Professional, and Enterprise plans",
  },
  engagementAnalytics: {
    allowedPlans: ["professional", "enterprise"],
    message: "Engagement analytics are available on Professional and Enterprise plans",
  },
  whiteLabel: {
    allowedPlans: ["enterprise"],
    message: "White label branding is available on Enterprise plan",
  },
  courtReadyDocuments: {
    allowedPlans: ["professional", "enterprise"],
    message: "Court-ready documents are available on Professional and Enterprise plans",
  },
  complianceInsurance: {
    allowedPlans: ["enterprise"],
    message: "Compliance insurance is available on Enterprise plan",
  },
  priorityProcessing: {
    allowedPlans: ["professional", "enterprise"],
    message: "Priority processing is available on Professional and Enterprise plans",
  },
  dataVault: {
    allowedPlans: ["professional", "enterprise"],
    message: "Data vault is available on Professional and Enterprise plans",
  },
  certification: {
    allowedPlans: ["professional", "enterprise"],
    message: "Compliance certification is available on Professional and Enterprise plans",
  },
  enterpriseAudit: {
    allowedPlans: ["enterprise"],
    message: "Enterprise audit logging is available on Enterprise plan",
  },
} as const;
