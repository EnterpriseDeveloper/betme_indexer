import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export interface BridgeRepository {
  saveWithdrawal(payload: {
    chainId: bigint;
    bridge: string;
    token: string;
    recipient: string;
    transferAmount: bigint;
    companyAmount: bigint;
    creatorAmount: bigint;
    nonce: bigint;
  }): Promise<void>;

  saveDeposit(payload: {
    chainId: bigint;
    bridge: string;
    token: string;
    sender: string;
    recipient: string;
    transferAmount: bigint;
    cosmosAmount: bigint;
    nonce: bigint;
    txHash: string;
  }): Promise<void>;
}

export class PrismaBridgeRepository implements BridgeRepository {
  async saveWithdrawal(payload: {
    chainId: bigint;
    bridge: string;
    token: string;
    recipient: string;
    transferAmount: bigint;
    companyAmount: bigint;
    creatorAmount: bigint;
    nonce: bigint;
  }): Promise<void> {
    try {
      await prisma.withdrawal.create({
        data: {
          chainId: payload.chainId,
          bridge: payload.bridge,
          token: payload.token,
          recipient: payload.recipient,
          transferAmount: payload.transferAmount,
          companyAmount: payload.companyAmount,
          creatorAmount: payload.creatorAmount,
          nonce: payload.nonce,
        },
      });
    } catch (e) {
      console.log(`saveWithdrawal: ${e}`);
    }
  }

  async saveDeposit(payload: {
    chainId: bigint;
    bridge: string;
    token: string;
    sender: string;
    recipient: string;
    transferAmount: bigint;
    cosmosAmount: bigint;
    nonce: bigint;
    txHash: string;
  }): Promise<void> {
    try {
      await prisma.deposit.create({
        data: {
          chainId: payload.chainId,
          bridge: payload.bridge,
          token: payload.token,
          sender: payload.sender,
          recipient: payload.recipient,
          transferAmount: payload.transferAmount,
          cosmosAmount: payload.cosmosAmount,
          nonce: payload.nonce,
          txHash: payload.txHash,
        },
      });
    } catch (e) {
      console.log(`saveDeposit: ${e}`);
    }
  }
}
