import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { IndexedBlock } from "./types";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export interface BlockRepository {
  getLastIndexedBlock(): Promise<number>;
  saveBlock(block: IndexedBlock): Promise<void>;
}

export class PrismaBlockRepository implements BlockRepository {
  async getLastIndexedBlock(): Promise<number> {
    const state = await prisma.indexerState.findUnique({
      where: { id: 1 },
    });

    return state ? Number(state.lastBlock) : 0;
  }

  async saveBlock(block: IndexedBlock): Promise<void> {
    await prisma.indexerState.upsert({
      where: { id: 1 },
      update: {
        lastBlock: BigInt(block.height),
      },
      create: {
        id: 1,
        lastBlock: BigInt(block.height),
      },
    });
  }
}
