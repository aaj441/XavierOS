import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";

export const updateLicenseBranding = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      brandingEnabled: z.boolean(),
      customDomain: z.string().nullable().optional(),
      customLogo: z.string().nullable().optional(),
      primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional(),
      secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional(),
      accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional(),
      logoUrl: z.string().nullable().optional(),
    })
  )
  .mutation(async ({ input }) => {
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
    
    // Find or create license
    let license = await db.license.findFirst({
      where: {
        customerId: user.id,
        status: "active",
        type: "white_label",
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    const brandingData = {
      brandingEnabled: input.brandingEnabled,
      customDomain: input.customDomain,
      customLogo: input.customLogo,
      primaryColor: input.primaryColor,
      secondaryColor: input.secondaryColor,
      accentColor: input.accentColor,
      logoUrl: input.logoUrl,
    };
    
    if (!license) {
      // Create a new license if one doesn't exist
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      
      license = await db.license.create({
        data: {
          customerId: user.id,
          type: "white_label",
          tier: "enterprise",
          annualFee: 0, // Set based on subscription
          status: "active",
          startDate: new Date(),
          endDate: oneYearFromNow,
          ...brandingData,
        },
      });
    } else {
      // Update existing license
      license = await db.license.update({
        where: { id: license.id },
        data: brandingData,
      });
    }
    
    return {
      success: true,
      licenseId: license.id,
      branding: {
        brandingEnabled: license.brandingEnabled,
        customDomain: license.customDomain,
        customLogo: license.customLogo,
        primaryColor: license.primaryColor,
        secondaryColor: license.secondaryColor,
        accentColor: license.accentColor,
        logoUrl: license.logoUrl,
      },
    };
  });
