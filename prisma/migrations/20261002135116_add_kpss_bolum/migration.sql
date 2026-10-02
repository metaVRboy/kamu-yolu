-- CreateTable
CREATE TABLE "KpssBolum" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "ogrenimDuzeyi" TEXT NOT NULL,
    "toplamKontenjan" INTEGER NOT NULL,
    "minPuan" DOUBLE PRECISION,
    "maxPuan" DOUBLE PRECISION,

    CONSTRAINT "KpssBolum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KpssYillikAlim" (
    "id" TEXT NOT NULL,
    "bolumId" TEXT NOT NULL,
    "yil" INTEGER NOT NULL,
    "kontenjan" INTEGER NOT NULL,

    CONSTRAINT "KpssYillikAlim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KpssBolum_ogrenimDuzeyi_idx" ON "KpssBolum"("ogrenimDuzeyi");

-- CreateIndex
CREATE UNIQUE INDEX "KpssYillikAlim_bolumId_yil_key" ON "KpssYillikAlim"("bolumId", "yil");

-- AddForeignKey
ALTER TABLE "KpssYillikAlim" ADD CONSTRAINT "KpssYillikAlim_bolumId_fkey" FOREIGN KEY ("bolumId") REFERENCES "KpssBolum"("id") ON DELETE CASCADE ON UPDATE CASCADE;
