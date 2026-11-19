import { Prisma } from "@prisma/client";
import type { RequestHandler } from "express";
import { AppError } from "@/errors/AppError";
import { writeAudit } from "@/utils/audit";
import { catchAsync } from "@/utils/catchAsync";
import { sendResponse } from "@/utils/sendResponse";
import * as service from "@/modules/cms/cms.service";
import type { ModelName } from "@/modules/cms/cms.service";
import { prisma } from "@/lib/prisma";
import { hasEditorialWorkflow } from "./editorial";
import { managedMediaPath, validateMediaReferences } from "@/modules/media/references";

const navigationPageSlugs = new Set(["about", "history", "mission-vision", "research", "admissions"]);

function auditFields(record: Record<string, unknown>) {
  return Object.fromEntries(["name", "title", "slug", "status", "access", "rightsVerified"].filter((key) => ["string", "boolean"].includes(typeof record[key]))
    .map((key) => [key, record[key]]));
}

export function listController(model: ModelName, publishedOnly = false): RequestHandler {
  return catchAsync(async (req, res) => {
    if (model === "academicAsset") res.set("Cache-Control", "private, no-store");
    const result = await service.list(model, { ...req.query, ...(publishedOnly ? { status: "PUBLISHED", publicOnly: true } : {}) });
    sendResponse(res, 200, { success: true, message: "Data fetched successfully", data: result.data, meta: result.meta });
  });
}

export function detailController(model: ModelName, publishedOnly = false): RequestHandler {
  return catchAsync(async (req, res) => {
    if (model === "academicAsset") res.set("Cache-Control", "private, no-store");
    const data = await service.findByIdOrSlug(model, String(req.params.idOrSlug), publishedOnly);
    if (!data) throw new AppError(404, "Record not found");
    sendResponse(res, 200, { success: true, message: "Data fetched successfully", data });
  });
}

export function createController(model: ModelName): RequestHandler {
  return catchAsync(async (req, res) => {
    if (model === "event") validateEventDates(req.body.startsAt, req.body.endsAt);
    if (model === "researchProject") validateProjectDates(req.body);
    if (hasEditorialWorkflow(model)) {
      if (req.body.status && req.body.status !== "DRAFT") throw new AppError(400, "New content must start as a draft");
      req.body.status = "DRAFT";
    }
    const data = await prisma.$transaction(async (db) => {
      await validateMediaReferences(db, req.body);
      const approval = model === "academicAsset" ? prepareRights(req.body, req.user!) : undefined;
      const record = await service.create(model, req.body, db, approval);
      await writeAudit(req, `CREATE_${model.toUpperCase()}`, model, record.id, undefined, auditFields(record), db);
      return record;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    sendResponse(res, 201, { success: true, message: "Data created successfully", data });
  });
}

export function updateController(model: ModelName): RequestHandler {
  return catchAsync(async (req, res) => {
    const id = String(req.params.id);
    const data = await prisma.$transaction(async (db) => {
      const oldValue = await service.findById(model, id, db);
      if (!oldValue) throw new AppError(404, "Record not found");
      if (hasEditorialWorkflow(model) && (oldValue.status !== "DRAFT" || (req.body.status && req.body.status !== "DRAFT"))) {
        throw new AppError(409, "Return this record to draft before editing it, or use an editorial action");
      }
      if (model === "page" && navigationPageSlugs.has(oldValue.slug) && req.body.slug && req.body.slug !== oldValue.slug) {
        throw new AppError(400, "This slug is used by site navigation and cannot be renamed");
      }
      if (model === "event") validateEventDates(req.body.startsAt ?? oldValue.startsAt, req.body.endsAt === undefined ? oldValue.endsAt : req.body.endsAt);
      if (model === "researchProject") validateProjectDates({ ...oldValue, ...req.body });
      await validateMediaReferences(db, req.body);
      const approval = model === "academicAsset" ? prepareRights(req.body, req.user!, oldValue) : undefined;
      const record = await service.update(model, id, req.body, db, approval);
      if (typeof oldValue.slug === "string" && record.slug !== oldValue.slug && hasEditorialWorkflow(model)) {
        await db.cmsSlugRedirect.upsert({
          where: { model_oldSlug: { model, oldSlug: oldValue.slug } },
          create: { model, oldSlug: oldValue.slug, recordId: id }, update: { recordId: id }
        });
      }
      await writeAudit(req, `UPDATE_${model.toUpperCase()}`, model, record.id, auditFields(oldValue), auditFields(record), db);
      return record;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    sendResponse(res, 200, { success: true, message: "Data updated successfully", data });
  });
}

function validateEventDates(start: unknown, end: unknown) {
  const timestamp = (value: unknown) => typeof value === "string" || value instanceof Date ? new Date(value).getTime() : NaN;
  const startsAt = timestamp(start);
  const endsAt = timestamp(end);
  if (!Number.isFinite(startsAt) || (end != null && (!Number.isFinite(endsAt) || endsAt < startsAt))) {
    throw new AppError(400, "Enter valid event dates with the end at or after the start");
  }
}

function prepareRights(body: Record<string, unknown>, user: { id: string; role: string }, previous?: Record<string, unknown>) {
  const file = body.fileUrl ?? previous?.fileUrl;
  if (typeof file !== "string" || !managedMediaPath.test(file)) throw new AppError(400, "Choose a managed document");
  if (previous && file !== previous.fileUrl) throw new AppError(409, "Create a replacement catalogue record for a different file");
  if (body.replacementId && body.replacementId === previous?.id) throw new AppError(400, "A record cannot replace itself");
  if (body.rightsVerified === true) {
    if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) throw new AppError(403, "Only an administrator can verify written rights");
    const statement = body.rightsStatement === undefined ? previous?.rightsStatement : body.rightsStatement;
    const evidence = body.rightsEvidence === undefined ? previous?.rightsEvidence : body.rightsEvidence;
    if (typeof statement !== "string" || !statement.trim() || typeof evidence !== "string" || !evidence.trim()) {
      throw new AppError(400, "Record a rights statement and a written evidence reference before verifying");
    }
    return { rightsApprovedAt: new Date(), rightsApprovedBy: user.id };
  }
  if (body.rightsVerified === false || ["rightsStatement", "rightsEvidence"].some((key) => body[key] !== undefined && body[key] !== previous?.[key])) {
    body.rightsVerified = false;
    return { rightsApprovedAt: null, rightsApprovedBy: null };
  }
}

function validateProjectDates(record: { startsAt?: string | Date | null; endsAt?: string | Date | null }) {
  if (record.startsAt && record.endsAt && new Date(record.endsAt) < new Date(record.startsAt)) {
    throw new AppError(400, "Project end cannot precede its start");
  }
}

export function deleteController(model: ModelName): RequestHandler {
  return catchAsync(async (req, res) => {
    if (model === "academicAsset") throw new AppError(409, "Archive catalogue records to preserve file rights history");
    const id = String(req.params.id);
    const data = await prisma.$transaction(async (db) => {
      const previous = await service.findById(model, id, db);
      if (!previous) throw new AppError(404, "Record not found");
      if (hasEditorialWorkflow(model) && !["DRAFT", "ARCHIVED"].includes(previous.status)) {
        throw new AppError(409, "Return the record to draft or archive it before deleting");
      }
      const record = await service.remove(model, id, db);
      await db.cmsSlugRedirect.deleteMany({ where: { model, recordId: id } });
      await db.publicationSchedule.deleteMany({ where: { model, recordId: id } });
      await writeAudit(req, `DELETE_${model.toUpperCase()}`, model, record.id, auditFields(record), undefined, db);
      return record;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    sendResponse(res, 200, { success: true, message: "Data deleted successfully", data });
  });
}
