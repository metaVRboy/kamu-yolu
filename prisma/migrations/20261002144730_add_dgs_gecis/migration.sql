-- CreateTable
CREATE TABLE "DgsGecis" (
    "id" TEXT NOT NULL,
    "onlisansKodu" TEXT NOT NULL,
    "onlisansAdi" TEXT NOT NULL,
    "lisansKodu" TEXT NOT NULL,
    "lisansAdi" TEXT NOT NULL,
    "puanTuru" TEXT NOT NULL,

    CONSTRAINT "DgsGecis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DgsGecis_onlisansAdi_idx" ON "DgsGecis"("onlisansAdi");
