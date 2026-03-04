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
    "createdAt" BIGINT NOT NULL,

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
    "createdAt" BIGINT NOT NULL,

    CONSTRAINT "Validator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Participant_eventId_idx" ON "Participant"("eventId");

-- CreateIndex
CREATE INDEX "Participant_creator_idx" ON "Participant"("creator");

-- CreateIndex
CREATE INDEX "Validator_eventId_idx" ON "Validator"("eventId");

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Validator" ADD CONSTRAINT "Validator_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
