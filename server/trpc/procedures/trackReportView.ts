import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const trackReportView = baseProcedure
  .input(
    z.object({
      documentId: z.number(),
      authToken: z.string().optional(),
      viewerEmail: z.string().email().optional(),
      viewerName: z.string().optional(),
      sessionId: z.string(),
      duration: z.number().optional(),
      scrollDepth: z.number().min(0).max(1).optional(),
      downloaded: z.boolean().optional(),
      device: z.enum(["desktop", "mobile", "tablet"]).optional(),
      browser: z.string().optional(),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    // Get user ID if authenticated
    let userId: number | undefined;
    if (input.authToken) {
      try {
        const { getAuthenticatedUser } = await import("~/server/utils/auth");
        const user = await getAuthenticatedUser(input.authToken);
        userId = user.id;
      } catch {
        // If token is invalid, continue as anonymous
        userId = undefined;
      }
    }
    
    // Create or update report view
    const existingView = await db.reportView.findFirst({
      where: {
        documentId: input.documentId,
        sessionId: input.sessionId,
      },
    });
    
    if (existingView) {
      // Update existing view with new engagement metrics
      await db.reportView.update({
        where: { id: existingView.id },
        data: {
          duration: input.duration ?? existingView.duration,
          scrollDepth: input.scrollDepth ?? existingView.scrollDepth,
          downloaded: input.downloaded ?? existingView.downloaded,
        },
      });
    } else {
      // Create new view record
      await db.reportView.create({
        data: {
          documentId: input.documentId,
          userId,
          viewerEmail: input.viewerEmail,
          viewerName: input.viewerName,
          sessionId: input.sessionId,
          duration: input.duration,
          scrollDepth: input.scrollDepth,
          downloaded: input.downloaded ?? false,
          device: input.device,
          browser: input.browser,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
        },
      });
    }
    
    return { success: true };
  });
