import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";

export const deleteSchedule = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      scheduleId: z.number(),
    })
  )
  .mutation(async ({ input }) => {
    const user = await getAuthenticatedUser(input.authToken);
    
    // Verify user owns the schedule's URL's project
    const schedule = await db.scanSchedule.findUnique({
      where: { id: input.scheduleId },
      include: {
        url: {
          include: {
            project: true,
          },
        },
      },
    });
    
    if (!schedule || schedule.url.project.ownerId !== user.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to delete this schedule",
      });
    }
    
    await db.scanSchedule.delete({
      where: { id: input.scheduleId },
    });
    
    return { success: true };
  });
