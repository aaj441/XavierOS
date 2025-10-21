import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { hashPassword, generateAuthToken } from "~/server/utils/auth";

export const register = baseProcedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().min(1),
    })
  )
  .mutation(async ({ input }) => {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: input.email },
    });
    
    if (existingUser) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "A user with this email already exists",
      });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(input.password);
    
    // Create user
    const user = await db.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name,
        role: "auditor", // default role
      },
    });
    
    // Generate auth token
    const authToken = await generateAuthToken(user.id);
    
    return {
      authToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  });
