-- CreateTable
CREATE TABLE "IndexerState" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "lastBlock" BIGINT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndexerState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" BIGINT NOT NULL,
    "creator" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answers" TEXT[],
    "answersPool" BIGINT[],
    "endTime" BIGINT NOT NULL,
    "startTime" BIGINT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" BIGINT NOT NULL,
    "creator" TEXT NOT NULL,
    "eventId" BIGINT NOT NULL,
    "answer" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "token" TEXT NOT NULL,
    "result" BIGINT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" BIGINT NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "increase" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Validator" (
    "id" BIGINT NOT NULL,
    "creator" TEXT NOT NULL,
    "eventId" BIGINT NOT NULL,
    "answer" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "refunded" BOOLEAN NOT NULL,
    "companyAmount" BIGINT NOT NULL,
    "creatorAmount" BIGINT NOT NULL,
    "createdAt" BIGINT NOT NULL,

    CONSTRAINT "Validator_pkey" PRIMARY KEY ("id")
);

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
CREATE INDEX "Participant_eventId_idx" ON "Participant"("eventId");

-- CreateIndex
CREATE INDEX "Participant_creator_idx" ON "Participant"("creator");

-- CreateIndex
CREATE INDEX "Validator_eventId_idx" ON "Validator"("eventId");

-- CreateIndex
CREATE INDEX "Withdrawal_chainId_nonce_idx" ON "Withdrawal"("chainId", "nonce");

-- CreateIndex
CREATE INDEX "Deposit_chainId_nonce_idx" ON "Deposit"("chainId", "nonce");

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Validator" ADD CONSTRAINT "Validator_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
