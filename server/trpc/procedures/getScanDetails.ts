import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";

const severityRank = {
  critical: 4,
  serious: 3,
  moderate: 2,
  minor: 1,
} as const;

export const getScanDetails = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      scanId: z.number(),
    })
  )
  .query(async ({ input }) => {
    const user = await getAuthenticatedUser(input.authToken);
    
    const scan = await db.scan.findUnique({
      where: { id: input.scanId },
      include: {
        url: {
          include: {
            project: true,
          },
        },
        violations: true,
        reports: true,
      },
    });
    
    if (!scan || scan.url.project.ownerId !== user.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to view this scan",
      });
    }
    
    // Sort violations by severity (critical > serious > moderate > minor)
    const sortedViolations = scan.violations.sort((a, b) => {
      const rankA = severityRank[a.severity as keyof typeof severityRank] || 0;
      const rankB = severityRank[b.severity as keyof typeof severityRank] || 0;
      if (rankA !== rankB) {
        return rankB - rankA; // Higher rank first
      }
      // If same severity, sort by creation time
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
    
    return {
      id: scan.id,
      url: scan.url.url,
      status: scan.status,
      startedAt: scan.startedAt,
      finishedAt: scan.finishedAt,
      violations: sortedViolations,
      report: scan.reports[0] || null,
    };
  });
