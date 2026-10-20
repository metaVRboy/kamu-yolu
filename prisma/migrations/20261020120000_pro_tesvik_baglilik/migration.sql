-- AlterTable
ALTER TABLE "BecayisTalep" ADD COLUMN     "goruntulenme" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "SiteAyarlari" ADD COLUMN     "kpssSinavAdi" TEXT,
ADD COLUMN     "kpssSinavTarihi" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "davetEdenId" TEXT,
ADD COLUMN     "davetKodu" TEXT;

-- CreateTable
CREATE TABLE "ProHediye" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "neden" TEXT NOT NULL,
    "gun" INTEGER NOT NULL,
    "olusturma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProHediye_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GunlukSoruSeti" (
    "id" TEXT NOT NULL,
    "duzey" "EducationLevel" NOT NULL,
    "tarih" DATE NOT NULL,
    "soruIdler" TEXT[],

    CONSTRAINT "GunlukSoruSeti_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GunlukSoruCevap" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "setId" TEXT NOT NULL,
    "tarih" DATE NOT NULL,
    "cevaplar" JSONB NOT NULL,
    "dogru" INTEGER NOT NULL,
    "olusturma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GunlukSoruCevap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IlanTakip" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postingId" TEXT NOT NULL,
    "olusturma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hatirlatma3" TIMESTAMP(3),
    "hatirlatma1" TIMESTAMP(3),

    CONSTRAINT "IlanTakip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushAbonelik" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "olusturma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushAbonelik_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProHediye_userId_neden_key" ON "ProHediye"("userId", "neden");

-- CreateIndex
CREATE UNIQUE INDEX "GunlukSoruSeti_duzey_tarih_key" ON "GunlukSoruSeti"("duzey", "tarih");

-- CreateIndex
CREATE INDEX "GunlukSoruCevap_setId_idx" ON "GunlukSoruCevap"("setId");

-- CreateIndex
CREATE UNIQUE INDEX "GunlukSoruCevap_userId_tarih_key" ON "GunlukSoruCevap"("userId", "tarih");

-- CreateIndex
CREATE INDEX "IlanTakip_postingId_idx" ON "IlanTakip"("postingId");

-- CreateIndex
CREATE UNIQUE INDEX "IlanTakip_userId_postingId_key" ON "IlanTakip"("userId", "postingId");

-- CreateIndex
CREATE UNIQUE INDEX "PushAbonelik_endpoint_key" ON "PushAbonelik"("endpoint");

-- CreateIndex
CREATE INDEX "PushAbonelik_userId_idx" ON "PushAbonelik"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_davetKodu_key" ON "User"("davetKodu");

-- AddForeignKey
ALTER TABLE "ProHediye" ADD CONSTRAINT "ProHediye_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GunlukSoruCevap" ADD CONSTRAINT "GunlukSoruCevap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GunlukSoruCevap" ADD CONSTRAINT "GunlukSoruCevap_setId_fkey" FOREIGN KEY ("setId") REFERENCES "GunlukSoruSeti"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IlanTakip" ADD CONSTRAINT "IlanTakip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IlanTakip" ADD CONSTRAINT "IlanTakip_postingId_fkey" FOREIGN KEY ("postingId") REFERENCES "Posting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushAbonelik" ADD CONSTRAINT "PushAbonelik_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

