import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";

export const purchaseAiCredits = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      credits: z.number().min(1).max(10000),
      paymentMethodId: z.string().optional(), // For Stripe integration
    })
  )
  .mutation(async ({ input }) => {
    const user = await getAuthenticatedUser(input.authToken);
    
    // Get or create AI credit balance
    let creditBalance = await db.aiCreditBalance.findUnique({
      where: { userId: user.id },
    });
    
    if (!creditBalance) {
      creditBalance = await db.aiCreditBalance.create({
        data: {
          userId: user.id,
          balance: 0,
          totalEarned: 0,
          totalSpent: 0,
        },
      });
    }
    
    // Calculate cost (in production, get this from the user's plan)
    const costPerCredit = 10; // 10 cents per credit
    const totalCost = input.credits * costPerCredit;
    
    // In production, process payment with Stripe here
    // For now, we'll just add the credits
    
    // Update balance and create transaction
    const [updatedBalance, transaction] = await db.$transaction([
      db.aiCreditBalance.update({
        where: { userId: user.id },
        data: {
          balance: { increment: input.credits },
          totalEarned: { increment: input.credits },
        },
      }),
      db.aiCreditTransaction.create({
        data: {
          balanceId: creditBalance.id,
          amount: input.credits,
          type: "purchase",
          description: `Purchased ${input.credits} AI credits for $${(totalCost / 100).toFixed(2)}`,
        },
      }),
    ]);
    
    return {
      success: true,
      newBalance: updatedBalance.balance,
      creditsPurchased: input.credits,
      amountCharged: totalCost,
    };
  });
