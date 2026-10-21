-- CreateTable
CREATE TABLE "SeriDondurma" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tarih" DATE NOT NULL,
    "olusturma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeriDondurma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KurumTakip" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kurumAdi" TEXT NOT NULL,
    "kurumNorm" TEXT NOT NULL,
    "olusturma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KurumTakip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SeriDondurma_userId_tarih_key" ON "SeriDondurma"("userId", "tarih");

-- CreateIndex
CREATE INDEX "KurumTakip_kurumNorm_idx" ON "KurumTakip"("kurumNorm");

-- CreateIndex
CREATE UNIQUE INDEX "KurumTakip_userId_kurumNorm_key" ON "KurumTakip"("userId", "kurumNorm");

-- AddForeignKey
ALTER TABLE "SeriDondurma" ADD CONSTRAINT "SeriDondurma_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KurumTakip" ADD CONSTRAINT "KurumTakip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

