import { RawEvent } from "../chain/interfaces";
import { EventRepository } from "../db/eventsRepository";
import { PartRepository } from "../db/partRepository";
import { EventEntity, ParticipantEntity } from "../db/types";
import { ValRepository } from "../db/valRepository";

const EVENT_TYPES = {
  EVENT_CREATED: "CREATE_EVENT",
  PARTICIPATE_EVENT: "PARTICIPATE_EVENT",
  VALIDATE_EVENT: "VALIDATE_EVENT",
} as const;

type Attribute = {
  key: string;
  value: string;
};

export interface CreateEventPayload {
  id: bigint;
  creator: string;
  question: string;
  answers: string[];
  answersPool: bigint[];
  startTime: bigint;
  endTime: bigint;
  category: string;
  status: string;
  roomId: string;
}

export interface ParticipateEventPayload {
  id: bigint;
  creator: string;
  eventId: bigint;
  answer: string;
  amount: bigint;
  token: string;
  createdAt: bigint;
}

export class EventParser {
  constructor(
    private readonly eventDb: EventRepository,
    private readonly partDb: PartRepository,
    private readonly validDB: ValRepository,
  ) {}
  async parse(rawEvents: RawEvent[]): Promise<string> {
    for (const raw of rawEvents) {
      try {
        switch (raw.type) {
          case EVENT_TYPES.EVENT_CREATED:
            await this.parseEvent(raw);
            break;

          case EVENT_TYPES.PARTICIPATE_EVENT:
            await this.parseParticipant(raw);
            break;

          case EVENT_TYPES.VALIDATE_EVENT:
            await this.parseValidation(raw);
            break;

          default:
            console.warn("UNKNOWN EVENT", { type: raw.type, event: raw });
            break;
        }
      } catch (error) {
        console.warn("Failed to parse event", { type: raw.type, error });
      }
    }

    return "DONE";
  }

  private async parseEvent(raw: RawEvent) {
    const payload = this.parseCreateEvent(raw.attributes);
    const eventEntity: EventEntity = {
      id: payload.id,
      creator: payload.creator,
      question: payload.question,
      answers: payload.answers,
      answersPool: payload.answersPool,
      startTime: payload.startTime,
      endTime: payload.endTime,
      category: payload.category,
      status: payload.status,
      participants: [],
      roomId: payload.roomId,
      createdAt: new Date(),
    };
    this.eventDb.saveEvent(eventEntity);
  }

  private async parseParticipant(raw: RawEvent) {
    console.log("PARTICIPATE_EVENT", raw);
    const payload = this.parseParticipateEvent(raw.attributes);
    const partEvent: ParticipantEntity = {
      id: payload.id,
      creator: payload.creator,
      eventId: payload.eventId,
      answer: payload.answer,
      amount: payload.amount,
      token: payload.token,
      result: BigInt(0),
      createdAt: payload.createdAt,
    };
    this.partDb.saveParticipant(partEvent);
  }

  private async parseValidation(raw: RawEvent) {
    console.log("VALIDATE_EVENT", raw);
  }

  private parseCreateEvent(attributes: Attribute[]): CreateEventPayload {
    const obj = Object.fromEntries(attributes.map((a) => [a.key, a.value]));
    return {
      id: BigInt(obj.id),
      creator: obj.creator,
      question: obj.question,
      answers: JSON.parse(obj.answers) as string[],
      answersPool: (JSON.parse(obj.answersPool) as (string | number)[]).map(
        (v) => BigInt(v),
      ),
      startTime: BigInt(obj.startTime),
      endTime: BigInt(obj.endTime),
      category: obj.category,
      status: obj.status,
      roomId: obj.roomId,
    };
  }

  private parseParticipateEvent(
    attributes: Attribute[],
  ): ParticipateEventPayload {
    const obj = Object.fromEntries(attributes.map((a) => [a.key, a.value]));

    return {
      id: BigInt(obj.id),
      creator: obj.creator,
      eventId: BigInt(obj.eventId),
      answer: obj.answer,
      amount: BigInt(obj.amount),
      token: obj.token,
      createdAt: BigInt(obj.createdAt),
    };
  }
}
