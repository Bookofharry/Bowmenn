-- AlterEnum
ALTER TYPE "ShipmentStatus" ADD VALUE 'DRAFT';

-- AlterTable
ALTER TABLE "Shipment" ADD COLUMN     "distanceKm" DOUBLE PRECISION,
ADD COLUMN     "estimatedTimeMins" INTEGER,
ADD COLUMN     "quoteExpiresAt" TIMESTAMP(3);
