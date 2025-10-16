import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";

export const getProjectDetails = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      projectId: z.number(),
    })
  )
  .query(async ({ input }) => {
    const user = await getAuthenticatedUser(input.authToken);
    
    const project = await db.project.findUnique({
      where: { id: input.projectId },
      include: {
        urls: {
          include: {
            scans: {
              orderBy: { startedAt: "desc" },
              take: 1,
              include: {
                violations: true,
                reports: true,
              },
            },
          },
        },
      },
    });
    
    if (!project || project.ownerId !== user.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to view this project",
      });
    }
    
    return {
      id: project.id,
      name: project.name,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      urls: project.urls.map((url) => ({
        id: url.id,
        url: url.url,
        status: url.status,
        lastScan: url.lastScan,
        latestScan: url.scans[0]
          ? {
              id: url.scans[0].id,
              status: url.scans[0].status,
              startedAt: url.scans[0].startedAt,
              finishedAt: url.scans[0].finishedAt,
              violationCount: url.scans[0].violations.length,
              report: url.scans[0].reports[0] || null,
            }
          : null,
      })),
    };
  });
