-- CreateTable
CREATE TABLE "IndexerState" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "lastBlock" BIGINT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndexerState_pkey" PRIMARY KEY ("id")
);
