import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";

export const createRemediationRequest = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      violationIds: z.array(z.number()).min(1, "At least one violation must be selected"),
      pricingModel: z.enum(["fixed", "hourly"]),
      estimatedPrice: z.number().min(0),
      notes: z.string().optional(),
      expertId: z.number().optional(), // Specific expert or marketplace will assign
    })
  )
  .mutation(async ({ input }) => {
    const user = await getAuthenticatedUser(input.authToken);
    
    // Fetch violations to verify ownership
    const violations = await db.violation.findMany({
      where: {
        id: { in: input.violationIds },
      },
      include: {
        scan: {
          include: {
            url: {
              include: {
                project: true,
              },
            },
          },
        },
      },
    });
    
    if (violations.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No violations found",
      });
    }
    
    // Verify user owns all violations
    const projectIds = new Set(violations.map(v => v.scan.url.project.id));
    const projects = await db.project.findMany({
      where: {
        id: { in: Array.from(projectIds) },
        ownerId: user.id,
      },
    });
    
    if (projects.length !== projectIds.size) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to request remediation for these violations",
      });
    }
    
    // Create a marketplace item for this remediation service
    const marketplaceItem = await db.marketplaceItem.create({
      data: {
        creatorId: input.expertId || user.id, // If no expert specified, user creates it
        type: "service",
        title: `Remediation: ${violations.length} Issue${violations.length > 1 ? "s" : ""}`,
        description: `Fix ${violations.length} accessibility violation${violations.length > 1 ? "s" : ""}: ${violations.map(v => v.code).join(", ")}`,
        category: "accessibility_remediation",
        price: Math.round(input.estimatedPrice * 100), // Convert to cents
        currency: "USD",
        tags: JSON.stringify(violations.map(v => v.code)),
        isActive: true,
      },
    });
    
    // Create purchase record
    const purchase = await db.marketplacePurchase.create({
      data: {
        itemId: marketplaceItem.id,
        buyerId: user.id,
        price: Math.round(input.estimatedPrice * 100),
        platformFee: Math.round(input.estimatedPrice * 100 * 0.3), // 30% platform fee
        creatorEarnings: Math.round(input.estimatedPrice * 100 * 0.7), // 70% to expert
      },
    });
    
    return {
      requestId: purchase.id,
      itemId: marketplaceItem.id,
      violationCount: violations.length,
      estimatedPrice: input.estimatedPrice,
      status: "pending",
    };
  });
