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

const identifier = z.string().trim().min(1).max(200);
export const detailParamsSchema = z.object({ params: z.object({ idOrSlug: identifier }) });
export const writeParamsSchema = z.object({ params: z.object({ id: identifier }) });
export const updateContentSchema = createContentSchema.merge(writeParamsSchema);

export const listQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^[1-9]\d{0,6}$/).optional(),
    limit: z.string().regex(/^[1-9]\d{0,6}$/).optional(),
    search: z.string().max(200).optional(),
    sortBy: z.string().max(80).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional()
  })
});
