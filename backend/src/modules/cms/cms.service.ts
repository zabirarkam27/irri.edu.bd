import { prisma } from "@/lib/prisma";
import { createSlug } from "@/utils/slug";
import { getPagination, getSort } from "@/utils/query";

type ModelName =
  | "page"
  | "person"
  | "department"
  | "program"
  | "course"
  | "newsPost"
  | "notice"
  | "event"
  | "galleryAlbum"
  | "publication"
  | "category"
  | "mediaAsset"
  | "auditLog";

const searchableFields: Partial<Record<ModelName, string[]>> = {
  page: ["title", "content"],
  person: ["name", "designation"],
  department: ["name", "description"],
  program: ["title", "description"],
  course: ["title", "description", "code"],
  newsPost: ["title", "content", "excerpt"],
  notice: ["title", "content"],
  event: ["title", "content", "venue"],
  galleryAlbum: ["title", "description"],
  publication: ["title", "abstract", "author"],
  category: ["name", "description"],
  mediaAsset: ["filename", "altText"],
  auditLog: ["action", "entity"]
};

const slugModels = new Set<ModelName>([
  "page",
  "person",
  "department",
  "program",
  "course",
  "newsPost",
  "notice",
  "event",
  "galleryAlbum",
  "publication",
  "category"
]);

const statusModels = new Set<ModelName>([
  "page",
  "person",
  "department",
  "program",
  "course",
  "newsPost",
  "notice",
  "event",
  "galleryAlbum",
  "publication"
]);

const sortableFields: Partial<Record<ModelName, string[]>> = {
  page: ["title", "status", "createdAt", "updatedAt"],
  person: ["name", "order", "type", "status", "createdAt", "updatedAt"],
  department: ["name", "status", "createdAt", "updatedAt"],
  program: ["title", "level", "status", "createdAt", "updatedAt"],
  course: ["title", "code", "credits", "status", "createdAt", "updatedAt"],
  newsPost: ["title", "status", "publishedAt", "createdAt", "updatedAt"],
  notice: ["title", "status", "publishedAt", "createdAt", "updatedAt"],
  event: ["title", "status", "startsAt", "createdAt", "updatedAt"],
  galleryAlbum: ["title", "status", "createdAt", "updatedAt"],
  publication: ["title", "author", "status", "publishedAt", "createdAt", "updatedAt"],
  category: ["name", "createdAt"],
  mediaAsset: ["filename", "size", "type", "createdAt"],
  auditLog: ["action", "entity", "createdAt"]
};

function delegate(model: ModelName) {
  return prisma[model] as any;
}

function buildWhere(model: ModelName, query: Record<string, unknown>) {
  const where: Record<string, unknown> = {};
  if (query.status && statusModels.has(model)) where.status = query.status;
  if (query.search) {
    where.OR = (searchableFields[model] ?? ["title"]).map((field) => ({
      [field]: { contains: String(query.search), mode: "insensitive" }
    }));
  }
  return where;
}

export async function list(model: ModelName, query: Record<string, unknown>) {
  const { page, limit, skip, take } = getPagination(query);
  const where = buildWhere(model, query);
  const orderBy = getSort(query, sortableFields[model] ?? ["createdAt"]);
  const db = delegate(model);
  const [data, total] = await Promise.all([
    db.findMany({ where, skip, take, orderBy }),
    db.count({ where })
  ]);

  return { data, meta: { page, limit, total, totalPage: Math.ceil(total / limit) } };
}

export async function findByIdOrSlug(model: ModelName, idOrSlug: string) {
  const db = delegate(model);
  const where = slugModels.has(model) ? { OR: [{ id: idOrSlug }, { slug: idOrSlug }] } : { id: idOrSlug };
  return db.findFirst({ where });
}

export async function create(model: ModelName, input: Record<string, unknown>) {
  const title = String(input.title ?? input.name ?? input.filename ?? "content");
  const data = {
    ...input,
    ...(slugModels.has(model) ? { slug: input.slug ?? createSlug(title) } : {})
  };
  return delegate(model).create({ data });
}

export async function update(model: ModelName, id: string, input: Record<string, unknown>) {
  return delegate(model).update({ where: { id }, data: input });
}

export async function remove(model: ModelName, id: string) {
  return delegate(model).delete({ where: { id } });
}

export type { ModelName };
