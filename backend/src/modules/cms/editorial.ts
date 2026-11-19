import { timingSafeEqual } from "node:crypto";
import { Prisma, Role, Status } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/errors/AppError";
import { catchAsync } from "@/utils/catchAsync";
import { writeAudit } from "@/utils/audit";
import { sendResponse } from "@/utils/sendResponse";
import { cleanMediaGarbage } from "@/modules/media/media.route";
import { findById, update, type ModelName } from "./cms.service";
import { writeParamsSchema } from "./cms.validation";

const editorialModels = ["page", "person", "department", "program", "course", "newsPost", "notice", "event", "galleryAlbum", "publication"];
export function hasEditorialWorkflow(model: string): model is EditorialModel {
  return editorialModels.includes(model);
}
type EditorialModel = Exclude<ModelName, "category" | "mediaAsset" | "auditLog">;
const publishers = [Role.SUPER_ADMIN, Role.ADMIN] as Role[];
const reviewers = [...publishers, Role.MODERATOR];

const transition = z.enum(["submit", "approve", "return", "publish", "archive", "schedule", "cancel"]);
export const transitionSchema = writeParamsSchema.extend({ body: z.object({
  action: transition,
  comment: z.string().trim().max(2000).optional(),
  scheduledAt: z.string().datetime({ offset: true }).optional()
}).strict() });

function target(action: z.infer<typeof transition>, status: Status, role: Role) {
  const publish = publishers.includes(role);
  const review = reviewers.includes(role);
  switch (action) {
    case "submit":
      if (role !== Role.MODERATOR && status === Status.DRAFT) return Status.IN_REVIEW;
      break;
    case "approve":
      if (review && status === Status.IN_REVIEW) return Status.APPROVED;
      break;
    case "return":
      if ((review && (status === Status.IN_REVIEW || status === Status.APPROVED)) ||
        (publish && (status === Status.PUBLISHED || status === Status.ARCHIVED))) return Status.DRAFT;
      break;
    case "publish":
      if (publish && status === Status.APPROVED) return Status.PUBLISHED;
      break;
    case "archive":
      if (publish && status === Status.PUBLISHED) return Status.ARCHIVED;
      break;
    case "schedule":
    case "cancel":
      if (publish && status === Status.APPROVED) return Status.APPROVED;
      break;
  }
  throw new AppError(403, "This editorial action is unavailable for your role or the current status");
}

function publicationData(model: EditorialModel, status: Status) {
  return { status, ...(status === Status.PUBLISHED && ["newsPost", "notice", "publication"].includes(model) ? { publishedAt: new Date() } : {}) };
}

export function readSchedule(model: EditorialModel) {
  return catchAsync(async (req, res) => {
    const recordId = String(req.params.id);
    const schedule = await prisma.publicationSchedule.findUnique({ where: { model_recordId: { model, recordId } },
      select: { scheduledAt: true } });
    sendResponse(res, 200, { success: true, message: "Editorial state", data: { schedule, enabled: Boolean(process.env.CRON_SECRET) } });
  });
}

export function runTransition(model: EditorialModel) {
  return catchAsync(async (req, res) => {
    const recordId = String(req.params.id);
    const { action, comment, scheduledAt } = transitionSchema.shape.body.parse(req.body);
    const where = { model, recordId };
    const data = await prisma.$transaction(async (db) => {
      const record = await findById(model, recordId, db);
      if (!record) throw new AppError(404, "Record not found");
      const next = target(action, record.status, req.user!.role);
      if (action === "schedule") {
        if (!process.env.CRON_SECRET) throw new AppError(503, "Scheduled publishing is not configured");
        const when = scheduledAt ? new Date(scheduledAt) : null;
        if (!when || when <= new Date()) throw new AppError(400, "Choose a future publication date");
        await db.publicationSchedule.upsert({ where: { model_recordId: where },
          create: { ...where, scheduledAt: when, scheduledBy: req.user!.id },
          update: { scheduledAt: when, scheduledBy: req.user!.id } });
      } else {
        await db.publicationSchedule.deleteMany({ where });
        if (action !== "cancel") await update(model, recordId, publicationData(model, next), db);
      }
      await writeAudit(req, "EDITORIAL_" + action.toUpperCase(), model, recordId,
        { status: record.status }, { status: next, ...(comment ? { comment } : {}), ...(action === "schedule" ? { scheduledAt } : {}) }, db);
      return { status: next };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    sendResponse(res, 200, { success: true, message: "Editorial action saved", data });
  });
}

export const editorialRunner = catchAsync(async (req, res) => {
  const secret = process.env.CRON_SECRET;
  const authorization = Buffer.from(req.get("authorization") ?? "");
  const expected = Buffer.from("Bearer " + (secret ?? ""));
  if (!secret || authorization.length !== expected.length || !timingSafeEqual(authorization, expected)) {
    throw new AppError(401, "Authentication required");
  }
  const due = await prisma.publicationSchedule.findMany({ where: { scheduledAt: { lte: new Date() } },
    orderBy: { scheduledAt: "asc" }, take: 25 });
  let published = 0;
  let failed = 0;
  for (const job of due) {
    try {
      const applied = await prisma.$transaction(async (db) => {
        const { model, recordId } = job;
        const where = { model, recordId, scheduledAt: job.scheduledAt, scheduledBy: job.scheduledBy };
        const claimed = await db.publicationSchedule.deleteMany({ where });
        if (!claimed.count || !hasEditorialWorkflow(model)) return;
        const record = await findById(model, recordId, db);
        const user = await db.user.findUnique({ where: { id: job.scheduledBy }, select: { isActive: true, role: true } });
        if (!record || record.status !== Status.APPROVED || !user?.isActive || !publishers.includes(user.role)) {
          if (record) await db.auditLog.create({ data: {
            entity: model, entityId: recordId, userId: user ? job.scheduledBy : undefined, action: "EDITORIAL_SCHEDULE_CANCELLED"
          } });
          return;
        }
        await update(model, recordId, publicationData(model, Status.PUBLISHED), db);
        await db.auditLog.create({ data: { entity: model, entityId: recordId, userId: job.scheduledBy,
          action: "EDITORIAL_SCHEDULED_PUBLISH", oldValue: { status: Status.APPROVED }, newValue: { status: Status.PUBLISHED } } });
        return true;
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
      if (applied) published++;
    } catch {
      failed++;
    }
  }
  await cleanMediaGarbage();
  sendResponse(res, failed ? 503 : 200, { success: !failed, message: "Editorial schedule processed", data: { published, failed } });
});
