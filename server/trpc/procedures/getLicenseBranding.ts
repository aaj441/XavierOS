import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";

export const getLicenseBranding = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
    })
  )
  .query(async ({ input }) => {
    const user = await getAuthenticatedUser(input.authToken);
    
    // Check if user has a subscription with white-label access
    const subscription = await db.userSubscription.findUnique({
      where: { userId: user.id },
      include: {
        plan: true,
      },
    });
    
    if (!subscription?.plan.hasWhiteLabel) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "White-label branding is only available for Enterprise customers",
      });
    }
    
    // Fetch the user's license
    const license = await db.license.findFirst({
      where: {
        customerId: user.id,
        status: "active",
        type: "white_label",
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    if (!license) {
      // Return default branding settings if no license exists yet
      return {
        hasLicense: false,
        branding: {
          brandingEnabled: false,
          customDomain: null,
          customLogo: null,
          primaryColor: "#3B82F6", // Default primary color
          secondaryColor: "#8B5CF6", // Default secondary color
          accentColor: "#EC4899", // Default accent color
          logoUrl: null,
        },
      };
    }
    
    return {
      hasLicense: true,
      licenseId: license.id,
      branding: {
        brandingEnabled: license.brandingEnabled,
        customDomain: license.customDomain,
        customLogo: license.customLogo,
        primaryColor: license.primaryColor || "#3B82F6",
        secondaryColor: license.secondaryColor || "#8B5CF6",
        accentColor: license.accentColor || "#EC4899",
        logoUrl: license.logoUrl,
      },
    };
  });
