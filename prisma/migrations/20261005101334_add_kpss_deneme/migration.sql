-- CreateEnum
CREATE TYPE "DenemeDers" AS ENUM ('TURKCE', 'MATEMATIK', 'TARIH', 'COGRAFYA', 'VATANDASLIK', 'GUNCEL');

-- CreateTable
CREATE TABLE "DenemeSoru" (
    "id" TEXT NOT NULL,
    "duzey" "EducationLevel" NOT NULL,
    "ders" "DenemeDers" NOT NULL,
    "soruMetni" TEXT NOT NULL,
    "secenekler" TEXT[],
    "dogruCevap" INTEGER NOT NULL,
    "aciklama" TEXT,
    "olusturmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kullanimSayisi" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DenemeSoru_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GunlukDeneme" (
    "id" TEXT NOT NULL,
    "duzey" "EducationLevel" NOT NULL,
    "tarih" DATE NOT NULL,
    "soruIdler" TEXT[],

    CONSTRAINT "GunlukDeneme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DenemeKatilim" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gunlukDenemeId" TEXT NOT NULL,
    "baslangicZamani" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bitisZamani" TIMESTAMP(3),
    "cevaplar" JSONB NOT NULL DEFAULT '{}',
    "dogruSayisi" INTEGER,
    "yanlisSayisi" INTEGER,
    "bosSayisi" INTEGER,
    "puan" DOUBLE PRECISION,

    CONSTRAINT "DenemeKatilim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DenemeSoru_duzey_ders_kullanimSayisi_idx" ON "DenemeSoru"("duzey", "ders", "kullanimSayisi");

-- CreateIndex
CREATE UNIQUE INDEX "GunlukDeneme_duzey_tarih_key" ON "GunlukDeneme"("duzey", "tarih");

-- CreateIndex
CREATE UNIQUE INDEX "DenemeKatilim_userId_gunlukDenemeId_key" ON "DenemeKatilim"("userId", "gunlukDenemeId");

-- AddForeignKey
ALTER TABLE "DenemeKatilim" ADD CONSTRAINT "DenemeKatilim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DenemeKatilim" ADD CONSTRAINT "DenemeKatilim_gunlukDenemeId_fkey" FOREIGN KEY ("gunlukDenemeId") REFERENCES "GunlukDeneme"("id") ON DELETE CASCADE ON UPDATE CASCADE;
