import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";

export const createProject = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      name: z.string().min(1),
    })
  )
  .mutation(async ({ input }) => {
    const user = await getAuthenticatedUser(input.authToken);
    
    const project = await db.project.create({
      data: {
        name: input.name,
        ownerId: user.id,
      },
    });
    
    return {
      id: project.id,
      name: project.name,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  });
