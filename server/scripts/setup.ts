import { db } from "~/server/db";
import { minioClient } from "~/server/minio";
import { startScheduler } from "~/server/scripts/scheduler";
import { seedLawsuitData } from "~/server/scripts/seedLawsuitData";

async function seedSubscriptionPlans() {
  console.log("Seeding subscription plans...");
  
  const plans = [
    {
      name: "free",
      displayName: "Free",
      description: "Perfect for trying out Lucy and small projects",
      monthlyPrice: 0,
      annualPrice: 0,
      maxProjects: 1,
      maxUrlsPerProject: 5,
      maxScansPerMonth: 10,
      maxTeamMembers: 1,
      includedAiCredits: 0,
      aiCreditCost: 10, // 10 cents per credit
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
    {
      name: "solo",
      displayName: "Solo",
      description: "For individual creators and small businesses",
      monthlyPrice: 4900, // $49/month
      annualPrice: 47040, // $392/year (20% off)
      maxProjects: 5,
      maxUrlsPerProject: 20,
      maxScansPerMonth: 100,
      maxTeamMembers: 1,
      includedAiCredits: 50,
      aiCreditCost: 8, // 8 cents per credit
      hasAdvancedReports: true,
      hasApiAccess: false,
      hasPrioritySupport: false,
      hasPriorityProcessing: false,
      hasWhiteLabel: false,
      hasMarketplaceAccess: true,
      hasDataVault: true,
      hasDistribution: false,
      hasCertification: false,
      hasEnterpriseAudit: false,
      courtReadyDocuments: false,
      complianceInsurance: false,
    },
    {
      name: "professional",
      displayName: "Professional",
      description: "For agencies and growing businesses needing compliance",
      monthlyPrice: 19900, // $199/month
      annualPrice: 191040, // $1,592/year (20% off)
      maxProjects: -1, // Unlimited
      maxUrlsPerProject: -1, // Unlimited
      maxScansPerMonth: -1, // Unlimited
      maxTeamMembers: 5,
      includedAiCredits: 200,
      aiCreditCost: 5, // 5 cents per credit
      hasAdvancedReports: true,
      hasApiAccess: true,
      hasPrioritySupport: true,
      hasPriorityProcessing: true,
      hasWhiteLabel: false,
      hasMarketplaceAccess: true,
      hasDataVault: true,
      hasDistribution: true,
      hasCertification: true,
      hasEnterpriseAudit: false,
      courtReadyDocuments: true,
      complianceInsurance: false,
    },
    {
      name: "enterprise",
      displayName: "Enterprise",
      description: "For large organizations requiring white-label and insurance",
      monthlyPrice: 49900, // $499/month
      annualPrice: 479040, // $3,992/year (20% off)
      maxProjects: -1, // Unlimited
      maxUrlsPerProject: -1, // Unlimited
      maxScansPerMonth: -1, // Unlimited
      maxTeamMembers: -1, // Unlimited
      includedAiCredits: 1000,
      aiCreditCost: 3, // 3 cents per credit
      hasAdvancedReports: true,
      hasApiAccess: true,
      hasPrioritySupport: true,
      hasPriorityProcessing: true,
      hasWhiteLabel: true,
      hasMarketplaceAccess: true,
      hasDataVault: true,
      hasDistribution: true,
      hasCertification: true,
      hasEnterpriseAudit: true,
      courtReadyDocuments: true,
      complianceInsurance: true,
    },
  ];
  
  for (const plan of plans) {
    const existing = await db.subscriptionPlan.findUnique({
      where: { name: plan.name },
    });
    
    if (!existing) {
      await db.subscriptionPlan.create({ data: plan });
      console.log(`Created subscription plan: ${plan.displayName}`);
    } else {
      // Update existing plan with latest pricing/features
      await db.subscriptionPlan.update({
        where: { name: plan.name },
        data: plan,
      });
      console.log(`Updated subscription plan: ${plan.displayName}`);
    }
  }
  
  console.log("Subscription plans seeded successfully");
}

async function setup() {
  // Create scan-reports bucket if it doesn't exist
  const bucketName = "scan-reports";
  const bucketExists = await minioClient.bucketExists(bucketName);

  if (!bucketExists) {
    console.log(`Creating bucket: ${bucketName}`);
    await minioClient.makeBucket(bucketName);
    
    // Set public read policy for the bucket (all objects and public prefix)
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { AWS: ["*"] },
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    };
    
    await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
    console.log(`Bucket ${bucketName} created with public read policy`);
  } else {
    console.log(`Bucket ${bucketName} already exists`);
    
    // Ensure the policy is up to date to support public branding assets
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { AWS: ["*"] },
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    };
    
    await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
    console.log(`Updated bucket ${bucketName} policy for public access`);
  }
  
  // Seed lawsuit data for risk calculations
  await seedLawsuitData();
  
  // Seed subscription plans for monetization
  await seedSubscriptionPlans();
  
  // Start the background scheduler for automated scans
  startScheduler();
}

setup()
  .then(() => {
    console.log("setup.ts complete");
    // Don't exit - keep process running for scheduler
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
