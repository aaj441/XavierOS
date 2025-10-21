import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";

export const updateCompanyContactStatus = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      companyId: z.number(),
      status: z.enum([
        "not_contacted",
        "contacted",
        "responded",
        "scheduled",
        "closed_won",
        "closed_lost",
      ]),
      notes: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const user = await getAuthenticatedUser(input.authToken);
    
    // Verify user owns the company through the shuffle session
    const company = await db.discoveredCompany.findUnique({
      where: { id: input.companyId },
      include: {
        shuffleSession: {
          include: {
            project: true,
          },
        },
      },
    });
    
    if (!company) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Company not found",
      });
    }
    
    if (company.shuffleSession.project.ownerId !== user.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to update this company",
      });
    }
    
    // Update the company
    const updateData: any = {
      contactStatus: input.status,
      lastContactedAt: new Date(),
    };
    
    // Set contactedAt on first contact
    if (input.status === "contacted" && !company.contactedAt) {
      updateData.contactedAt = new Date();
    }
    
    // Append notes if provided
    if (input.notes) {
      const existingNotes = company.notes || "";
      const timestamp = new Date().toISOString();
      const newNote = `[${timestamp}] ${input.notes}`;
      updateData.notes = existingNotes 
        ? `${existingNotes}\n\n${newNote}`
        : newNote;
    }
    
    await db.discoveredCompany.update({
      where: { id: input.companyId },
      data: updateData,
    });
    
    // Log the action
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "company_contact_status_updated",
        resourceType: "company",
        resourceId: input.companyId,
        description: `Updated contact status to ${input.status} for ${company.companyName}`,
        metadata: JSON.stringify({
          companyName: company.companyName,
          previousStatus: company.contactStatus,
          newStatus: input.status,
        }),
        success: true,
      },
    });
    
    return {
      success: true,
      companyId: input.companyId,
      status: input.status,
    };
  });
