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
    // If time has passed today, schedule for tomorrow
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
  } else if (frequency === "weekly" && dayOfWeek !== null && dayOfWeek !== undefined) {
    // Set to the specified day of week
    const currentDay = next.getDay();
    let daysUntilNext = dayOfWeek - currentDay;
    if (daysUntilNext < 0 || (daysUntilNext === 0 && next <= now)) {
      daysUntilNext += 7;
    }
    next.setDate(next.getDate() + daysUntilNext);
  } else if (frequency === "monthly" && dayOfMonth !== null && dayOfMonth !== undefined) {
    // Set to the specified day of month
    next.setDate(dayOfMonth);
    // If that day has passed this month, move to next month
    if (next <= now) {
      next.setMonth(next.getMonth() + 1);
    }
  }
  
  return next;
}

export const createSchedule = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      urlId: z.number(),
      frequency: z.enum(["daily", "weekly", "monthly"]),
      timeOfDay: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM format
      dayOfWeek: z.number().min(0).max(6).optional(), // Required for weekly
      dayOfMonth: z.number().min(1).max(31).optional(), // Required for monthly
    })
  )
  .mutation(async ({ input }) => {
    const user = await getAuthenticatedUser(input.authToken);
    
    // Verify user owns the URL's project
    const url = await db.uRL.findUnique({
      where: { id: input.urlId },
      include: { project: true },
    });
    
    if (!url || url.project.ownerId !== user.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to schedule scans for this URL",
      });
    }
    
    // Validate frequency-specific requirements
    if (input.frequency === "weekly" && input.dayOfWeek === undefined) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Day of week is required for weekly schedules",
      });
    }
    
    if (input.frequency === "monthly" && input.dayOfMonth === undefined) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Day of month is required for monthly schedules",
      });
    }
    
    const nextRunAt = calculateNextRun(
      input.frequency,
      input.timeOfDay,
      input.dayOfWeek,
      input.dayOfMonth
    );
    
    const schedule = await db.scanSchedule.create({
      data: {
        urlId: input.urlId,
        frequency: input.frequency,
        timeOfDay: input.timeOfDay,
        dayOfWeek: input.dayOfWeek,
        dayOfMonth: input.dayOfMonth,
        nextRunAt,
      },
    });
    
    return schedule;
  });
