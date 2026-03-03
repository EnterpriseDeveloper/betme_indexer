export interface EventEntity {
  id: bigint;
  creator: string;
  question: string;
  answers: string[];
  answersPool: bigint[];
  endTime: bigint;
  startTime: bigint;
  category: string;
  status: string;
  participants: string[];
  roomId: string;
  createdAt: Date;

  bets?: ParticipantEntity[];
  validators?: ValidatorEntity[];
}

export interface ParticipantEntity {
  id: bigint;
  creator: string;
  eventId: bigint;
  answer: string;
  amount: bigint;
  token: string;
  result: bigint;
  createdAt: bigint;
}

export interface ValidatorEntity {
  id: bigint;
  eventId: bigint;
  answer: string;
  source: string;
  refunded: boolean;
  companyAmount: bigint;
  createdAt: bigint;
}

export interface IndexedBlock {
  height: number;
  hash: string;
}
