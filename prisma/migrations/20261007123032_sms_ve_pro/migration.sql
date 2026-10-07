-- AlterTable
ALTER TABLE "User" ADD COLUMN     "abonelikBitis" TIMESTAMP(3),
ADD COLUMN     "smsBecayisBildirimi" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "smsIlanBildirimi" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "smsIzinTarihi" TIMESTAMP(3),
ADD COLUMN     "telefonDogrulandi" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "TelefonDogrulamaKodu" (
    "userId" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "kod" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TelefonDogrulamaKodu_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "SmsGonderim" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "telefon" TEXT NOT NULL,
    "metin" TEXT NOT NULL,
    "tur" TEXT NOT NULL,
    "durum" TEXT NOT NULL,
    "saglayiciId" TEXT,
    "hata" TEXT,
    "olusturma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmsGonderim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SmsGonderim_userId_tur_olusturma_idx" ON "SmsGonderim"("userId", "tur", "olusturma");

-- CreateIndex
CREATE INDEX "SmsGonderim_olusturma_idx" ON "SmsGonderim"("olusturma");

-- AddForeignKey
ALTER TABLE "TelefonDogrulamaKodu" ADD CONSTRAINT "TelefonDogrulamaKodu_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsGonderim" ADD CONSTRAINT "SmsGonderim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
