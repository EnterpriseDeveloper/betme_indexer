import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { CreateEventPayload } from "../parser/types";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export interface EventRepository {
  saveEvent(event: CreateEventPayload): Promise<void>;
}

export class EventsPrismaRepository implements EventRepository {
  async saveEvent(payload: CreateEventPayload): Promise<void> {
    try {
      await prisma.event.create({
        data: {
          id: payload.id,
          creator: payload.creator,
          question: payload.question,
          answers: payload.answers,
          answersPool: payload.answersPool,
          startTime: payload.startTime,
          endTime: payload.endTime,
          category: payload.category,
          status: payload.status,
          roomId: payload.roomId,
          createdAt: new Date(),
        },
      });
    } catch (e) {
      console.log(`saveEvent: ${e}`);
    }
  }
}
