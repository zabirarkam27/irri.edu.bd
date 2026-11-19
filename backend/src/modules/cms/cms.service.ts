import { Prisma } from "@prisma/client";
import { AppError } from "@/errors/AppError";
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/utils/slug";
import { getPagination, getSort } from "@/utils/query";
import { cmsMultiRelations, isCmsWriteField } from "./cms.validation";
import { publicAcademicAsset } from "@/modules/media/references";
import { academicLinks } from "./academic-links";

export const samplePageSuffix = " content for International Rabindra Research Institute.";
export const noSamplePage = { NOT: { content: { endsWith: samplePageSuffix } } };

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
  | "researchArea"
  | "researchProject"
  | "academicAsset"
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
  publication: ["title", "titleBn", "abstract", "author", "authors", "keywords", "doi", "isbn", "issn"],
  researchArea: ["title", "titleBn", "description", "contentBn"],
  researchProject: ["title", "titleBn", "description", "contentBn"],
  academicAsset: ["title", "titleBn", "description", "contentBn"],
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
  "researchArea", "researchProject", "academicAsset",
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
  "publication", "researchArea", "researchProject", "academicAsset"
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
  researchArea: ["title", "status", "createdAt", "updatedAt"],
  researchProject: ["title", "startsAt", "status", "createdAt", "updatedAt"],
  academicAsset: ["title", "kind", "status", "createdAt", "updatedAt"],
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
  if (Object.keys(input).some((key) => !allowed.has(key) && !Object.hasOwn(cmsMultiRelations[model] ?? {}, key))) {
    throw new AppError(400, "Unsupported or protected field");
  }
}

function buildWhere(model: ModelName, query: Record<string, unknown>) {
  const where: Record<string, unknown> = {};
  if (query.status && statusModels.has(model)) where.status = query.status;
  if (model === "page" && query.publicOnly === true) Object.assign(where, noSamplePage);
  if (model === "academicAsset") {
    if (query.publicOnly === true) Object.assign(where, publicAcademicAsset());
    if (query.kind) where.kind = query.kind;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.language) where.language = { equals: query.language, mode: "insensitive" };
  }
  if (model === "person" && query.type) where.type = query.type;
  if (model === "auditLog" && query.entity) where.entity = query.entity;
  if (["course", "program", "person", "newsPost", "publication", "researchArea", "researchProject"].includes(model) && query.departmentId) where.departmentId = query.departmentId;
  if (model === "event" && query.academicCalendar !== undefined) where.academicCalendar = query.academicCalendar === "true";
  if (model === "publication" && query.publicationType) where.publicationType = { equals: query.publicationType, mode: "insensitive" };
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

  return { data: model === "academicAsset" && query.publicOnly ? data.map(publicAssetData) : data, meta: { page, limit, total, totalPage: Math.ceil(total / limit) } };
}

function publicAssetData({ rightsApprovedBy: _by, rightsApprovedAt: _at, rightsEvidence: _evidence, ...record }: Record<string, unknown>) {
  return record;
}

export async function findByIdOrSlug(model: ModelName, idOrSlug: string, publishedOnly = false) {
  const db = delegate(model);
  const where = slugModels.has(model) ? { OR: [{ id: idOrSlug }, { slug: idOrSlug }] } : { id: idOrSlug };
  const multi = cmsMultiRelations[model] ?? {};
  const include = model === "galleryAlbum" ? { images: { orderBy: [{ order: "asc" }, { id: "asc" }] } } :
    !publishedOnly && Object.keys(multi).length ? Object.fromEntries(Object.values(multi).map((relation) => [relation, { select: { id: true } }])) : undefined;
  const visibility = publishedOnly ? { status: "PUBLISHED", ...(model === "page" ? noSamplePage : {}), ...(model === "academicAsset" ? publicAcademicAsset() : {}) } : {};
  let record = await db.findFirst({
    where: { ...where, ...visibility },
    include
  });
  if (!record && publishedOnly && slugModels.has(model)) {
    const redirect = await prisma.cmsSlugRedirect.findUnique({ where: { model_oldSlug: { model, oldSlug: idOrSlug } } });
    if (redirect) record = await db.findFirst({ where: { id: redirect.recordId, ...visibility }, include });
  }
  if (!record) return null;
  if (publishedOnly) return { ...(model === "academicAsset" ? publicAssetData(record) : record), related: await academicLinks(model, record.id) };
  for (const [field, relation] of Object.entries(multi)) record[field] = record[relation].map(({ id }: { id: string }) => id);
  return record;
}

type RightsApproval = { rightsApprovedAt: Date | null; rightsApprovedBy: string | null };

async function writeMulti(model: ModelName, record: { id: string }, input: Record<string, unknown>, db: Prisma.TransactionClient) {
  const data: Record<string, unknown> = {};
  for (const [field, relation] of Object.entries(cmsMultiRelations[model] ?? {})) {
    const ids = input[field];
    if (!Array.isArray(ids)) continue;
    if (model === "course" && ids.includes(record.id)) throw new AppError(400, "A course cannot require itself");
    data[relation] = { set: ids.map((id) => ({ id })) };
  }
  if (Object.keys(data).length) await delegate(model, db).update({ where: { id: record.id }, data });
  return record;
}

function scalarInput(model: ModelName, input: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(input).filter(([key]) => !Object.hasOwn(cmsMultiRelations[model] ?? {}, key)));
}

export async function create(model: ModelName, input: Record<string, unknown>, db: Prisma.TransactionClient = prisma, approval?: RightsApproval) {
  validateWriteFields(model, input);
  const title = String(input.title ?? input.name ?? input.filename ?? "content");
  const slug = slugModels.has(model) ? input.slug ?? createSlug(title) : undefined;
  if (slugModels.has(model) && !slug) throw new AppError(400, "Provide a slug for this title");
  if (typeof slug === "string" && await db.cmsSlugRedirect.findUnique({ where: { model_oldSlug: { model, oldSlug: slug } } })) {
    throw new AppError(409, "This slug redirects to an existing record");
  }
  const data = {
    ...scalarInput(model, input), ...approval,
    ...(slug !== undefined ? { slug } : {})
  };
  const record = await delegate(model, db).create({ data });
  await writeMulti(model, record, input, db);
  return record;
}

export async function update(model: ModelName, id: string, input: Record<string, unknown>, db: Prisma.TransactionClient = prisma, approval?: RightsApproval) {
  validateWriteFields(model, input);
  if (typeof input.slug === "string") {
    const where = { model, oldSlug: input.slug };
    const redirect = await db.cmsSlugRedirect.findUnique({ where: { model_oldSlug: where } });
    if (redirect && redirect.recordId !== id) throw new AppError(409, "This slug redirects to an existing record");
    if (redirect) await db.cmsSlugRedirect.delete({ where: { model_oldSlug: where } });
  }
  const record = await delegate(model, db).update({ where: { id }, data: { ...scalarInput(model, input), ...approval } });
  await writeMulti(model, record, input, db);
  return record;
}

export async function remove(model: ModelName, id: string, db: Prisma.TransactionClient = prisma) {
  return delegate(model, db).delete({ where: { id } });
}

export async function findById(model: ModelName, id: string, db: Prisma.TransactionClient = prisma) {
  return delegate(model, db).findUnique({ where: { id } });
}

export type { ModelName };
