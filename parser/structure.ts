import { formatEther } from "viem";
import {
  CreateEventPayload,
  ParticipateEventPayload,
  Attribute,
  ValidateEventPayload,
  SetIncreasePartEventPayload,
  PaidMoneyPartEventPayload,
} from "./types";

export function parseCreateEvent(attributes: Attribute[]): CreateEventPayload {
  const obj = Object.fromEntries(attributes.map((a) => [a.key, a.value]));
  return {
    id: BigInt(obj.id),
    creator: obj.creator,
    question: obj.question,
    answers: JSON.parse(obj.answers) as string[],
    answersPool: (JSON.parse(obj.answersPool) as string[]).map((v) =>
      BigInt(v),
    ),
    startTime: BigInt(obj.startTime),
    endTime: BigInt(obj.endTime),
    category: obj.category,
    status: obj.status,
    roomId: obj.roomId,
  };
}

export function parseParticipateEvent(
  attributes: Attribute[],
): ParticipateEventPayload {
  const obj = Object.fromEntries(attributes.map((a) => [a.key, a.value]));

  return {
    id: BigInt(obj.id),
    creator: obj.creator,
    eventId: BigInt(obj.eventId),
    answer: obj.answer,
    amount:
      obj.amount === "0"
        ? BigInt(0)
        : BigInt(Number(obj.amount)) / BigInt(10000),
    token: obj.token,
    createdAt: BigInt(obj.createdAt),
  };
}

export function validateParserEvent(
  attributes: Attribute[],
): ValidateEventPayload {
  const obj = Object.fromEntries(attributes.map((a) => [a.key, a.value]));

  return {
    id: BigInt(obj.id),
    creator: obj.creator,
    eventId: BigInt(obj.eventId),
    answer: obj.answer,
    source: obj.source,
    createdAt: BigInt(obj.createdAt),
    refunded: obj.refunded === "true",
    companyFee:
      obj.companyFee === "0"
        ? BigInt(0)
        : BigInt(Number(obj.companyFee)) / BigInt(10000),
    creatorFee:
      obj.creatorFee === "0"
        ? BigInt(0)
        : BigInt(Number(obj.creatorFee)) / BigInt(10000),
  };
}

export function parseWithdrawalEvent(attributes: Attribute[]) {
  const obj = Object.fromEntries(attributes.map((a) => [a.key, a.value]));

  return {
    chainId: BigInt(obj.chain_id),
    bridge: obj.bridge,
    token: obj.token,
    recipient: obj.recipient,
    transferAmount: BigInt(
      Number(formatEther(BigInt(obj.transfer_amount))) * 100,
    ),
    companyAmount:
      obj.company_amount === "0"
        ? BigInt(0)
        : BigInt(Number(obj.company_amount)) / BigInt(10000),
    creatorAmount:
      obj.creator_amount === "0"
        ? BigInt(0)
        : BigInt(Number(obj.creator_amount)) / BigInt(10000),
    nonce: BigInt(obj.nonce),
  };
}

export function parseDepositEvent(attributes: Attribute[]) {
  const obj = Object.fromEntries(attributes.map((a) => [a.key, a.value]));

  return {
    chainId: BigInt(obj.chain_id),
    bridge: obj.bridge,
    token: obj.token,
    sender: obj.sender,
    recipient: obj.recipient,
    transferAmount: BigInt(
      Number(formatEther(BigInt(obj.transfer_amount))) * 100,
    ),
    cosmosAmount: BigInt(Number(obj.cosmos_amount)) / BigInt(10000),
    nonce: BigInt(obj.nonce),
    txHash: obj.tx_hash,
  };
}

export function parseSetIncreasePartEvent(
  attributes: Attribute[],
): SetIncreasePartEventPayload {
  const obj = Object.fromEntries(attributes.map((a) => [a.key, a.value]));

  return {
    id: BigInt(obj.id),
    creator: obj.creator,
    eventId: BigInt(obj.eventId),
    amount:
      obj.amount === "0"
        ? BigInt(0)
        : BigInt(Number(obj.amount)) / BigInt(10000),
    token: obj.token,
    createdAt: BigInt(obj.createdAt),
  };
}

export function parsePaidMoneyPartEvent(
  attributes: Attribute[],
): PaidMoneyPartEventPayload {
  const obj = Object.fromEntries(attributes.map((a) => [a.key, a.value]));

  return {
    creator: obj.creator,
    eventId: BigInt(obj.eventId),
    partId: BigInt(obj.partId),
    amount:
      obj.resultAmount === "0"
        ? BigInt(0)
        : BigInt(Number(obj.resultAmount)) / BigInt(10000),
  };
}
