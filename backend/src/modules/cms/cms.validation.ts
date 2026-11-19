import { z } from "zod";
import { Prisma } from "@prisma/client";
import type { ModelName } from "./cms.service";

const identifier = z.string().trim().min(1).max(200);
export const detailParamsSchema = z.object({ params: z.object({ idOrSlug: identifier }) });
export const writeParamsSchema = z.object({ params: z.object({ id: identifier }) });

const newsFields = z.object({
  title: z.string().trim().min(2).max(250),
  slug: z.string().trim().min(2).max(200).regex(/^[\p{L}\p{M}\p{N}]+(?:-[\p{L}\p{M}\p{N}]+)*$/u).optional(),
  titleBn: z.string().trim().max(250).nullable().optional(),
  content: z.string().trim().min(1).max(100000),
  contentBn: z.string().trim().max(100000).nullable().optional(),
  excerpt: z.string().trim().max(500).nullable().optional(),
  seoTitle: z.string().trim().max(250).nullable().optional(),
  metaDescription: z.string().trim().max(500).nullable().optional(),
  publishedAt: z.string().datetime({ offset: true }).nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional()
}).strict();

export const newsCreateSchema = z.object({ body: newsFields });
export const newsUpdateSchema = writeParamsSchema.extend({ body: newsFields.partial().refine((body) => Object.keys(body).length > 0, "No changes supplied") });

const urlFields = new Set(["photoUrl", "ogImage", "fileUrl"]);
const relations: Partial<Record<ModelName, readonly string[]>> = {
  program: ["departmentId"],
  course: ["departmentId", "programId"]
};

export function isCmsWriteField(model: ModelName, field: { kind: string; name: string; isReadOnly: boolean }) {
  return field.kind !== "object" && !["id", "createdAt", "updatedAt", "uploadedBy"].includes(field.name)
    && (!field.isReadOnly || relations[model]?.includes(field.name) === true);
}

export function modelWriteSchemas(model: ModelName) {
  if (model === "newsPost") return { create: newsCreateSchema, update: newsUpdateSchema };
  const definition = Prisma.dmmf.datamodel.models.find(({ name }) => name[0].toLowerCase() + name.slice(1) === model);
  const fields: Record<string, z.ZodTypeAny> = {};
  for (const field of definition?.fields ?? []) {
    if (!isCmsWriteField(model, field)) continue;
    const key = field.name;
    let schema: z.ZodTypeAny;
    if (field.kind === "enum") {
      const values = Prisma.dmmf.datamodel.enums.find(({ name }) => name === field.type)?.values.map(({ name }) => name);
      if (!values?.length) continue;
      schema = z.enum([values[0], ...values.slice(1)]);
    } else if (field.type === "String") {
      schema = urlFields.has(key)
        ? z.string().trim().max(2048).refine((value) => {
          if (/^\/uploads\/[a-z0-9][a-z0-9._-]*$/i.test(value) || /^\/api\/v1\/media\/files\/[a-z0-9-]{1,80}$/i.test(value)) return true;
          try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
        }, "Use an HTTP(S) URL or an existing upload path")
        : key === "slug"
          ? z.string().trim().min(1).max(200).regex(/^[\p{L}\p{M}\p{N}]+(?:-[\p{L}\p{M}\p{N}]+)*$/u)
          : z.string().trim().min(key === "title" || key === "name" ? 2 : field.isRequired ? 1 : 0)
            .max(["content", "contentBn", "description", "bio", "abstract"].includes(key) ? 100000 : 2000);
    } else if (field.type === "DateTime") {
      schema = z.string().datetime({ offset: true });
    } else if (field.type === "Int") {
      schema = z.number().int().min(0).max(2147483647);
    } else if (field.type === "Float") {
      schema = z.number().finite().nonnegative();
    } else {
      continue;
    }
    if (!field.isRequired) schema = schema.nullable();
    if (!field.isRequired || field.hasDefaultValue || key === "slug") schema = schema.optional();
    fields[key] = schema;
  }
  const body = z.object(fields).strict();
  return {
    create: z.object({ body }),
    update: writeParamsSchema.extend({ body: body.partial().refine((value) => Object.keys(value).length > 0, "No changes supplied") })
  };
}

export const listQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^[1-9]\d{0,6}$/).optional(),
    limit: z.string().regex(/^[1-9]\d{0,6}$/).optional(),
    search: z.string().max(200).optional(),
    sortBy: z.string().max(80).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    status: z.enum(["DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED", "ARCHIVED"]).optional(),
    type: z.enum(["ADMINISTRATION", "FACULTY", "STAFF", "RESEARCHER"]).optional(),
    entity: z.string().trim().max(80).optional(),
    departmentId: z.string().trim().min(1).max(80).optional(),
    programId: z.string().trim().min(1).max(80).optional()
  })
});
