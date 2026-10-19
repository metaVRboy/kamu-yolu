-- CreateTable
CREATE TABLE "KpssTopluIs" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "tur" TEXT NOT NULL,
    "veri" JSONB NOT NULL,
    "durum" TEXT NOT NULL DEFAULT 'BEKLIYOR',
    "sonuc" JSONB,
    "olusturma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bitis" TIMESTAMP(3),

    CONSTRAINT "KpssTopluIs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KpssTopluIs_ad_key" ON "KpssTopluIs"("ad");

-- CreateIndex
CREATE INDEX "KpssTopluIs_durum_idx" ON "KpssTopluIs"("durum");
