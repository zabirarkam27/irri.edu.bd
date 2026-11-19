import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { catchAsync } from "@/utils/catchAsync";
import { validateRequest } from "@/middlewares/validateRequest";
import { sendResponse } from "@/utils/sendResponse";
import { samplePageSuffix } from "./cms.service";

const sources = [
  ["news", "NewsPost", "title", "titleBn", "content", "contentBn"],
  ["notices", "Notice", "title", "titleBn", "content", "contentBn"],
  ["events", "Event", "title", "titleBn", "content", "contentBn"],
  ["publications", "Publication", "title", "titleBn", "abstract", "author"],
  ["research-areas", "ResearchArea", "title", "titleBn", "description", "contentBn"],
  ["research-projects", "ResearchProject", "title", "titleBn", "description", "contentBn"],
  ["academic-programs", "Program", "title", "titleBn", "description", null],
  ["courses", "Course", "title", "titleBn", "description", "code"],
  ["departments", "Department", "name", "nameBn", "description", null],
  ["administration", "Person", "name", "nameBn", "bio", "designation"],
  ["gallery", "GalleryAlbum", "title", "titleBn", "description", null],
  ["pages", "Page", "title", "titleBn", "content", "contentBn"]
] as const;
const hideSamplePages = (table: string) => table === "Page"
  ? Prisma.sql`AND RIGHT("content", ${samplePageSuffix.length}::int) <> ${samplePageSuffix}` : Prisma.empty;

export const publicSitemap = catchAsync(async (_req, res) => {
  const queries = sources.map(([type, table, , titleBn, , extra]) => Prisma.sql`
    SELECT ${type}::text AS type, "slug", "updatedAt",
      (NULLIF(BTRIM(${Prisma.raw(`"${titleBn}"`)}), '') IS NOT NULL
        ${extra === "contentBn" ? Prisma.sql`OR NULLIF(BTRIM("contentBn"), '') IS NOT NULL` : Prisma.empty}) AS translated
    FROM ${Prisma.raw(`"${table}"`)} WHERE "status" = 'PUBLISHED' ${hideSamplePages(table)}`);
  const data = await prisma.$queryRaw(Prisma.sql`${Prisma.join(queries, " UNION ALL ")} ORDER BY type, slug`);
  sendResponse(res, 200, { success: true, message: "Published URLs", data });
});

const querySchema = z.object({
  q: z.string().trim().min(2).max(120),
  type: z.string().refine((value) => sources.some(([type]) => value === type)).optional(),
  page: z.coerce.number().int().min(1).max(1000).default(1)
});

export const validatePublicSearch = validateRequest(z.object({ query: querySchema }));

export const publicSearch = catchAsync(async (req, res) => {
  const { q, type, page } = querySchema.parse(req.query);
  const column = (name: string | null) => name ? Prisma.raw(`"${name}"`) : Prisma.sql`NULL::text`;
  const queries = sources.filter(([kind]) => !type || kind === type).map(([kind, table, title, titleBn, text, extra]) => {
    const headline = column(title);
    const translated = column(titleBn);
    const body = column(text);
    return Prisma.sql`
      SELECT ${kind}::text AS type, "slug", ${headline} AS title, ${translated} AS "titleBn",
        LEFT(${body}, 160) AS excerpt, ${extra === "contentBn" ? Prisma.sql`LEFT("contentBn", 160)` : Prisma.sql`NULL::text`} AS "excerptBn", "updatedAt",
        CASE WHEN strpos(lower(concat_ws(' ', ${headline}, ${translated})), lower(${q})) > 0 THEN 0 ELSE 1 END AS rank
      FROM ${column(table)}
      WHERE "status" = 'PUBLISHED' ${hideSamplePages(table)} AND strpos(lower(concat_ws(' ', ${headline}, ${translated}, ${body}, ${column(extra)})), lower(${q})) > 0`;
  });
  const combined = Prisma.join(queries, " UNION ALL ");
  const limit = 12;
  const [data, count] = await prisma.$transaction([
    prisma.$queryRaw(Prisma.sql`SELECT type, slug, title, "titleBn", excerpt, "excerptBn" FROM (${combined}) AS results
      ORDER BY rank, "updatedAt" DESC, type, slug LIMIT ${limit} OFFSET ${(page - 1) * limit}`),
    prisma.$queryRaw<{ total: number }[]>(Prisma.sql`SELECT COUNT(*)::int AS total FROM (${combined}) AS results`)
  ], { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
  const total = count[0].total;
  sendResponse(res, 200, { success: true, message: "Search results", data,
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) } });
});
