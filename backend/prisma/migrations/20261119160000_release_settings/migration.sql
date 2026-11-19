CREATE TABLE "ReleaseSettings" (
    "id" TEXT NOT NULL,
    "releaseOwner" TEXT,
    "rollbackOwner" TEXT,
    "alertDestination" TEXT,
    "releaseStartsAt" TIMESTAMP(3),
    "releaseEndsAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ReleaseSettings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ReleaseSettings_singleton_check" CHECK ("id" = 'production'),
    CONSTRAINT "ReleaseSettings_window_check" CHECK (
      ("releaseStartsAt" IS NULL AND "releaseEndsAt" IS NULL)
      OR ("releaseStartsAt" IS NOT NULL AND "releaseEndsAt" IS NOT NULL AND "releaseStartsAt" < "releaseEndsAt")
    )
);
