-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('ILKOGRETIM', 'LISE', 'ONLISANS', 'LISANS', 'YUKSEK_LISANS');

-- CreateEnum
CREATE TYPE "InstitutionType" AS ENUM ('BAKANLIK', 'UNIVERSITE', 'HASTANE', 'BELEDIYE', 'MUZE', 'KIT', 'DIGER');

-- CreateEnum
CREATE TYPE "ScrapeStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "level" "EducationLevel" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepartmentAlias" (
    "id" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,

    CONSTRAINT "DepartmentAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Posting" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "institutionName" TEXT NOT NULL,
    "institutionType" "InstitutionType" NOT NULL DEFAULT 'DIGER',
    "ilanTuru" TEXT,
    "iller" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sourceName" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "educationLevels" "EducationLevel"[] DEFAULT ARRAY[]::"EducationLevel"[],
    "departmentRequirementRaw" TEXT,
    "isDepartmentRestricted" BOOLEAN NOT NULL DEFAULT false,
    "applicationStart" TIMESTAMP(3),
    "applicationEnd" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Posting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrapeRun" (
    "id" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "status" "ScrapeStatus" NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "postingsFound" INTEGER,
    "positionsProcessed" INTEGER,
    "unmatchedCount" INTEGER,
    "staleDeactivated" INTEGER,
    "errorMessage" TEXT,

    CONSTRAINT "ScrapeRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostingDepartment" (
    "id" TEXT NOT NULL,
    "postingId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "matchedAlias" TEXT,

    CONSTRAINT "PostingDepartment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Department_slug_key" ON "Department"("slug");

-- CreateIndex
CREATE INDEX "DepartmentAlias_alias_idx" ON "DepartmentAlias"("alias");

-- CreateIndex
CREATE UNIQUE INDEX "DepartmentAlias_departmentId_alias_key" ON "DepartmentAlias"("departmentId", "alias");

-- CreateIndex
CREATE UNIQUE INDEX "Posting_externalId_key" ON "Posting"("externalId");

-- CreateIndex
CREATE INDEX "Posting_isActive_idx" ON "Posting"("isActive");

-- CreateIndex
CREATE INDEX "Posting_isDepartmentRestricted_idx" ON "Posting"("isDepartmentRestricted");

-- CreateIndex
CREATE INDEX "Posting_applicationEnd_idx" ON "Posting"("applicationEnd");

-- CreateIndex
CREATE INDEX "Posting_institutionType_idx" ON "Posting"("institutionType");

-- CreateIndex
CREATE INDEX "Posting_ilanTuru_idx" ON "Posting"("ilanTuru");

-- CreateIndex
CREATE UNIQUE INDEX "PostingDepartment_postingId_departmentId_key" ON "PostingDepartment"("postingId", "departmentId");

-- AddForeignKey
ALTER TABLE "DepartmentAlias" ADD CONSTRAINT "DepartmentAlias_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostingDepartment" ADD CONSTRAINT "PostingDepartment_postingId_fkey" FOREIGN KEY ("postingId") REFERENCES "Posting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostingDepartment" ADD CONSTRAINT "PostingDepartment_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;
