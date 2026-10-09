-- AlterTable
ALTER TABLE "BecayisMesaj" ADD COLUMN     "sikayetEdildi" TIMESTAMP(3),
ADD COLUMN     "sikayetIncelendi" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "SoruHataBildirimi" (
    "id" TEXT NOT NULL,
    "soruId" TEXT NOT NULL,
    "userId" TEXT,
    "aciklama" TEXT NOT NULL,
    "cozuldu" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SoruHataBildirimi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DestekMesaji" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "ad" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "konu" TEXT NOT NULL,
    "mesaj" TEXT NOT NULL,
    "plan" "AbonelikPlani" NOT NULL DEFAULT 'UCRETSIZ',
    "yanit" TEXT,
    "yanitlandi" TIMESTAMP(3),
    "kapatildi" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DestekMesaji_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteAyarlari" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "bakimModu" BOOLEAN NOT NULL DEFAULT false,
    "bakimMesaji" TEXT,
    "seritMetni" TEXT,
    "seritLink" TEXT,
    "seritTur" TEXT NOT NULL DEFAULT 'bilgi',
    "guncelleme" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteAyarlari_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminIslem" (
    "id" TEXT NOT NULL,
    "adminId" TEXT,
    "adminAdi" TEXT NOT NULL,
    "islem" TEXT NOT NULL,
    "hedef" TEXT,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminIslem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SoruHataBildirimi_cozuldu_idx" ON "SoruHataBildirimi"("cozuldu");

-- CreateIndex
CREATE UNIQUE INDEX "SoruHataBildirimi_soruId_userId_key" ON "SoruHataBildirimi"("soruId", "userId");

-- CreateIndex
CREATE INDEX "DestekMesaji_kapatildi_createdAt_idx" ON "DestekMesaji"("kapatildi", "createdAt");

-- CreateIndex
CREATE INDEX "AdminIslem_createdAt_idx" ON "AdminIslem"("createdAt");

-- CreateIndex
CREATE INDEX "AdminIslem_islem_idx" ON "AdminIslem"("islem");

-- CreateIndex
CREATE INDEX "BecayisMesaj_sikayetEdildi_idx" ON "BecayisMesaj"("sikayetEdildi");

-- AddForeignKey
ALTER TABLE "SoruHataBildirimi" ADD CONSTRAINT "SoruHataBildirimi_soruId_fkey" FOREIGN KEY ("soruId") REFERENCES "DenemeSoru"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoruHataBildirimi" ADD CONSTRAINT "SoruHataBildirimi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DestekMesaji" ADD CONSTRAINT "DestekMesaji_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
