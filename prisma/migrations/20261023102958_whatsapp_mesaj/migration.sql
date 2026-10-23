-- CreateTable
CREATE TABLE "WhatsappMesaj" (
    "id" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "userId" TEXT,
    "yon" TEXT NOT NULL,
    "metin" TEXT NOT NULL,
    "waId" TEXT,
    "durum" TEXT,
    "hata" TEXT,
    "okundu" BOOLEAN NOT NULL DEFAULT false,
    "olusturma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhatsappMesaj_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WhatsappMesaj_waId_key" ON "WhatsappMesaj"("waId");

-- CreateIndex
CREATE INDEX "WhatsappMesaj_telefon_olusturma_idx" ON "WhatsappMesaj"("telefon", "olusturma");

-- CreateIndex
CREATE INDEX "WhatsappMesaj_olusturma_idx" ON "WhatsappMesaj"("olusturma");

-- CreateIndex
CREATE INDEX "SmsGonderim_saglayiciId_idx" ON "SmsGonderim"("saglayiciId");

-- AddForeignKey
ALTER TABLE "WhatsappMesaj" ADD CONSTRAINT "WhatsappMesaj_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
