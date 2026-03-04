import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { ValidateEventPayload } from "../parser/types";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export interface ValRepository {
  saveParticipant(event: ValidateEventPayload): Promise<void>;
}

export class ValPrismaRepository implements ValRepository {
  async saveParticipant(payload: ValidateEventPayload): Promise<void> {
    await prisma.validator.create({
      data: {
        id: payload.id,
        creator: payload.creator,
        eventId: payload.eventId,
        answer: payload.answer,
        source: payload.source,
        createdAt: payload.createdAt,
        refunded: payload.refunded,
        companyAmount: payload.companyFee,
      },
    });
  }
}
