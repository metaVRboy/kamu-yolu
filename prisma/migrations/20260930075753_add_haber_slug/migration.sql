-- AlterTable: add slug as nullable first so existing rows can be backfilled
ALTER TABLE "Haber" ADD COLUMN "slug" TEXT;

-- Backfill existing rows with a unique (id-based) placeholder slug. New
-- rows going forward get a proper title-based slug from application code
-- (see src/lib/slug.ts buildHaberSlug) - these old ones are superseded by
-- fresh scrapes within days anyway.
UPDATE "Haber" SET "slug" = 'haber-' || "id" WHERE "slug" IS NULL;

-- AlterTable: now safe to enforce NOT NULL + uniqueness
ALTER TABLE "Haber" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "Haber_slug_key" ON "Haber"("slug");
