import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { ValidateEventPayload } from "../parser/types";

const FinishedEvent = "FINISHED";
const RefundEvent = "REFUND";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export interface ValRepository {
  saveValidation(event: ValidateEventPayload): Promise<void>;
}

export class ValPrismaRepository implements ValRepository {
  async saveValidation(payload: ValidateEventPayload): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.validator.create({
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

      const event = await tx.event.findUnique({
        where: { id: payload.eventId },
      });

      if (!event) throw console.error("Event not found");

      await tx.event.update({
        where: { id: payload.eventId },
        data: {
          status: payload.refunded ? RefundEvent : FinishedEvent,
        },
      });
    });
  }
}
