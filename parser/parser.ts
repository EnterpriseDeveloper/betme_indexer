import { RawEvent } from "../chain/interfaces";
import { BridgeRepository } from "../db/bridgeRepository";
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
  WITHDRAWAL_EVENT: "BURN_TO_EVM",
  DEPOSIT_EVENT: "MINT_FROM_EVM",
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
    await this.validDB.saveValidation(payload);
    await this.partDb.updateParticipantFromValidator(
      Number(payload.eventId),
      payload.refunded,
    );
  }

  private async parseWithdrawal(raw: RawEvent) {
    console.log("WITHDRAWAL_EVENT", JSON.stringify(raw));
    const payload = this.parseWithdrawalEvent(raw.attributes);
    await this.bridgeDb.saveWithdrawal(payload);
  }

  private async parseDeposit(raw: RawEvent) {
    console.log("DEPOSIT_EVENT", JSON.stringify(raw));
    const payload = this.parseDepositEvent(raw.attributes);
    await this.bridgeDb.saveDeposit(payload);
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

  private parseWithdrawalEvent(attributes: Attribute[]) {
    const obj = Object.fromEntries(attributes.map((a) => [a.key, a.value]));

    return {
      chainId: BigInt(obj.chain_id),
      bridge: obj.bridge,
      token: obj.token,
      recipient: obj.recipient,
      transferAmount: BigInt(obj.transfer_amount),
      companyAmount: BigInt(obj.company_amount),
      creatorAmount: BigInt(obj.creator_amount),
      nonce: BigInt(obj.nonce),
    };
  }

  private parseDepositEvent(attributes: Attribute[]) {
    const obj = Object.fromEntries(attributes.map((a) => [a.key, a.value]));

    return {
      chainId: BigInt(obj.chain_id),
      bridge: obj.bridge,
      token: obj.token,
      sender: obj.sender,
      recipient: obj.recipient,
      transferAmount: BigInt(obj.transfer_amount),
      cosmosAmount: BigInt(obj.cosmos_amount),
      nonce: BigInt(obj.nonce),
      txHash: obj.tx_hash,
    };
  }
}
