-- AlterTable
ALTER TABLE "Oturum" ADD COLUMN     "adminDogrulama" TIMESTAMP(3),
ADD COLUMN     "adminKodBitis" TIMESTAMP(3),
ADD COLUMN     "adminKodDeneme" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "adminKodOzeti" TEXT;
