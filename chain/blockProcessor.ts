import { ChainClient } from "./client";
import { BlockRepository } from "../db/blockRepository";
import { IndexedBlock } from "./interfaces";

export class BlockProcessor {
  constructor(
    private readonly client: ChainClient,
    // private readonly parser: EventParser,
    private readonly repository: BlockRepository,
    private readonly batchSize: number = 100,
  ) {}

  async historicalSync(): Promise<void> {
    const [lastIndexed, currentHeight] = await Promise.all([
      this.repository.getLastIndexedBlock(),
      this.client.getLatestHeight(),
    ]);

    if (lastIndexed >= currentHeight) {
      console.info("Already up to date, skipping historical sync", {
        lastIndexed,
        currentHeight,
      });
      return;
    }

    const fromHeight = lastIndexed + 1;
    const totalBlocks = currentHeight - fromHeight;

    console.info("Starting historical sync", {
      fromHeight,
      toHeight: currentHeight,
      totalBlocks,
    });

    // process butch avoids memory issues
    for (
      let height = fromHeight;
      height <= currentHeight;
      height += this.batchSize
    ) {
      const batchEnd = Math.min(height + this.batchSize - 1, currentHeight);

      await this.processBatch(height, batchEnd);

      const progress = (((batchEnd - fromHeight) / totalBlocks) * 100).toFixed(
        1,
      );
      console.info(`Historical sync progress: ${progress}%`, {
        currentBatch: `${height}-${batchEnd}`,
        remaining: currentHeight - batchEnd,
      });
    }

    console.info("Historical sync completed!");
  }

  private async processBatch(
    fromHeight: number,
    toHeight: number,
  ): Promise<void> {
    const blocks = await Promise.all(
      Array.from({ length: toHeight - fromHeight + 1 }, (_, i) =>
        this.client.getBlock(fromHeight + i),
      ),
    );

    for (const block of blocks) {
      await this.processBlock(block);
    }
  }

  private async processBlock(block: IndexedBlock): Promise<void> {
    // const parsed = this.parser.parse(block.rawEvents);
    console.log(JSON.stringify(block));

    const stats = {
      height: block.height,
      txCount: block.txCount,
      // chainEvents: parsed.chainEvents.length,
      // participants: parsed.participants.length,
      // unknown: parsed.unknownEvents.length,
    };

    console.debug("Processing block", stats);

    await this.repository.saveBlock(block);

    // if (parsed.chainEvents.length > 0 || parsed.participants.length > 0) {
    //   console.info("Block with events indexed", stats);
    // }
  }
}
