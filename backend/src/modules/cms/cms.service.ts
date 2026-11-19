import { Prisma } from "@prisma/client";
import { AppError } from "@/errors/AppError";
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/utils/slug";
import { getPagination, getSort } from "@/utils/query";
import { isCmsWriteField } from "./cms.validation";

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

function delegate(model: ModelName, db: Prisma.TransactionClient = prisma) {
  return db[model] as any;
}

function validateWriteFields(model: ModelName, input: Record<string, unknown>) {
  const definition = Prisma.dmmf.datamodel.models.find(({ name }) => name[0].toLowerCase() + name.slice(1) === model);
  const allowed = new Set(definition?.fields.filter((field) => isCmsWriteField(model, field)).map(({ name }) => name));
  if (Object.keys(input).some((key) => !allowed.has(key))) {
    throw new AppError(400, "Unsupported or protected field");
  }
}

function buildWhere(model: ModelName, query: Record<string, unknown>) {
  const where: Record<string, unknown> = {};
  if (query.status && statusModels.has(model)) where.status = query.status;
  if (model === "person" && query.type) where.type = query.type;
  if (model === "auditLog" && query.entity) where.entity = query.entity;
  if ((model === "course" || model === "program") && query.departmentId) where.departmentId = query.departmentId;
  if (model === "course" && query.programId) where.programId = query.programId;
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
    db.findMany({ where, skip, take, orderBy: [orderBy, { id: "asc" }], ...(model === "galleryAlbum" ? { include: { images: { orderBy: [{ order: "asc" }, { id: "asc" }], take: 1 } } } : {}) }),
    db.count({ where })
  ]);

  return { data, meta: { page, limit, total, totalPage: Math.ceil(total / limit) } };
}

export async function findByIdOrSlug(model: ModelName, idOrSlug: string, publishedOnly = false) {
  const db = delegate(model);
  const where = slugModels.has(model) ? { OR: [{ id: idOrSlug }, { slug: idOrSlug }] } : { id: idOrSlug };
  const include = model === "galleryAlbum" ? { images: { orderBy: [{ order: "asc" }, { id: "asc" }] } } : undefined;
  const direct = await db.findFirst({
    where: { ...where, ...(publishedOnly ? { status: "PUBLISHED" } : {}) },
    include
  });
  if (direct || !publishedOnly || !slugModels.has(model)) return direct;
  const redirect = await prisma.cmsSlugRedirect.findUnique({ where: { model_oldSlug: { model, oldSlug: idOrSlug } } });
  return redirect ? db.findFirst({ where: { id: redirect.recordId, status: "PUBLISHED" }, include }) : null;
}

export async function create(model: ModelName, input: Record<string, unknown>, db: Prisma.TransactionClient = prisma) {
  validateWriteFields(model, input);
  const title = String(input.title ?? input.name ?? input.filename ?? "content");
  const slug = slugModels.has(model) ? input.slug ?? createSlug(title) : undefined;
  if (slugModels.has(model) && !slug) throw new AppError(400, "Provide a slug for this title");
  if (typeof slug === "string" && await db.cmsSlugRedirect.findUnique({ where: { model_oldSlug: { model, oldSlug: slug } } })) {
    throw new AppError(409, "This slug redirects to an existing record");
  }
  const data = {
    ...input,
    ...(slug !== undefined ? { slug } : {})
  };
  return delegate(model, db).create({ data });
}

export async function update(model: ModelName, id: string, input: Record<string, unknown>, db: Prisma.TransactionClient = prisma) {
  validateWriteFields(model, input);
  if (typeof input.slug === "string") {
    const where = { model, oldSlug: input.slug };
    const redirect = await db.cmsSlugRedirect.findUnique({ where: { model_oldSlug: where } });
    if (redirect && redirect.recordId !== id) throw new AppError(409, "This slug redirects to an existing record");
    if (redirect) await db.cmsSlugRedirect.delete({ where: { model_oldSlug: where } });
  }
  return delegate(model, db).update({ where: { id }, data: input });
}

export async function remove(model: ModelName, id: string, db: Prisma.TransactionClient = prisma) {
  return delegate(model, db).delete({ where: { id } });
}

export async function findById(model: ModelName, id: string, db: Prisma.TransactionClient = prisma) {
  return delegate(model, db).findUnique({ where: { id } });
}

export type { ModelName };
