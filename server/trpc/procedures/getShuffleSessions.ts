import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";

export const getShuffleSessions = baseProcedure
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
      return [];
    }
    
    const sessions = await db.shuffleSession.findMany({
      where: { projectId: input.projectId },
      orderBy: { startedAt: "desc" },
      include: {
        _count: {
          select: {
            companies: true,
          },
        },
      },
    });
    
    return sessions.map((session) => ({
      id: session.id,
      category: session.category,
      demographics: session.demographics,
      status: session.status,
      totalSites: session.totalSites,
      scannedSites: session.scannedSites,
      compliantSites: session.compliantSites,
      nonCompliantSites: session.nonCompliantSites,
      leadsGenerated: session.leadsGenerated,
      startedAt: session.startedAt,
      finishedAt: session.finishedAt,
      errorMessage: session.errorMessage,
      companiesCount: session._count.companies,
    }));
  });
