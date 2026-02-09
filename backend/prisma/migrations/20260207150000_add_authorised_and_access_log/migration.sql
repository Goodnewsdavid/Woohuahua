-- Add AUTHORISED to Role enum (PostgreSQL: add new value to existing enum)
ALTER TYPE "Role" ADD VALUE 'AUTHORISED';

-- Reg 7(1)(g): Access log for compliance
CREATE TABLE "AccessLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "microchipNumber" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AccessLog_userId_idx" ON "AccessLog"("userId");
CREATE INDEX "AccessLog_action_idx" ON "AccessLog"("action");
CREATE INDEX "AccessLog_createdAt_idx" ON "AccessLog"("createdAt");
