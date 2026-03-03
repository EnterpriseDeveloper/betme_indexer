import { StargateClient } from "@cosmjs/stargate";
import {
  HttpClient,
  Tendermint37Client,
  WebsocketClient,
} from "@cosmjs/tendermint-rpc";
import { EventAttribute } from "@cosmjs/tendermint-rpc/build/comet1/responses";
import { createHash } from "node:crypto";
import { IndexedBlock, RawEvent } from "./interfaces";

export class ChainClient {
  private tmClient: Tendermint37Client | null = null;
  private stargateClient: StargateClient | null = null;
  readonly wsClient: WebsocketClient | null = null;

  private reconnectAttempts = 0;
  readonly reconnectDelayMs = 5000;
  readonly maxReconnectAttempts = 10;
  readonly batchSize = 100;

  async connect(): Promise<void> {
    const rpcUrl = process.env.RPC_URL as string;
    console.info("Connecting to Cosmos node...", { rpc: rpcUrl });

    try {
      const httpClient = new HttpClient(rpcUrl);
      this.tmClient = Tendermint37Client.create(httpClient);
      this.stargateClient = StargateClient.create(this.tmClient);

      const chainId = await this.stargateClient.getChainId();
      const height = await this.stargateClient.getHeight();

      console.info("Connected to Cosmos node", {
        chainId,
        currentHeight: height,
      });
      this.reconnectAttempts = 0;
    } catch (error) {
      console.error("Failed to connect to Cosmos node", { error });
      await this.handleReconnect();
    }
  }

  async disconnect(): Promise<void> {
    this.wsClient?.disconnect();
    this.tmClient?.disconnect();
    console.info("Disconnected from Cosmos node");
  }

  private async handleReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      throw new Error(
        `Max reconnect attempts (${this.maxReconnectAttempts}) reached`,
      );
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelayMs * this.reconnectAttempts;

    console.warn(`Reconnecting in ${delay}ms...`, {
      attempt: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts,
    });

    await sleep(delay);
    await this.connect();
  }

  async getBlock(height: number): Promise<IndexedBlock> {
    this.ensureConnected();

    const { earliest } = await this.getAvailableRange();

    if (height < earliest) {
      console.warn(`Adjusting height from ${height} to ${earliest}`);
      height = earliest;
    }

    try {
      const [block, blockResults] = await Promise.all([
        this.tmClient!.block(height),
        this.tmClient!.blockResults(height),
      ]);

      const rawEvents: RawEvent[] = [];

      // 1. events from BeginBlock (system events from chain)
      for (const event of blockResults.beginBlockEvents) {
        rawEvents.push({
          type: event.type,
          attributes: this.parseAttributes(event.attributes),
          blockHeight: height,
        });
      }

      // 2. Events from transactions
      for (let i = 0; i < blockResults.results.length; i++) {
        const txResult = blockResults.results[i];
        const txHash = this.getTxHash(block.block.txs[i]);

        for (const event of txResult.events) {
          rawEvents.push({
            type: event.type,
            attributes: this.parseAttributes(event.attributes),
            txHash,
            blockHeight: height,
          });
        }
      }

      // 3. Events from EndBlock (check our validation here)
      for (const event of blockResults.endBlockEvents) {
        rawEvents.push({
          type: event.type,
          attributes: this.parseAttributes(event.attributes),
          blockHeight: height,
        });
      }

      return {
        height,
        hash: Buffer.from(block.blockId.hash).toString("hex").toUpperCase(),
        time: block.block.header.time,
        txCount: block.block.txs.length,
        rawEvents,
      };
    } catch (error) {
      console.error(`Failed to fetch block ${height}`, { error });
      throw error;
    }
  }

  private parseAttributes(
    attributes: readonly {
      key: Uint8Array | string;
      value: Uint8Array | string;
    }[],
  ): EventAttribute[] {
    return attributes.map((attr) => ({
      key:
        typeof attr.key === "string"
          ? attr.key
          : Buffer.from(attr.key).toString("utf8"),
      value:
        typeof attr.value === "string"
          ? attr.value
          : Buffer.from(attr.value).toString("utf8"),
    }));
  }

  async getAvailableRange() {
    const status = await this.tmClient!.status();

    return {
      earliest: Number(status.syncInfo.earliestBlockHeight),
      latest: Number(status.syncInfo.latestBlockHeight),
    };
  }

  async getLatestHeight(): Promise<number> {
    this.ensureConnected();
    return await this.stargateClient!.getHeight();
  }

  private getTxHash(txBytes: Uint8Array): string {
    return createHash("sha256").update(txBytes).digest("hex").toUpperCase();
  }

  private ensureConnected(): void {
    if (!this.tmClient || !this.stargateClient) {
      throw new Error("ChainClient is not connected. Call connect() first.");
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
