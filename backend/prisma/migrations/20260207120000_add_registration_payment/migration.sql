-- CreateTable
CREATE TABLE "RegistrationPayment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeSessionId" TEXT NOT NULL,
    "amountPence" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "petId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistrationPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RegistrationPayment_stripeSessionId_key" ON "RegistrationPayment"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "RegistrationPayment_petId_key" ON "RegistrationPayment"("petId");

-- CreateIndex
CREATE INDEX "RegistrationPayment_userId_idx" ON "RegistrationPayment"("userId");

-- CreateIndex
CREATE INDEX "RegistrationPayment_petId_idx" ON "RegistrationPayment"("petId");

-- AddForeignKey
ALTER TABLE "RegistrationPayment" ADD CONSTRAINT "RegistrationPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistrationPayment" ADD CONSTRAINT "RegistrationPayment_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
