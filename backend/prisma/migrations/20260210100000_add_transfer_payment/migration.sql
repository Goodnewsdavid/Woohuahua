-- CreateTable
CREATE TABLE "TransferPayment" (
    "id" TEXT NOT NULL,
    "transferRequestId" TEXT NOT NULL,
    "stripeSessionId" TEXT NOT NULL,
    "amountPence" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'gbp',
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransferPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TransferPayment_transferRequestId_key" ON "TransferPayment"("transferRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "TransferPayment_stripeSessionId_key" ON "TransferPayment"("stripeSessionId");

-- CreateIndex
CREATE INDEX "TransferPayment_transferRequestId_idx" ON "TransferPayment"("transferRequestId");

-- CreateIndex
CREATE INDEX "TransferPayment_stripeSessionId_idx" ON "TransferPayment"("stripeSessionId");

-- AddForeignKey
ALTER TABLE "TransferPayment" ADD CONSTRAINT "TransferPayment_transferRequestId_fkey" FOREIGN KEY ("transferRequestId") REFERENCES "TransferRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
