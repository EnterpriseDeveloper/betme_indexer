export type Attribute = {
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
