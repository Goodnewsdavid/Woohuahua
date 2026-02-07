-- CreateTable
CREATE TABLE "CallSession" (
    "id" TEXT NOT NULL,
    "twilioCallSid" TEXT,
    "userId" TEXT,
    "callerType" TEXT,
    "humanEscalationRequested" BOOLEAN NOT NULL DEFAULT false,
    "durationSeconds" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CallSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CallSession_twilioCallSid_key" ON "CallSession"("twilioCallSid");

-- CreateIndex
CREATE INDEX "CallSession_twilioCallSid_idx" ON "CallSession"("twilioCallSid");

-- CreateIndex
CREATE INDEX "CallSession_userId_idx" ON "CallSession"("userId");

-- CreateIndex
CREATE INDEX "CallSession_createdAt_idx" ON "CallSession"("createdAt");
