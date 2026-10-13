-- AlterTable
ALTER TABLE "EmailVerificationCode" ADD COLUMN     "ticariIletiOnay" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "ticariIletiOnay" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ticariIletiOnayTarihi" TIMESTAMP(3),
ADD COLUMN     "ticariIletiRetTarihi" TIMESTAMP(3);
