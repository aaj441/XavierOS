import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";

export const getSchedules = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      projectId: z.number(),
    })
  )
  .query(async ({ input }) => {
    const user = await getAuthenticatedUser(input.authToken);
    
    // Verify user owns the project
    const project = await db.project.findUnique({
      where: { id: input.projectId },
    });
    
    if (!project || project.ownerId !== user.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to view schedules for this project",
      });
    }
    
    const schedules = await db.scanSchedule.findMany({
      where: {
        url: {
          projectId: input.projectId,
        },
      },
      include: {
        url: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    return schedules;
  });
