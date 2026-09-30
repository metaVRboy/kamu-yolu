-- AlterTable
ALTER TABLE "Haber" ADD COLUMN     "basvuruBaslangic" TIMESTAMP(3),
ADD COLUMN     "basvuruBitis" TIMESTAMP(3),
ADD COLUMN     "detaylar" JSONB,
ADD COLUMN     "egitimSeviyeleri" "EducationLevel"[] DEFAULT ARRAY[]::"EducationLevel"[],
ADD COLUMN     "istihdamTuru" TEXT,
ADD COLUMN     "kadroPozisyon" TEXT,
ADD COLUMN     "kategori" TEXT,
ADD COLUMN     "kontenjan" INTEGER,
ADD COLUMN     "kpssTuru" TEXT,
ADD COLUMN     "kurumAdi" TEXT,
ADD COLUMN     "ustYas" INTEGER;
