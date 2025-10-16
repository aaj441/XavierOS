import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";

export const getReportSchedules = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      projectId: z.number().optional(),
    })
  )
  .query(async ({ input }) => {
    const user = await getAuthenticatedUser(input.authToken);
    
    const whereClause: any = {};
    
    if (input.projectId) {
      // Verify ownership
      const project = await db.project.findUnique({
        where: { id: input.projectId },
      });
      
      if (!project || project.ownerId !== user.id) {
        return [];
      }
      
      whereClause.projectId = input.projectId;
    } else {
      // Get all schedules for user's projects
      const userProjects = await db.project.findMany({
        where: { ownerId: user.id },
        select: { id: true },
      });
      
      whereClause.projectId = {
        in: userProjects.map(p => p.id),
      };
    }
    
    const schedules = await db.reportSchedule.findMany({
      where: whereClause,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        template: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { nextRunAt: "asc" },
    });
    
    return schedules.map(schedule => ({
      id: schedule.id,
      project: schedule.project,
      creator: schedule.creator,
      enabled: schedule.enabled,
      frequency: schedule.frequency,
      timeOfDay: schedule.timeOfDay,
      dayOfWeek: schedule.dayOfWeek,
      dayOfMonth: schedule.dayOfMonth,
      monthOfQuarter: schedule.monthOfQuarter,
      timezone: schedule.timezone,
      reportType: schedule.reportType,
      template: schedule.template,
      recipientEmails: JSON.parse(schedule.recipientEmails),
      includeOwner: schedule.includeOwner,
      lastRunAt: schedule.lastRunAt,
      nextRunAt: schedule.nextRunAt,
      lastStatus: schedule.lastStatus,
      lastError: schedule.lastError,
      createdAt: schedule.createdAt,
    }));
  });
