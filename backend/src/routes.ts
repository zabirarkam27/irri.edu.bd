import { Router } from "express";
import { authRouter } from "@/modules/auth/auth.route";
import { contactRouter } from "@/modules/contact/contact.route";
import { cmsRouter } from "@/modules/cms/cms.route";
import { mediaRouter } from "@/modules/media/media.route";

export const router = Router();

router.use("/auth", authRouter);
router.use("/contact-messages", contactRouter);
router.use("/pages", cmsRouter("page"));
router.use("/people", cmsRouter("person"));
router.use("/departments", cmsRouter("department"));
router.use("/programs", cmsRouter("program"));
router.use("/courses", cmsRouter("course"));
router.use("/news", cmsRouter("newsPost"));
router.use("/notices", cmsRouter("notice"));
router.use("/events", cmsRouter("event"));
router.use("/gallery-albums", cmsRouter("galleryAlbum"));
router.use("/publications", cmsRouter("publication"));
router.use("/categories", cmsRouter("category"));
router.use("/media", cmsRouter("mediaAsset"));
router.use("/media", mediaRouter);
router.use("/audit-logs", cmsRouter("auditLog", true));
