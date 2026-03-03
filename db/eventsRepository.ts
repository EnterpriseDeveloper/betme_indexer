import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { EventEntity } from "./types";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export interface EventRepository {
  saveEvent(event: EventEntity): Promise<void>;
}

export class EventsPrismaRepository implements EventRepository {
  async saveEvent(event: EventEntity): Promise<void> {
    await prisma.event.create({
      data: {
        id: event.id,
        creator: event.creator,
        question: event.question,
        answers: event.answers,
        answersPool: event.answersPool,
        endTime: event.endTime,
        startTime: event.startTime,
        category: event.category,
        status: event.status,
        participants: event.participants,
        roomId: event.roomId,
        createdAt: event.createdAt,
      },
    });
  }
}
