import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";

export const updateProjectMetadata = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      projectId: z.number(),
      industry: z.string().optional(),
      state: z.string().length(2).optional(), // Two-letter state code
      companySize: z.enum(["small", "medium", "large", "enterprise"]).optional(),
      estimatedRevenue: z.enum(["under_1m", "1m_25m", "25m_plus"]).optional(),
      websiteTraffic: z.number().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const user = await getAuthenticatedUser(input.authToken);
    
    const project = await db.project.findUnique({
      where: { id: input.projectId },
    });
    
    if (!project || project.ownerId !== user.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to update this project",
      });
    }
    
    const updatedProject = await db.project.update({
      where: { id: input.projectId },
      data: {
        industry: input.industry,
        state: input.state,
        companySize: input.companySize,
        estimatedRevenue: input.estimatedRevenue,
        websiteTraffic: input.websiteTraffic,
      },
    });
    
    return {
      success: true,
      project: updatedProject,
    };
  });
