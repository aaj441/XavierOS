import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";

function calculateNextRun(
  frequency: string,
  timeOfDay: string,
  dayOfWeek?: number | null,
  dayOfMonth?: number | null
): Date {
  const now = new Date();
  const [hours, minutes] = timeOfDay.split(":").map(Number);
  
  const next = new Date(now);
  next.setHours(hours, minutes, 0, 0);
  
  if (frequency === "daily") {
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
  } else if (frequency === "weekly" && dayOfWeek !== null && dayOfWeek !== undefined) {
    const currentDay = next.getDay();
    let daysUntilNext = dayOfWeek - currentDay;
    if (daysUntilNext < 0 || (daysUntilNext === 0 && next <= now)) {
      daysUntilNext += 7;
    }
    next.setDate(next.getDate() + daysUntilNext);
  } else if (frequency === "monthly" && dayOfMonth !== null && dayOfMonth !== undefined) {
    next.setDate(dayOfMonth);
    if (next <= now) {
      next.setMonth(next.getMonth() + 1);
    }
  }
  
  return next;
}

export const updateSchedule = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      scheduleId: z.number(),
      enabled: z.boolean().optional(),
      frequency: z.enum(["daily", "weekly", "monthly"]).optional(),
      timeOfDay: z.string().regex(/^\d{2}:\d{2}$/).optional(),
      dayOfWeek: z.number().min(0).max(6).optional(),
      dayOfMonth: z.number().min(1).max(31).optional(),
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
        message: "You don't have permission to update this schedule",
      });
    }
    
    const updateData: any = {};
    
    if (input.enabled !== undefined) {
      updateData.enabled = input.enabled;
    }
    
    if (input.frequency !== undefined) {
      updateData.frequency = input.frequency;
    }
    
    if (input.timeOfDay !== undefined) {
      updateData.timeOfDay = input.timeOfDay;
    }
    
    if (input.dayOfWeek !== undefined) {
      updateData.dayOfWeek = input.dayOfWeek;
    }
    
    if (input.dayOfMonth !== undefined) {
      updateData.dayOfMonth = input.dayOfMonth;
    }
    
    // Recalculate next run if schedule parameters changed
    if (input.frequency || input.timeOfDay || input.dayOfWeek !== undefined || input.dayOfMonth !== undefined) {
      const frequency = input.frequency || schedule.frequency;
      const timeOfDay = input.timeOfDay || schedule.timeOfDay;
      const dayOfWeek = input.dayOfWeek !== undefined ? input.dayOfWeek : schedule.dayOfWeek;
      const dayOfMonth = input.dayOfMonth !== undefined ? input.dayOfMonth : schedule.dayOfMonth;
      
      updateData.nextRunAt = calculateNextRun(frequency, timeOfDay, dayOfWeek, dayOfMonth);
    }
    
    const updatedSchedule = await db.scanSchedule.update({
      where: { id: input.scheduleId },
      data: updateData,
    });
    
    return updatedSchedule;
  });
