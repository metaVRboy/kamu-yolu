-- CreateEnum
CREATE TYPE "AbonelikPlani" AS ENUM ('UCRETSIZ', 'PRO', 'PRO_PLUS');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "abonelikPlani" "AbonelikPlani" NOT NULL DEFAULT 'UCRETSIZ';
