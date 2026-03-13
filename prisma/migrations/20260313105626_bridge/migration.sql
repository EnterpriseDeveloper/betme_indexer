-- CreateTable
CREATE TABLE "Withdrawal" (
    "id" BIGSERIAL NOT NULL,
    "chainId" BIGINT NOT NULL,
    "bridge" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "transferAmount" BIGINT NOT NULL,
    "companyAmount" BIGINT NOT NULL,
    "creatorAmount" BIGINT NOT NULL,
    "nonce" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deposit" (
    "id" BIGSERIAL NOT NULL,
    "chainId" BIGINT NOT NULL,
    "bridge" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "transferAmount" BIGINT NOT NULL,
    "cosmosAmount" BIGINT NOT NULL,
    "nonce" BIGINT NOT NULL,
    "txHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Deposit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Withdrawal_chainId_nonce_idx" ON "Withdrawal"("chainId", "nonce");

-- CreateIndex
CREATE INDEX "Deposit_chainId_nonce_idx" ON "Deposit"("chainId", "nonce");
