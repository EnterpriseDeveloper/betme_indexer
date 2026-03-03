import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { ValidatorEntity } from "./types";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export interface ValRepository {
  saveParticipant(event: ValidatorEntity): Promise<void>;
}

export class ValPrismaRepository implements ValRepository {
  async saveParticipant(event: ValidatorEntity): Promise<void> {
    // TODO
    await prisma.validator.create({ data: event });
  }
}
