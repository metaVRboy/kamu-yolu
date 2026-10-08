-- AlterTable
ALTER TABLE "Duyuru" ADD COLUMN     "aliciSayisi" INTEGER,
ADD COLUMN     "geriCekildi" TIMESTAMP(3),
ADD COLUMN     "hedefDeger" TEXT,
ADD COLUMN     "hedefTur" TEXT NOT NULL DEFAULT 'HERKES',
ADD COLUMN     "link" TEXT,
ADD COLUMN     "olusturanId" TEXT,
ADD COLUMN     "yayinZamani" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "duyuruGorulme" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "PlanFiyat" (
    "plan" "AbonelikPlani" NOT NULL,
    "aylik" INTEGER NOT NULL,
    "yillik" INTEGER NOT NULL,
    "guncelleme" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanFiyat_pkey" PRIMARY KEY ("plan")
);

-- CreateTable
CREATE TABLE "Kampanya" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "yuzde" INTEGER,
    "tutar" INTEGER,
    "planlar" "AbonelikPlani"[],
    "aylik" BOOLEAN NOT NULL DEFAULT true,
    "yillik" BOOLEAN NOT NULL DEFAULT true,
    "baslangic" TIMESTAMP(3) NOT NULL,
    "bitis" TIMESTAMP(3) NOT NULL,
    "kuponKodu" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "olusturanId" TEXT,
    "olusturma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Kampanya_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Kampanya_kuponKodu_key" ON "Kampanya"("kuponKodu");

-- CreateIndex
CREATE INDEX "Duyuru_yayinZamani_idx" ON "Duyuru"("yayinZamani");

-- Veri: eski duyurular olusturulduklari anda yayinlanmis sayilir.
UPDATE "Duyuru" SET "yayinZamani" = "createdAt";

-- Veri: mevcut uyeler eski duyurulari gormus sayilir (zilde toplu kirmizi nokta cikmasin).
UPDATE "User" SET "duyuruGorulme" = CURRENT_TIMESTAMP;

-- Veri: bugunku fiyatlar (lib/planlar.ts'teki eski sabitler).
INSERT INTO "PlanFiyat" ("plan", "aylik", "yillik", "guncelleme") VALUES
  ('PRO', 59, 529, CURRENT_TIMESTAMP),
  ('PRO_PLUS', 79, 699, CURRENT_TIMESTAMP);
