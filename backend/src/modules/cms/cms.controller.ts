import { Role } from "@prisma/client";
import type { RequestHandler } from "express";
import { AppError } from "@/errors/AppError";
import { writeAudit } from "@/utils/audit";
import { catchAsync } from "@/utils/catchAsync";
import { sendResponse } from "@/utils/sendResponse";
import * as service from "@/modules/cms/cms.service";
import type { ModelName } from "@/modules/cms/cms.service";

export function listController(model: ModelName): RequestHandler {
  return catchAsync(async (req, res) => {
    const result = await service.list(model, req.query);
    sendResponse(res, 200, { success: true, message: "Data fetched successfully", data: result.data, meta: result.meta });
  });
}

export function detailController(model: ModelName): RequestHandler {
  return catchAsync(async (req, res) => {
    const data = await service.findByIdOrSlug(model, String(req.params.idOrSlug));
    if (!data) throw new AppError(404, "Record not found");
    sendResponse(res, 200, { success: true, message: "Data fetched successfully", data });
  });
}

export function createController(model: ModelName): RequestHandler {
  return catchAsync(async (req, res) => {
    const data = await service.create(model, req.body);
    await writeAudit(req, `CREATE_${model.toUpperCase()}`, model, data.id, undefined, data);
    sendResponse(res, 201, { success: true, message: "Data created successfully", data });
  });
}

export function updateController(model: ModelName): RequestHandler {
  return catchAsync(async (req, res) => {
    const id = String(req.params.id);
    const oldValue = await service.findByIdOrSlug(model, id);
    if (!oldValue) throw new AppError(404, "Record not found");
    const data = await service.update(model, id, req.body);
    await writeAudit(req, `UPDATE_${model.toUpperCase()}`, model, data.id, oldValue, data);
    sendResponse(res, 200, { success: true, message: "Data updated successfully", data });
  });
}

export function deleteController(model: ModelName): RequestHandler {
  return catchAsync(async (req, res) => {
    if (model === "auditLog" && req.user?.role !== Role.SUPER_ADMIN) throw new AppError(403, "Only super admins can delete audit logs");
    const id = String(req.params.id);
    const oldValue = await service.findByIdOrSlug(model, id);
    if (!oldValue) throw new AppError(404, "Record not found");
    const data = await service.remove(model, id);
    await writeAudit(req, `DELETE_${model.toUpperCase()}`, model, data.id, oldValue, undefined);
    sendResponse(res, 200, { success: true, message: "Data deleted successfully", data });
  });
}
