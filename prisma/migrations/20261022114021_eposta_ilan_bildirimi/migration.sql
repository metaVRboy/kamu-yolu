-- AlterTable
ALTER TABLE "User" ADD COLUMN     "epostaIlanBildirimi" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "epostaIlanKapsam" TIMESTAMP(3);
