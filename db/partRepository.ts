import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { ParticipantEntity } from "./types";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export interface PartRepository {
  saveParticipant(event: ParticipantEntity): Promise<void>;
}

export class PartPrismaRepository implements PartRepository {
  async saveParticipant(event: ParticipantEntity): Promise<void> {
    try {
      await prisma.participant.create({ data: event });
    } catch (e) {
      console.log(`saveParticipant: ${e}`);
    }
  }
}
