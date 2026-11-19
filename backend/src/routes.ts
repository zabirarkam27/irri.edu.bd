import { Router } from "express";
import { authRouter } from "@/modules/auth/auth.route";
import { contactRouter } from "@/modules/contact/contact.route";
import { cmsRouter } from "@/modules/cms/cms.route";
import { mediaAdminRouter, mediaRouter } from "@/modules/media/media.route";
import { editorialRunner } from "@/modules/cms/editorial";
import { adminOperations } from "@/modules/cms/admin.operations";
import { prisma } from "@/lib/prisma";
import { catchAsync } from "@/utils/catchAsync";
import { sendResponse } from "@/utils/sendResponse";

export const router = Router();

router.use("/auth", authRouter);
router.get("/institution", catchAsync(async (_req, res) => {
  const data = await prisma.institutionProfile.findFirst({
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: { name: true, nameBn: true, location: true, motto: true, mission: true, vision: true, establishedAt: true, operationStart: true }
  });
  sendResponse(res, 200, { success: true, message: "Institution loaded", data });
}));
router.use("/contact-messages", contactRouter);
router.use("/pages", cmsRouter("page"));
router.use("/people", cmsRouter("person"));
router.use("/departments", cmsRouter("department"));
router.use("/programs", cmsRouter("program"));
router.use("/courses", cmsRouter("course"));
router.use("/news", cmsRouter("newsPost"));
router.use("/admin/news", cmsRouter("newsPost", true));
router.use("/notices", cmsRouter("notice"));
router.use("/events", cmsRouter("event"));
router.use("/gallery-albums", cmsRouter("galleryAlbum"));
router.use("/publications", cmsRouter("publication"));
router.use("/categories", cmsRouter("category"));
router.use("/media", mediaRouter);
router.get("/editorial/run", editorialRunner);
router.use("/audit-logs", cmsRouter("auditLog", true));
router.use("/admin", adminOperations);
router.use("/admin/pages", cmsRouter("page", true));
router.use("/admin/people", cmsRouter("person", true));
router.use("/admin/departments", cmsRouter("department", true));
router.use("/admin/programs", cmsRouter("program", true));
router.use("/admin/courses", cmsRouter("course", true));
router.use("/admin/notices", cmsRouter("notice", true));
router.use("/admin/events", cmsRouter("event", true));
router.use("/admin/gallery-albums", cmsRouter("galleryAlbum", true));
router.use("/admin/publications", cmsRouter("publication", true));
router.use("/admin/categories", cmsRouter("category", true));
router.use("/admin/audit-logs", cmsRouter("auditLog", true));
router.use("/admin/media", mediaAdminRouter);
