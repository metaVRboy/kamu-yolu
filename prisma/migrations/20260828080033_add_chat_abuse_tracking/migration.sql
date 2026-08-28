-- CreateTable
CREATE TABLE "ChatAbuse" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "violationCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastViolationAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatAbuse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatAbuse_visitorId_key" ON "ChatAbuse"("visitorId");
