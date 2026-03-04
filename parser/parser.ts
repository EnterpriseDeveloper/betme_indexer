import { RawEvent } from "../chain/interfaces";
import { EventRepository } from "../db/eventsRepository";
import { PartRepository } from "../db/partRepository";
import { ValRepository } from "../db/valRepository";
import {
  CreateEventPayload,
  ParticipateEventPayload,
  Attribute,
  ValidateEventPayload,
} from "./types";

const EVENT_TYPES = {
  EVENT_CREATED: "CREATE_EVENT",
  PARTICIPATE_EVENT: "PARTICIPATE_EVENT",
  VALIDATE_EVENT: "VALIDATE_EVENT",
} as const;

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
            console.warn("UNKNOWN EVENT", {
              type: raw.type,
              event: JSON.stringify(raw.attributes),
            });
            break;
        }
      } catch (error) {
        console.warn("Failed to parse event", { type: raw.type, error });
      }
    }

    return "DONE";
  }

  private async parseEvent(raw: RawEvent) {
    console.log("CREATE_EVENT", JSON.stringify(raw));
    const payload = this.parseCreateEvent(raw.attributes);
    await this.eventDb.saveEvent(payload);
  }

  private async parseParticipant(raw: RawEvent) {
    console.log("PARTICIPATE_EVENT", JSON.stringify(raw));
    const payload = this.parseParticipateEvent(raw.attributes);
    await this.partDb.saveParticipant(payload);
  }

  private async parseValidation(raw: RawEvent) {
    console.log("VALIDATE_EVENT", JSON.stringify(raw));
    const payload = this.validateParserEvent(raw.attributes);
    await this.validDB.saveParticipant(payload);
    // TODO IMPORTANT:fetch participant and save info after validation
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

  private validateParserEvent(attributes: Attribute[]): ValidateEventPayload {
    const obj = Object.fromEntries(attributes.map((a) => [a.key, a.value]));

    return {
      id: BigInt(obj.id),
      creator: obj.creator,
      eventId: BigInt(obj.eventId),
      answer: obj.answer,
      source: obj.source,
      createdAt: BigInt(obj.createdAt),
      refunded: obj.refunded === "true",
      companyFee: BigInt(obj.companyFee),
    };
  }
}
