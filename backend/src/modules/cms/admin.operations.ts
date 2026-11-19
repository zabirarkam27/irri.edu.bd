import { Router } from "express";
import { Prisma, Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/middlewares/auth";
import { validateRequest } from "@/middlewares/validateRequest";
import { AppError } from "@/errors/AppError";
import { catchAsync } from "@/utils/catchAsync";
import { getPagination } from "@/utils/query";
import { sendResponse } from "@/utils/sendResponse";
import { writeAudit } from "@/utils/audit";
import { listQuerySchema, writeParamsSchema } from "./cms.validation";

export const adminOperations = Router();
const administrators = requireRole(Role.SUPER_ADMIN, Role.ADMIN);
const inboxRoles = requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR);
const userSelect = { id: true, name: true, email: true, role: true, isActive: true, createdAt: true } as const;
const userUpdate = z.object({
  role: z.nativeEnum(Role).optional(), isActive: z.boolean().optional()
}).strict().refine((value) => Object.keys(value).length > 0);
const institutionFields = z.object({
  name: z.string().trim().min(2).max(250),
  nameBn: z.string().trim().max(250).nullable(),
  acronym: z.string().trim().min(1).max(30),
  location: z.string().trim().min(1).max(500),
  mission: z.string().trim().min(1).max(10000),
  missionBn: z.string().trim().max(10000).nullable(),
  vision: z.string().trim().min(1).max(10000),
  visionBn: z.string().trim().max(10000).nullable(),
  motto: z.string().trim().max(1000).nullable(),
  mottoBn: z.string().trim().max(1000).nullable(),
  domain: z.string().url().refine((value) => /^https?:\/\//i.test(value)),
  establishedAt: z.number().int().min(1000).max(9999).nullable(),
  operationStart: z.number().int().min(1000).max(9999).nullable()
}).strict();

adminOperations.get("/dashboard", requireAuth, catchAsync(async (req, res) => {
  const role = req.user!.role;
  const [news, notices, events, pages, recentNews, unread] = await Promise.all([
    prisma.newsPost.count({ where: { status: "PUBLISHED" } }),
    prisma.notice.count({ where: { status: "PUBLISHED" } }),
    prisma.event.count({ where: { status: "PUBLISHED" } }),
    prisma.page.count({ where: { status: "PUBLISHED" } }),
    prisma.newsPost.findMany({
      orderBy: [{ updatedAt: "desc" }, { id: "asc" }], take: 5,
      select: { id: true, title: true, status: true }
    }),
    role === Role.EDITOR ? null : prisma.contactMessage.count({ where: { isRead: false } })
  ]);
  sendResponse(res, 200, { success: true, message: "Dashboard loaded", data: { news, notices, events, pages, recentNews, unread } });
}));

adminOperations.get("/inbox", requireAuth, inboxRoles, validateRequest(z.object({
  query: listQuerySchema.shape.query.extend({ read: z.enum(["read", "unread"]).optional() })
})), catchAsync(async (req, res) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const search = typeof req.query.search === "string" ? req.query.search : "";
  const where: Prisma.ContactMessageWhereInput = {
    ...(req.query.read ? { isRead: req.query.read === "read" } : {}),
    ...(search ? { OR: ["name", "email", "subject"].map((field) => ({ [field]: { contains: search, mode: "insensitive" } })) } : {})
  };
  const [data, total] = await Promise.all([
    prisma.contactMessage.findMany({ where, skip, take, orderBy: [{ createdAt: "desc" }, { id: "asc" }] }),
    prisma.contactMessage.count({ where })
  ]);
  sendResponse(res, 200, { success: true, message: "Inbox loaded", data, meta: { page, limit, total, totalPage: Math.ceil(total / limit) } });
}));

adminOperations.patch("/inbox/:id", requireAuth, inboxRoles, validateRequest(writeParamsSchema.extend({
  body: z.object({ isRead: z.boolean() }).strict()
})), catchAsync(async (req, res) => {
  const id = String(req.params.id);
  const data = await prisma.$transaction(async (db) => {
    const record = await db.contactMessage.update({ where: { id }, data: req.body, select: { id: true, isRead: true } });
    await writeAudit(req, "UPDATE_CONTACT_STATUS", "contactMessage", record.id, undefined, { isRead: record.isRead }, db);
    return record;
  });
  sendResponse(res, 200, { success: true, message: "Message status saved", data });
}));

adminOperations.get("/users", requireAuth, administrators, validateRequest(listQuerySchema), catchAsync(async (req, res) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const search = typeof req.query.search === "string" ? req.query.search : "";
  const where: Prisma.UserWhereInput = search ? {
    OR: [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }]
  } : {};
  const [data, total] = await Promise.all([
    prisma.user.findMany({ where, select: userSelect, skip, take, orderBy: [{ name: "asc" }, { id: "asc" }] }),
    prisma.user.count({ where })
  ]);
  sendResponse(res, 200, { success: true, message: "Users loaded", data, meta: { page, limit, total, totalPage: Math.ceil(total / limit) } });
}));

adminOperations.patch("/users/:id", requireAuth, requireRole(Role.SUPER_ADMIN), validateRequest(writeParamsSchema.extend({
  body: userUpdate
})), catchAsync(async (req, res) => {
  const id = String(req.params.id);
  const body = userUpdate.parse(req.body);
  const data = await prisma.$transaction(async (db) => {
    const actor = await db.user.findUnique({ where: { id: req.user!.id }, select: { role: true, isActive: true } });
    if (!actor?.isActive || actor.role !== Role.SUPER_ADMIN) throw new AppError(403, "Forbidden");
    const previous = await db.user.findUniqueOrThrow({ where: { id }, select: { role: true, isActive: true } });
    const removesSuperAdmin = previous.isActive && previous.role === Role.SUPER_ADMIN &&
      (body.isActive === false || (body.role !== undefined && body.role !== Role.SUPER_ADMIN));
    if (removesSuperAdmin && await db.user.count({ where: { isActive: true, role: Role.SUPER_ADMIN } }) <= 1) {
      throw new AppError(409, "At least one active super admin must remain");
    }
    const user = await db.user.update({ where: { id }, data: body, select: userSelect });
    await writeAudit(req, "UPDATE_USER_ACCESS", "user", id, previous, { role: user.role, isActive: user.isActive }, db);
    return user;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  sendResponse(res, 200, { success: true, message: "User access saved", data });
}));

adminOperations.get("/institution", requireAuth, administrators, catchAsync(async (_req, res) => {
  const data = await prisma.institutionProfile.findFirst({ orderBy: [{ createdAt: "asc" }, { id: "asc" }] });
  sendResponse(res, 200, { success: true, message: "Institution loaded", data });
}));

const releaseSettings = z.strictObject({
  releaseOwner: z.string().trim().min(1).max(150).nullable(),
  rollbackOwner: z.string().trim().min(1).max(150).nullable(),
  alertDestination: z.string().trim().min(1).max(200).nullable(),
  releaseStartsAt: z.iso.datetime({ offset: true }).nullable(),
  releaseEndsAt: z.iso.datetime({ offset: true }).nullable()
}).refine(({ releaseStartsAt, releaseEndsAt }) => (releaseStartsAt === null && releaseEndsAt === null) ||
  (releaseStartsAt !== null && releaseEndsAt !== null && Date.parse(releaseStartsAt) < Date.parse(releaseEndsAt)),
  "Provide both dates with the release end after its start");

adminOperations.get("/release-settings", requireAuth, administrators, catchAsync(async (_req, res) => {
  res.set("Cache-Control", "private, no-store");
  const data = await prisma.releaseSettings.findUnique({ where: { id: "production" } });
  sendResponse(res, 200, { success: true, message: "Release settings loaded", data });
}));

adminOperations.put("/release-settings", requireAuth, administrators,
  validateRequest(z.object({ body: releaseSettings })), catchAsync(async (req, res) => {
    res.set("Cache-Control", "private, no-store");
    const body = releaseSettings.parse(req.body);
    const data = await prisma.$transaction(async (db) => {
      const where = { id: "production" };
      const previous = await db.releaseSettings.findUnique({ where });
      const record = await db.releaseSettings.upsert({ where, create: { ...where, ...body }, update: body });
      const changed = Object.keys(body).filter((key) => JSON.stringify(previous?.[key as keyof typeof body]) !== JSON.stringify(record[key as keyof typeof body]));
      await writeAudit(req, "SAVE_RELEASE_SETTINGS", "releaseSettings", record.id, undefined, { changed }, db);
      return record;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    sendResponse(res, 200, { success: true, message: "Release settings saved", data });
  }));

adminOperations.put("/institution", requireAuth, administrators, validateRequest(z.object({ body: institutionFields })),
  catchAsync(async (req, res) => {
    const data = await prisma.$transaction(async (db) => {
      const previous = await db.institutionProfile.findFirst({ orderBy: [{ createdAt: "asc" }, { id: "asc" }] });
      const record = previous
        ? await db.institutionProfile.update({ where: { id: previous.id }, data: req.body })
        : await db.institutionProfile.create({ data: req.body });
      await writeAudit(req, "SAVE_INSTITUTION_PROFILE", "institutionProfile", record.id, undefined, undefined, db);
      return record;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    sendResponse(res, 200, { success: true, message: "Institution saved", data });
  })
);
