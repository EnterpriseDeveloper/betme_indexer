import express from "express";
import "dotenv/config";
import { ChainClient } from "./chain/client";
import { BlockProcessor } from "./chain/blockProcessor";
import { PrismaBlockRepository } from "./db/blockRepository";
import { EventParser } from "./parser/parser";
import { EventsPrismaRepository } from "./db/eventsRepository";
import { PartPrismaRepository } from "./db/partRepository";
import { ValPrismaRepository } from "./db/valRepository";

const port = process.env.PORT || 3000;

const app = express();

app.get("/ping", (req, res) => {
  res.send({ status: "ok" });
});

app.listen(port, async () => {
  console.log(`Server is running on port: ${port}`);

  const client = new ChainClient();

  const eventRepository = new EventsPrismaRepository();
  const partRepository = new PartPrismaRepository();
  const validRepository = new ValPrismaRepository();
  const parser = new EventParser(
    eventRepository,
    partRepository,
    validRepository,
  );

  const blockRepository = new PrismaBlockRepository();
  const processor = new BlockProcessor(client, parser, blockRepository);

  // Graceful shutdown
  process.on("SIGINT", async () => {
    console.info("Shutting down...");
    await client.disconnect();
    process.exit(0);
  });

  await client.connect();

  // 1. Check history events
  await processor.historicalSync();

  // 2. get all blocks
  await processor.realtimeSync();
});
