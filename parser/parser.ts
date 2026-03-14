import { RawEvent } from "../chain/interfaces";
import { BridgeRepository } from "../db/bridgeRepository";
import { EventRepository } from "../db/eventsRepository";
import { PartRepository } from "../db/partRepository";
import { ValRepository } from "../db/valRepository";
import {
  parseCreateEvent,
  parseDepositEvent,
  parseParticipateEvent,
  parseSetIncreasePartEvent,
  parseWithdrawalEvent,
  validateParserEvent,
} from "./structure";

const EVENT_TYPES = {
  EVENT_CREATED: "CREATE_EVENT",
  PARTICIPATE_EVENT: "PARTICIPATE_EVENT",
  VALIDATE_EVENT: "VALIDATE_EVENT",
  WITHDRAWAL_EVENT: "BURN_TO_EVM",
  DEPOSIT_EVENT: "MINT_FROM_EVM",
  SET_INCREASE_PART: "SET_INCREASE_PART",
} as const;

export class EventParser {
  constructor(
    private readonly eventDb: EventRepository,
    private readonly partDb: PartRepository,
    private readonly validDB: ValRepository,
    private readonly bridgeDb: BridgeRepository,
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

          case EVENT_TYPES.WITHDRAWAL_EVENT:
            await this.parseWithdrawal(raw);
            break;

          case EVENT_TYPES.DEPOSIT_EVENT:
            await this.parseDeposit(raw);
            break;

          case EVENT_TYPES.SET_INCREASE_PART:
            await this.parseSetIncreasePart(raw);
            break;
          // default:
          //   console.warn("UNKNOWN EVENT", {
          //     type: raw.type,
          //     event: JSON.stringify(raw.attributes),
          //   });
          //   break;
        }
      } catch (error) {
        console.warn("Failed to parse event", { type: raw.type, error });
      }
    }

    return "DONE";
  }

  private async parseEvent(raw: RawEvent) {
    console.log("CREATE_EVENT", JSON.stringify(raw));
    const payload = parseCreateEvent(raw.attributes);
    await this.eventDb.saveEvent(payload);
  }

  private async parseParticipant(raw: RawEvent) {
    console.log("PARTICIPATE_EVENT", JSON.stringify(raw));
    const payload = parseParticipateEvent(raw.attributes);
    await this.partDb.saveParticipant(payload);
  }

  private async parseValidation(raw: RawEvent) {
    console.log("VALIDATE_EVENT", JSON.stringify(raw));
    const payload = validateParserEvent(raw.attributes);
    await this.validDB.saveValidation(payload);
    await this.partDb.updateParticipantFromValidator(
      Number(payload.eventId),
      payload.refunded,
    );
  }

  private async parseWithdrawal(raw: RawEvent) {
    console.log("WITHDRAWAL_EVENT", JSON.stringify(raw));
    const payload = parseWithdrawalEvent(raw.attributes);
    await this.bridgeDb.saveWithdrawal(payload);
  }

  private async parseDeposit(raw: RawEvent) {
    console.log("DEPOSIT_EVENT", JSON.stringify(raw));
    const payload = parseDepositEvent(raw.attributes);
    await this.bridgeDb.saveDeposit(payload);
  }

  private async parseSetIncreasePart(raw: RawEvent) {
    console.log("SET_INCREASE_PART", JSON.stringify(raw));
    const payload = parseSetIncreasePartEvent(raw.attributes);
    await this.partDb.setIncreasePart(payload);
  }
}
