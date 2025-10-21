import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";

function calculateNextReportRun(
  frequency: string,
  timeOfDay: string,
  dayOfWeek?: number | null,
  dayOfMonth?: number | null,
  monthOfQuarter?: number | null
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
    const currentDay = next.getDay();
    let daysUntilNext = dayOfWeek - currentDay;
    if (daysUntilNext <= 0 || (daysUntilNext === 0 && next <= now)) {
      daysUntilNext += 7;
    }
    next.setDate(next.getDate() + daysUntilNext);
  } else if (frequency === "monthly" && dayOfMonth !== null && dayOfMonth !== undefined) {
    next.setDate(dayOfMonth);
    // If this month's date has passed, go to next month
    if (next <= now) {
      next.setMonth(next.getMonth() + 1);
      next.setDate(dayOfMonth);
    }
  } else if (frequency === "quarterly" && monthOfQuarter !== null && monthOfQuarter !== undefined) {
    // Calculate next quarter
    const currentMonth = now.getMonth();
    const currentQuarter = Math.floor(currentMonth / 3);
    const targetMonthInQuarter = monthOfQuarter - 1; // 0-indexed
    
    // Calculate target month
    let targetMonth = currentQuarter * 3 + targetMonthInQuarter;
    let targetYear = now.getFullYear();
    
    // If target month has passed this quarter, go to next quarter
    if (targetMonth < currentMonth || (targetMonth === currentMonth && next <= now)) {
      targetMonth += 3;
      if (targetMonth >= 12) {
        targetMonth -= 12;
        targetYear += 1;
      }
    }
    
    next.setFullYear(targetYear);
    next.setMonth(targetMonth);
    next.setDate(dayOfMonth || 1);
  }
  
  return next;
}

export const createReportSchedule = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      projectId: z.number(),
      frequency: z.enum(["daily", "weekly", "monthly", "quarterly"]),
      timeOfDay: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/), // HH:MM format
      dayOfWeek: z.number().min(0).max(6).optional(),
      dayOfMonth: z.number().min(1).max(31).optional(),
      monthOfQuarter: z.number().min(1).max(3).optional(),
      timezone: z.string().default("UTC"),
      reportType: z.enum([
        "executive_summary",
        "compliance_document",
        "scan_pdf",
        "scan_csv",
        "analytics_pdf",
        "analytics_csv",
      ]),
      templateId: z.number().optional(),
      recipientEmails: z.array(z.string().email()),
      includeOwner: z.boolean().default(true),
    })
  )
  .mutation(async ({ input }) => {
    const user = await getAuthenticatedUser(input.authToken);
    
    // Verify project ownership
    const project = await db.project.findUnique({
      where: { id: input.projectId },
    });
    
    if (!project || project.ownerId !== user.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to create schedules for this project",
      });
    }
    
    // Validate frequency-specific fields
    if (input.frequency === "weekly" && input.dayOfWeek === undefined) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "dayOfWeek is required for weekly schedules",
      });
    }
    
    if (input.frequency === "monthly" && input.dayOfMonth === undefined) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "dayOfMonth is required for monthly schedules",
      });
    }
    
    if (input.frequency === "quarterly" && (input.monthOfQuarter === undefined || input.dayOfMonth === undefined)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "monthOfQuarter and dayOfMonth are required for quarterly schedules",
      });
    }
    
    // Calculate next run time
    const nextRunAt = calculateNextReportRun(
      input.frequency,
      input.timeOfDay,
      input.dayOfWeek,
      input.dayOfMonth,
      input.monthOfQuarter
    );
    
    // Create schedule
    const schedule = await db.reportSchedule.create({
      data: {
        projectId: input.projectId,
        createdBy: user.id,
        frequency: input.frequency,
        timeOfDay: input.timeOfDay,
        dayOfWeek: input.dayOfWeek,
        dayOfMonth: input.dayOfMonth,
        monthOfQuarter: input.monthOfQuarter,
        timezone: input.timezone,
        reportType: input.reportType,
        templateId: input.templateId,
        recipientEmails: JSON.stringify(input.recipientEmails),
        includeOwner: input.includeOwner,
        nextRunAt,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    return {
      id: schedule.id,
      projectId: schedule.projectId,
      projectName: schedule.project.name,
      frequency: schedule.frequency,
      reportType: schedule.reportType,
      nextRunAt: schedule.nextRunAt,
      recipientCount: input.recipientEmails.length + (input.includeOwner ? 1 : 0),
    };
  });
