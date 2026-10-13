-- CreateTable
CREATE TABLE "YasalKayit" (
    "id" TEXT NOT NULL,
    "zaman" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "islem" TEXT NOT NULL,
    "userId" TEXT,
    "hedefId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "ozet" TEXT NOT NULL,

    CONSTRAINT "YasalKayit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "YasalKayit_islem_zaman_idx" ON "YasalKayit"("islem", "zaman");
