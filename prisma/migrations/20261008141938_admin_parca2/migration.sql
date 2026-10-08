-- AlterTable
ALTER TABLE "Posting" ADD COLUMN     "adminDuzenledi" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "adminGizli" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "askiNedeni" TEXT,
ADD COLUMN     "askiyaAlindi" TIMESTAMP(3);
