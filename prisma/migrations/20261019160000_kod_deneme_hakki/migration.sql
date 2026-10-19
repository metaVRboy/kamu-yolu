-- Dogrulama kodu basina atomik deneme sayaci (paralel isteklerle kod tahmini).
ALTER TABLE "TelefonDogrulamaKodu" ADD COLUMN "deneme" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "EpostaDegisiklikKodu" ADD COLUMN "deneme" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "EmailVerificationCode" ADD COLUMN "deneme" INTEGER NOT NULL DEFAULT 0;

-- Kodlar/jetonlar artik HMAC ile saklaniyor; duz metin bekleyenler gecersiz.
DELETE FROM "PasswordResetToken" WHERE "usedAt" IS NULL;
DELETE FROM "TelefonDogrulamaKodu";
DELETE FROM "EpostaDegisiklikKodu";
DELETE FROM "EmailVerificationCode";
