import { z } from "zod";

export const createContentSchema = z.object({
  body: z.object({
    title: z.string().min(2).optional(),
    name: z.string().min(2).optional(),
    slug: z.string().min(2).optional(),
    content: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
    seoTitle: z.string().optional(),
    metaDescription: z.string().optional()
  }).passthrough()
});

export const updateContentSchema = createContentSchema.partial();

export const listQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional()
  })
});
