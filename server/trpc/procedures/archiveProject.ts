import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";

export const archiveProject = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      projectId: z.number(),
      archived: z.boolean(),
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
        isArchived: input.archived,
        archivedAt: input.archived ? new Date() : null,
      },
    });
    
    return {
      success: true,
      isArchived: updatedProject.isArchived,
    };
  });
