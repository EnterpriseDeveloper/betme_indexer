import { RawEvent } from "../chain/interfaces";

const EVENT_TYPES = {
  EVENT_CREATED: "CREATE_EVENT",
  PARTICIPATE_EVENT: "PARTICIPATE_EVENT",
  VALIDATE_EVENT: "VALIDATE_EVENT",
} as const;

export class EventParser {
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
    console.log("EVENT_CREATED", raw);
  }

  private async parseParticipant(raw: RawEvent) {
    console.log("PARTICIPATE_EVENT", raw);
  }

  private async parseValidation(raw: RawEvent) {
    console.log("VALIDATE_EVENT", raw);
  }
}
