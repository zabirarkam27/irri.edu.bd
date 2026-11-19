ALTER TYPE "Status" ADD VALUE 'IN_REVIEW' BEFORE 'PUBLISHED';
ALTER TYPE "Status" ADD VALUE 'APPROVED' BEFORE 'PUBLISHED';

ALTER TABLE "MediaAsset" ADD COLUMN "storageKey" TEXT,
ADD COLUMN "thumbnailKey" TEXT;

CREATE TABLE "CmsSlugRedirect" (
    "model" TEXT NOT NULL,
    "oldSlug" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    CONSTRAINT "CmsSlugRedirect_pkey" PRIMARY KEY ("model", "oldSlug")
);
CREATE INDEX "CmsSlugRedirect_model_recordId_idx" ON "CmsSlugRedirect"("model", "recordId");

CREATE TABLE "PublicationSchedule" (
    "model" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "scheduledBy" TEXT NOT NULL,
    CONSTRAINT "PublicationSchedule_pkey" PRIMARY KEY ("model", "recordId")
);
CREATE INDEX "PublicationSchedule_scheduledAt_idx" ON "PublicationSchedule"("scheduledAt");

CREATE TABLE "MediaGarbage" (
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MediaGarbage_pkey" PRIMARY KEY ("key")
);
