-- AlterTable
ALTER TABLE "EmailVerificationCode" ADD COLUMN     "kaynak" JSONB;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "kaynak" JSONB;

-- CreateTable
CREATE TABLE "GunlukSayac" (
    "anahtar" TEXT NOT NULL,
    "gun" DATE NOT NULL,
    "adet" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GunlukSayac_pkey" PRIMARY KEY ("anahtar","gun")
);
