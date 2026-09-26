-- AlterTable
ALTER TABLE "images" ADD COLUMN     "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[];
