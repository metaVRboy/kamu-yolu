-- CreateTable
CREATE TABLE "Haber" (
    "id" TEXT NOT NULL,
    "baslik" TEXT NOT NULL,
    "ozet" TEXT NOT NULL,
    "kaynakUrl" TEXT,
    "yayinTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Haber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Haber_yayinTarihi_idx" ON "Haber"("yayinTarihi");
