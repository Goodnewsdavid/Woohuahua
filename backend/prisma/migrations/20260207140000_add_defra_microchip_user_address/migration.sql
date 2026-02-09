-- Add microchipSearchKey for Defra protocol look-up (normalized format)
ALTER TABLE "Pet" ADD COLUMN "microchipSearchKey" TEXT;

-- Backfill: existing microchips are 15-digit format; use as search key
UPDATE "Pet" SET "microchipSearchKey" = "microchipNumber"
WHERE "microchipSearchKey" IS NULL;

-- Make NOT NULL after backfill
ALTER TABLE "Pet" ALTER COLUMN "microchipSearchKey" SET NOT NULL;

-- Index for search
CREATE INDEX "Pet_microchipSearchKey_idx" ON "Pet"("microchipSearchKey");

-- Reg 6: full address for keeper
ALTER TABLE "User" ADD COLUMN "addressLine1" TEXT;
ALTER TABLE "User" ADD COLUMN "city" TEXT;
