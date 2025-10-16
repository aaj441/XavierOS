import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";
import { minioClient, minioBaseUrl } from "~/server/minio";

export const getPresignedLogoUploadUrl = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      filename: z.string(),
      contentType: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const user = await getAuthenticatedUser(input.authToken);
    
    // Check if user has a subscription with white-label access
    const subscription = await db.userSubscription.findUnique({
      where: { userId: user.id },
      include: {
        plan: true,
      },
    });
    
    if (!subscription?.plan.hasWhiteLabel) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Logo upload is only available for Enterprise customers",
      });
    }
    
    // Generate a unique filename with timestamp
    const timestamp = Date.now();
    const sanitizedFilename = input.filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const objectName = `public/branding/${user.id}/${timestamp}-${sanitizedFilename}`;
    
    // Generate presigned URL for PUT operation (15 minutes expiry)
    const presignedUrl = await minioClient.presignedPutObject(
      "scan-reports",
      objectName,
      15 * 60
    );
    
    // Generate the public URL where the file will be accessible
    const publicUrl = `${minioBaseUrl}/scan-reports/${objectName}`;
    
    return {
      uploadUrl: presignedUrl,
      publicUrl,
      objectName,
    };
  });
