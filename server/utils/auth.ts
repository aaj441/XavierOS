import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { env } from "~/server/env";
import { db } from "~/server/db";

export async function generateAuthToken(userId: number): Promise<string> {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: "1y" });
}

export async function verifyAuthToken(authToken: string): Promise<number> {
  try {
    const verified = jwt.verify(authToken, env.JWT_SECRET);
    const parsed = z.object({ userId: z.number() }).parse(verified);
    return parsed.userId;
  } catch (error) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid or expired authentication token",
    });
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcryptjs.compare(password, hashedPassword);
}

export async function getAuthenticatedUser(authToken: string) {
  const userId = await verifyAuthToken(authToken);
  const user = await db.user.findUnique({
    where: { id: userId },
  });
  
  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User not found",
    });
  }
  
  return user;
}
