import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { ParticipateEventPayload } from "../parser/types";
import getParticipantByID from "../cosmos/cosmos";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export interface PartRepository {
  saveParticipant(event: ParticipateEventPayload): Promise<void>;
  updateParticipantFromValidator(eventId: number): Promise<void>;
}

export class PartPrismaRepository implements PartRepository {
  async saveParticipant(payload: ParticipateEventPayload): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.participant.create({
          data: {
            id: payload.id,
            creator: payload.creator,
            eventId: payload.eventId,
            answer: payload.answer,
            amount: payload.amount,
            token: payload.token,
            result: BigInt(0),
            createdAt: payload.createdAt,
          },
        });

        const event = await tx.event.findUnique({
          where: { id: payload.eventId },
        });

        if (!event) throw console.error("Event not found");

        const answers = event.answers;
        const pool = [...event.answersPool];

        const index = answers.indexOf(payload.answer);

        if (index === -1) {
          throw console.error("Answer not found in event");
        }

        pool[index] = pool[index] + payload.amount;

        await tx.event.update({
          where: { id: payload.eventId },
          data: {
            answersPool: pool,
          },
        });
      });
    } catch (e) {
      console.log(`saveParticipant: ${e}`);
    }
  }

  async updateParticipantFromValidator(eventId: number): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        const participants = await tx.participant.findMany({
          where: { eventId: eventId },
        });

        console.log("Participants:", participants);

        for (const participant of participants) {
          let part = await getParticipantByID(Number(participant.id));
          console.log(part);
          // await tx.participant.update({
          //   where: { id: eventId },
          //   data: {
          //     answersPool: pool,
          //   },
          // });
        }
      });
    } catch (e) {
      console.log(`updateParticipantFromValidator: ${e}`);
    }
  }
}
