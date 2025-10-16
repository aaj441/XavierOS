import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";

export const getProjects = baseProcedure
  .input(z.object({ authToken: z.string() }))
  .query(async ({ input }) => {
    const user = await getAuthenticatedUser(input.authToken);
    
    const projects = await db.project.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        urls: {
          include: {
            scans: {
              orderBy: { startedAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });
    
    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      urlCount: project.urls.length,
      lastScan: project.urls[0]?.scans[0]?.startedAt || null,
    }));
  });
