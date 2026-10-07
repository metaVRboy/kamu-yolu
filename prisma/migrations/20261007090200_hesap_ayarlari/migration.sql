-- DropForeignKey
ALTER TABLE "BecayisMesaj" DROP CONSTRAINT "BecayisMesaj_gonderenId_fkey";

-- AlterTable
ALTER TABLE "BecayisMesaj" ALTER COLUMN "gonderenId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Oturum" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cihaz" TEXT NOT NULL,
    "olusturma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sonGorulme" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kapatildi" TIMESTAMP(3),

    CONSTRAINT "Oturum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfilFotografi" (
    "userId" TEXT NOT NULL,
    "veri" BYTEA NOT NULL,
    "tur" TEXT NOT NULL,
    "guncellenme" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfilFotografi_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "EpostaDegisiklikKodu" (
    "userId" TEXT NOT NULL,
    "yeniEmail" TEXT NOT NULL,
    "kod" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EpostaDegisiklikKodu_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE INDEX "Oturum_userId_idx" ON "Oturum"("userId");

-- AddForeignKey
ALTER TABLE "Oturum" ADD CONSTRAINT "Oturum_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfilFotografi" ADD CONSTRAINT "ProfilFotografi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EpostaDegisiklikKodu" ADD CONSTRAINT "EpostaDegisiklikKodu_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BecayisMesaj" ADD CONSTRAINT "BecayisMesaj_gonderenId_fkey" FOREIGN KEY ("gonderenId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
