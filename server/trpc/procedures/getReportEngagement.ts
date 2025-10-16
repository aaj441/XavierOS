import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { getAuthenticatedUser } from "~/server/utils/auth";

export const getReportEngagement = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      projectId: z.number().optional(),
      documentId: z.number().optional(),
      days: z.number().default(30),
    })
  )
  .query(async ({ input }) => {
    const user = await getAuthenticatedUser(input.authToken);
    
    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - input.days);
    
    // Build where clause
    const whereClause: any = {
      viewedAt: {
        gte: startDate,
      },
    };
    
    if (input.documentId) {
      whereClause.documentId = input.documentId;
    } else if (input.projectId) {
      // Get all documents for this project
      const project = await db.project.findUnique({
        where: { id: input.projectId },
        include: { legalDocuments: true },
      });
      
      if (!project || project.ownerId !== user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view this project's analytics",
        });
      }
      
      whereClause.documentId = {
        in: project.legalDocuments.map(d => d.id),
      };
    } else {
      // Get all documents owned by user
      const userDocuments = await db.legalDocument.findMany({
        where: {
          OR: [
            { userId: user.id },
            { project: { ownerId: user.id } },
          ],
        },
        select: { id: true },
      });
      
      whereClause.documentId = {
        in: userDocuments.map(d => d.id),
      };
    }
    
    // Fetch views
    const views = await db.reportView.findMany({
      where: whereClause,
      include: {
        document: {
          select: {
            id: true,
            title: true,
            documentType: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { viewedAt: "desc" },
    });
    
    // Calculate aggregate metrics
    const totalViews = views.length;
    const uniqueViewers = new Set(
      views.map(v => v.userId || v.viewerEmail || v.sessionId)
    ).size;
    
    const viewsWithDuration = views.filter(v => v.duration !== null);
    const avgDuration = viewsWithDuration.length > 0
      ? Math.round(
          viewsWithDuration.reduce((sum, v) => sum + (v.duration || 0), 0) /
          viewsWithDuration.length
        )
      : 0;
    
    const viewsWithScroll = views.filter(v => v.scrollDepth !== null);
    const avgScrollDepth = viewsWithScroll.length > 0
      ? Math.round(
          (viewsWithScroll.reduce((sum, v) => sum + (v.scrollDepth || 0), 0) /
          viewsWithScroll.length) * 100
        )
      : 0;
    
    const downloadCount = views.filter(v => v.downloaded).length;
    
    // Group by document
    const byDocument = views.reduce((acc, view) => {
      const docId = view.documentId;
      if (!acc[docId]) {
        acc[docId] = {
          document: view.document,
          views: 0,
          uniqueViewers: new Set(),
          downloads: 0,
        };
      }
      acc[docId].views++;
      acc[docId].uniqueViewers.add(view.userId || view.viewerEmail || view.sessionId);
      if (view.downloaded) acc[docId].downloads++;
      return acc;
    }, {} as Record<number, any>);
    
    const documentStats = Object.values(byDocument).map((stat: any) => ({
      document: stat.document,
      views: stat.views,
      uniqueViewers: stat.uniqueViewers.size,
      downloads: stat.downloads,
    }));
    
    // Group by day for trend
    const viewsByDay = views.reduce((acc, view) => {
      const day = view.viewedAt.toISOString().split('T')[0];
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const trend = Object.entries(viewsByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
    
    // Device breakdown
    const deviceBreakdown = views.reduce((acc, view) => {
      const device = view.device || "unknown";
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      summary: {
        totalViews,
        uniqueViewers,
        avgDuration,
        avgScrollDepth,
        downloadCount,
      },
      documentStats: documentStats.sort((a, b) => b.views - a.views),
      trend,
      deviceBreakdown,
      recentViews: views.slice(0, 20).map(v => ({
        id: v.id,
        document: v.document,
        viewer: v.user ? {
          name: v.user.name,
          email: v.user.email,
        } : {
          name: v.viewerName || "Anonymous",
          email: v.viewerEmail || "Unknown",
        },
        viewedAt: v.viewedAt,
        duration: v.duration,
        scrollDepth: v.scrollDepth,
        downloaded: v.downloaded,
        device: v.device,
      })),
    };
  });
