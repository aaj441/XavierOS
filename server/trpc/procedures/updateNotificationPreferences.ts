import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";

export const updateNotificationPreferences = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      receiveEmailNotifications: z.boolean().optional(),
      notificationEmail: z.string().email().optional().nullable(),
      notifyOnScanComplete: z.boolean().optional(),
      notifyOnScanError: z.boolean().optional(),
      notifyOnScheduledScan: z.boolean().optional(),
      notifyOnReportGenerated: z.boolean().optional(),
      notifyOnReportDue: z.boolean().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const user = await getAuthenticatedUser(input.authToken);
    
    const updateData: any = {};
    
    if (input.receiveEmailNotifications !== undefined) {
      updateData.receiveEmailNotifications = input.receiveEmailNotifications;
    }
    
    if (input.notificationEmail !== undefined) {
      updateData.notificationEmail = input.notificationEmail;
    }
    
    if (input.notifyOnScanComplete !== undefined) {
      updateData.notifyOnScanComplete = input.notifyOnScanComplete;
    }
    
    if (input.notifyOnScanError !== undefined) {
      updateData.notifyOnScanError = input.notifyOnScanError;
    }
    
    if (input.notifyOnScheduledScan !== undefined) {
      updateData.notifyOnScheduledScan = input.notifyOnScheduledScan;
    }
    
    if (input.notifyOnReportGenerated !== undefined) {
      updateData.notifyOnReportGenerated = input.notifyOnReportGenerated;
    }
    
    if (input.notifyOnReportDue !== undefined) {
      updateData.notifyOnReportDue = input.notifyOnReportDue;
    }
    
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: updateData,
    });
    
    return {
      receiveEmailNotifications: updatedUser.receiveEmailNotifications,
      notificationEmail: updatedUser.notificationEmail,
      notifyOnScanComplete: updatedUser.notifyOnScanComplete,
      notifyOnScanError: updatedUser.notifyOnScanError,
      notifyOnScheduledScan: updatedUser.notifyOnScheduledScan,
      notifyOnReportGenerated: updatedUser.notifyOnReportGenerated,
      notifyOnReportDue: updatedUser.notifyOnReportDue,
    };
  });
