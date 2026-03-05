export interface IndexedBlock {
  height: number;
  hash: string;
}

export enum EventStatus {
  PENDING = "pending",
  FINISHED = "finished",
  REFUNDED = "refunded",
}
