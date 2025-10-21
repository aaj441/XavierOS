import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getMarketplaceItems = baseProcedure
  .input(
    z.object({
      type: z.enum(["template", "asset", "service", "ghostwriter"]).optional(),
      category: z.string().optional(),
      featured: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    })
  )
  .query(async ({ input }) => {
    const where: any = {
      isActive: true,
    };
    
    if (input.type) {
      where.type = input.type;
    }
    
    if (input.category) {
      where.category = input.category;
    }
    
    if (input.featured !== undefined) {
      where.featured = input.featured;
    }
    
    const [items, total] = await Promise.all([
      db.marketplaceItem.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: [
          { featured: "desc" },
          { purchases: "desc" },
          { createdAt: "desc" },
        ],
        take: input.limit,
        skip: input.offset,
      }),
      db.marketplaceItem.count({ where }),
    ]);
    
    return {
      items: items.map(item => ({
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description,
        category: item.category,
        price: item.price,
        currency: item.currency,
        creator: {
          id: item.creator.id,
          name: item.creator.name,
        },
        thumbnailUrl: item.thumbnailUrl,
        previewUrl: item.previewUrl,
        featured: item.featured,
        verified: item.verified,
        stats: {
          views: item.views,
          purchases: item.purchases,
          rating: item.rating,
        },
        tags: item.tags ? JSON.parse(item.tags) : [],
        createdAt: item.createdAt,
      })),
      pagination: {
        total,
        limit: input.limit,
        offset: input.offset,
        hasMore: input.offset + input.limit < total,
      },
    };
  });
