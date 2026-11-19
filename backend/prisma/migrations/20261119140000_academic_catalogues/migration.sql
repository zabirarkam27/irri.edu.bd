-- CreateEnum
CREATE TYPE "AcademicAssetKind" AS ENUM ('REPOSITORY', 'RESOURCE');

-- CreateEnum
CREATE TYPE "AcademicAccess" AS ENUM ('PRIVATE', 'PUBLIC');

-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "departmentId" TEXT,
ADD COLUMN     "education" TEXT,
ADD COLUMN     "interests" TEXT,
ADD COLUMN     "officialEmail" TEXT;

-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "headId" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "objectives" TEXT,
ADD COLUMN     "officialEmail" TEXT,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "unitType" TEXT;

-- AlterTable
ALTER TABLE "Program" ADD COLUMN     "admissions" TEXT,
ADD COLUMN     "applicationStatus" TEXT,
ADD COLUMN     "code" TEXT,
ADD COLUMN     "deliveryMode" TEXT,
ADD COLUMN     "eligibility" TEXT,
ADD COLUMN     "fileUrl" TEXT,
ADD COLUMN     "objectives" TEXT,
ADD COLUMN     "officialEmail" TEXT,
ADD COLUMN     "programType" TEXT;

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "fileUrl" TEXT,
ADD COLUMN     "instructorId" TEXT,
ADD COLUMN     "outcomes" TEXT;

-- AlterTable
ALTER TABLE "NewsPost" ADD COLUMN     "departmentId" TEXT;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "academicCalendar" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Publication" ADD COLUMN     "authors" TEXT,
ADD COLUMN     "citation" TEXT,
ADD COLUMN     "departmentId" TEXT,
ADD COLUMN     "doi" TEXT,
ADD COLUMN     "editors" TEXT,
ADD COLUMN     "externalUrl" TEXT,
ADD COLUMN     "isbn" TEXT,
ADD COLUMN     "issn" TEXT,
ADD COLUMN     "journal" TEXT,
ADD COLUMN     "keywords" TEXT,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "projectId" TEXT,
ADD COLUMN     "publicationType" TEXT,
ADD COLUMN     "publisher" TEXT;

-- CreateTable
CREATE TABLE "ResearchArea" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleBn" TEXT,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "contentBn" TEXT,
    "departmentId" TEXT,
    "status" "Status" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchProject" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleBn" TEXT,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "contentBn" TEXT,
    "projectStatus" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "publicFunding" TEXT,
    "outputs" TEXT,
    "areaId" TEXT,
    "departmentId" TEXT,
    "leadId" TEXT,
    "status" "Status" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicAsset" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleBn" TEXT,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "contentBn" TEXT,
    "kind" "AcademicAssetKind" NOT NULL,
    "access" "AcademicAccess" NOT NULL DEFAULT 'PRIVATE',
    "rightsStatement" TEXT,
    "rightsEvidence" TEXT,
    "rightsVerified" BOOLEAN NOT NULL DEFAULT false,
    "rightsApprovedBy" TEXT,
    "rightsApprovedAt" TIMESTAMP(3),
    "language" TEXT,
    "version" TEXT,
    "fileUrl" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "categoryId" TEXT,
    "replacementId" TEXT,
    "status" "Status" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProjectTeam" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProjectTeam_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PublicationContributors" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PublicationContributors_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CoursePrerequisites" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CoursePrerequisites_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResearchArea_slug_key" ON "ResearchArea"("slug");

-- CreateIndex
CREATE INDEX "ResearchArea_departmentId_status_idx" ON "ResearchArea"("departmentId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ResearchProject_slug_key" ON "ResearchProject"("slug");

-- CreateIndex
CREATE INDEX "ResearchProject_areaId_status_idx" ON "ResearchProject"("areaId", "status");

-- CreateIndex
CREATE INDEX "ResearchProject_departmentId_status_idx" ON "ResearchProject"("departmentId", "status");

-- CreateIndex
CREATE INDEX "ResearchProject_leadId_idx" ON "ResearchProject"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicAsset_slug_key" ON "AcademicAsset"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicAsset_fileUrl_key" ON "AcademicAsset"("fileUrl");

-- CreateIndex
CREATE INDEX "AcademicAsset_kind_status_access_expiresAt_idx" ON "AcademicAsset"("kind", "status", "access", "expiresAt");

-- CreateIndex
CREATE INDEX "AcademicAsset_categoryId_idx" ON "AcademicAsset"("categoryId");

-- CreateIndex
CREATE INDEX "_ProjectTeam_B_index" ON "_ProjectTeam"("B");

-- CreateIndex
CREATE INDEX "_PublicationContributors_B_index" ON "_PublicationContributors"("B");

-- CreateIndex
CREATE INDEX "_CoursePrerequisites_B_index" ON "_CoursePrerequisites"("B");

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_headId_fkey" FOREIGN KEY ("headId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsPost" ADD CONSTRAINT "NewsPost_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ResearchProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchArea" ADD CONSTRAINT "ResearchArea_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchProject" ADD CONSTRAINT "ResearchProject_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "ResearchArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchProject" ADD CONSTRAINT "ResearchProject_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchProject" ADD CONSTRAINT "ResearchProject_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicAsset" ADD CONSTRAINT "AcademicAsset_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicAsset" ADD CONSTRAINT "AcademicAsset_replacementId_fkey" FOREIGN KEY ("replacementId") REFERENCES "AcademicAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectTeam" ADD CONSTRAINT "_ProjectTeam_A_fkey" FOREIGN KEY ("A") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectTeam" ADD CONSTRAINT "_ProjectTeam_B_fkey" FOREIGN KEY ("B") REFERENCES "ResearchProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PublicationContributors" ADD CONSTRAINT "_PublicationContributors_A_fkey" FOREIGN KEY ("A") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PublicationContributors" ADD CONSTRAINT "_PublicationContributors_B_fkey" FOREIGN KEY ("B") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoursePrerequisites" ADD CONSTRAINT "_CoursePrerequisites_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoursePrerequisites" ADD CONSTRAINT "_CoursePrerequisites_B_fkey" FOREIGN KEY ("B") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Verified rights must be attributable and backed by written evidence.
ALTER TABLE "AcademicAsset" ADD CONSTRAINT "AcademicAsset_verified_rights_check" CHECK (
    NOT "rightsVerified" OR (
        NULLIF(BTRIM("rightsStatement"), '') IS NOT NULL
        AND NULLIF(BTRIM("rightsEvidence"), '') IS NOT NULL
        AND "rightsApprovedBy" IS NOT NULL
        AND "rightsApprovedAt" IS NOT NULL
    )
);
