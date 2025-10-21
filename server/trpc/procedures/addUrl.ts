import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";

export const addUrl = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      projectId: z.number(),
      url: z.string().url(),
    })
  )
  .mutation(async ({ input }) => {
    const user = await getAuthenticatedUser(input.authToken);
    
    // Verify user owns the project
    const project = await db.project.findUnique({
      where: { id: input.projectId },
    });
    
    if (!project || project.ownerId !== user.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to add URLs to this project",
      });
    }
    
    const url = await db.uRL.create({
      data: {
        projectId: input.projectId,
        url: input.url,
      },
    });
    
    return {
      id: url.id,
      url: url.url,
      status: url.status,
      createdAt: url.createdAt,
    };
  });
