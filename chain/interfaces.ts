import { ReadonlyDateWithNanoseconds } from "@cosmjs/tendermint-rpc";

export interface IndexedBlock {
  height: number;
  hash: string;
  time: ReadonlyDateWithNanoseconds;
  txCount: number;
  rawEvents: RawEvent[];
}

export interface RawEvent {
  type: string;
  attributes: { key: string; value: string }[];
  blockHeight: number;
  txHash?: string;
}
