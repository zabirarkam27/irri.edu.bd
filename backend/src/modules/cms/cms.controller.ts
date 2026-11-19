import { Prisma } from "@prisma/client";
import type { RequestHandler } from "express";
import { AppError } from "@/errors/AppError";
import { writeAudit } from "@/utils/audit";
import { catchAsync } from "@/utils/catchAsync";
import { sendResponse } from "@/utils/sendResponse";
import * as service from "@/modules/cms/cms.service";
import type { ModelName } from "@/modules/cms/cms.service";
import { prisma } from "@/lib/prisma";

const navigationPageSlugs = new Set(["about", "history", "mission-vision", "research"]);

function auditFields(record: Record<string, unknown>) {
  return Object.fromEntries(["name", "title", "slug", "status"].filter((key) => typeof record[key] === "string")
    .map((key) => [key, record[key]]));
}

export function listController(model: ModelName, publishedOnly = false): RequestHandler {
  return catchAsync(async (req, res) => {
    const result = await service.list(model, { ...req.query, ...(publishedOnly ? { status: "PUBLISHED" } : {}) });
    sendResponse(res, 200, { success: true, message: "Data fetched successfully", data: result.data, meta: result.meta });
  });
}

export function detailController(model: ModelName, publishedOnly = false): RequestHandler {
  return catchAsync(async (req, res) => {
    const data = await service.findByIdOrSlug(model, String(req.params.idOrSlug), publishedOnly);
    if (!data) throw new AppError(404, "Record not found");
    sendResponse(res, 200, { success: true, message: "Data fetched successfully", data });
  });
}

export function createController(model: ModelName): RequestHandler {
  return catchAsync(async (req, res) => {
    if (model === "event") validateEventDates(req.body.startsAt, req.body.endsAt);
    if (model === "newsPost" && req.body.status === "PUBLISHED" && req.body.publishedAt === undefined) {
      req.body.publishedAt = new Date();
    }
    const data = await prisma.$transaction(async (db) => {
      const record = await service.create(model, req.body, db);
      await writeAudit(req, `CREATE_${model.toUpperCase()}`, model, record.id, undefined, auditFields(record), db);
      return record;
    });
    sendResponse(res, 201, { success: true, message: "Data created successfully", data });
  });
}

export function updateController(model: ModelName): RequestHandler {
  return catchAsync(async (req, res) => {
    const id = String(req.params.id);
    const data = await prisma.$transaction(async (db) => {
      const oldValue = await service.findById(model, id, db);
      if (!oldValue) throw new AppError(404, "Record not found");
      if (model === "page" && navigationPageSlugs.has(oldValue.slug) && req.body.slug && req.body.slug !== oldValue.slug) {
        throw new AppError(400, "This slug is used by site navigation and cannot be renamed");
      }
      if (model === "event") validateEventDates(req.body.startsAt ?? oldValue.startsAt, req.body.endsAt === undefined ? oldValue.endsAt : req.body.endsAt);
      if (model === "newsPost" && req.body.status === "PUBLISHED" && !oldValue.publishedAt && req.body.publishedAt === undefined) {
        req.body.publishedAt = new Date();
      }
      const record = await service.update(model, id, req.body, db);
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

export function deleteController(model: ModelName): RequestHandler {
  return catchAsync(async (req, res) => {
    const id = String(req.params.id);
    const data = await prisma.$transaction(async (db) => {
      const record = await service.remove(model, id, db);
      await writeAudit(req, `DELETE_${model.toUpperCase()}`, model, record.id, auditFields(record), undefined, db);
      return record;
    });
    sendResponse(res, 200, { success: true, message: "Data deleted successfully", data });
  });
}
