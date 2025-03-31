-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "stockUnit" TEXT NOT NULL DEFAULT 'Units';
