import type { Request } from "express";
import { prisma } from "@/lib/prisma";

export async function writeAudit(req: Request, action: string, entity: string, entityId?: string, oldValue?: unknown, newValue?: unknown) {
  await prisma.auditLog.create({
    data: {
      userId: req.user?.id,
      action,
      entity,
      entityId,
      oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : undefined,
      newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : undefined,
      ipAddress: req.ip,
      userAgent: req.get("user-agent")
    }
  });
}
