import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PaidMoneyPartEventPayload,
  ParticipateEventPayload,
  SetIncreasePartEventPayload,
} from "../parser/types";
import getParticipantStatusByID from "../cosmos/cosmos";
import { EventStatus } from "./types";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export interface PartRepository {
  saveParticipant(event: ParticipateEventPayload): Promise<void>;
  updateParticipantFromValidator(
    eventId: number,
    refunded: boolean,
  ): Promise<void>;
  setIncreasePart(payload: SetIncreasePartEventPayload): Promise<void>;
  setPaidMoneyPart(payload: PaidMoneyPartEventPayload): Promise<void>;
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
            status: EventStatus.PENDING,
            result: 0,
            createdAt: payload.createdAt,
            increase: false,
            paid: false,
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

  async updateParticipantFromValidator(
    eventId: number,
    refunded: boolean,
  ): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        const participants = await tx.participant.findMany({
          where: { eventId: eventId, increase: false },
        });

        for (const participant of participants) {
          let part = await getParticipantStatusByID(
            Number(participant.id),
            eventId,
          );
          if (part) {
            await tx.participant.update({
              where: { id: eventId },
              data: {
                result:
                  part.resultAmount === 0
                    ? BigInt(0)
                    : BigInt(Number(part.resultAmount)) / BigInt(10000),
                status: refunded ? EventStatus.REFUNDED : EventStatus.FINISHED,
              },
            });
          } else {
            console.warn("Participant not found");
          }
        }
      });
    } catch (e) {
      console.log(`updateParticipantFromValidator: ${e}`);
    }
  }

  async setIncreasePart(payload: SetIncreasePartEventPayload): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        const participant = await tx.participant.findUnique({
          where: { id: payload.id },
        });

        if (!participant) throw console.error("Participant not found");

        const id = BigInt(`${payload.id}${payload.createdAt}`);

        await tx.participant.create({
          data: {
            id: id,
            creator: payload.creator,
            eventId: payload.eventId,
            answer: participant.answer,
            amount: payload.amount,
            token: payload.token,
            status: EventStatus.PENDING,
            result: 0,
            createdAt: payload.createdAt,
            increase: true,
            paid: false,
          },
        });

        const event = await tx.event.findUnique({
          where: { id: payload.eventId },
        });

        if (!event) throw console.error("Event not found");

        const answers = event.answers;
        const pool = [...event.answersPool];

        const index = answers.indexOf(participant.answer);

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
      console.log(`setIncreasePart: ${e}`);
    }
  }

  async setPaidMoneyPart(payload: PaidMoneyPartEventPayload): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.participant.update({
          where: { id: payload.partId },
          data: {
            paid: true,
          },
        });
      });
    } catch (e) {
      console.log(`setPaidMoneyPart: ${e}`);
    }
  }
}
