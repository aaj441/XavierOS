import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";

export const duplicateProject = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      projectId: z.number(),
      newName: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const user = await getAuthenticatedUser(input.authToken);
    
    const originalProject = await db.project.findUnique({
      where: { id: input.projectId },
      include: {
        urls: true,
      },
    });
    
    if (!originalProject || originalProject.ownerId !== user.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to duplicate this project",
      });
    }
    
    // Create new project
    const newProjectName = input.newName || `${originalProject.name} (Copy)`;
    const newProject = await db.project.create({
      data: {
        name: newProjectName,
        ownerId: user.id,
        industry: originalProject.industry,
        state: originalProject.state,
        companySize: originalProject.companySize,
        estimatedRevenue: originalProject.estimatedRevenue,
        websiteTraffic: originalProject.websiteTraffic,
        tags: originalProject.tags,
      },
    });
    
    // Copy URLs
    if (originalProject.urls.length > 0) {
      await db.uRL.createMany({
        data: originalProject.urls.map((url) => ({
          projectId: newProject.id,
          url: url.url,
          status: "pending",
        })),
      });
    }
    
    return {
      id: newProject.id,
      name: newProject.name,
      urlCount: originalProject.urls.length,
    };
  });
