-- CreateTable
CREATE TABLE "PromosyonKodu" (
    "id" TEXT NOT NULL,
    "kod" TEXT NOT NULL,
    "plan" "AbonelikPlani" NOT NULL,
    "gun" INTEGER NOT NULL,
    "limit" INTEGER,
    "kullanim" INTEGER NOT NULL DEFAULT 0,
    "bitis" TIMESTAMP(3),
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "olusturanId" TEXT,
    "olusturma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromosyonKodu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromosyonKullanim" (
    "id" TEXT NOT NULL,
    "kodId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromosyonKullanim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromosyonKodu_kod_key" ON "PromosyonKodu"("kod");

-- CreateIndex
CREATE INDEX "PromosyonKullanim_userId_idx" ON "PromosyonKullanim"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PromosyonKullanim_kodId_userId_key" ON "PromosyonKullanim"("kodId", "userId");

-- AddForeignKey
ALTER TABLE "PromosyonKullanim" ADD CONSTRAINT "PromosyonKullanim_kodId_fkey" FOREIGN KEY ("kodId") REFERENCES "PromosyonKodu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromosyonKullanim" ADD CONSTRAINT "PromosyonKullanim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
