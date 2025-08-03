import { getTickBatch, getTickQueueLength, removeProcessedTicks, WebsiteTickData } from "@repo/redis";
import { prisma } from "@repo/database";

const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || "50");
const BATCH_INTERVAL = parseInt(process.env.BATCH_INTERVAL || "5000"); // 5 seconds
const MAX_RETRIES = parseInt(process.env.MAX_RETRIES || "3");

interface BatchStats {
  processed: number;
  failed: number;
  queueLength: number;
  lastBatchSize: number;
  lastProcessedAt: Date;
}

class DatabaseConsumer {
  private stats: BatchStats = {
    processed: 0,
    failed: 0,
    queueLength: 0,
    lastBatchSize: 0,
    lastProcessedAt: new Date(),
  };

  async processBatch(): Promise<void> {
    try {
      // Get current queue length for monitoring
      this.stats.queueLength = await getTickQueueLength();

      if (this.stats.queueLength === 0) {
        console.log("📭 Queue is empty, waiting...");
        return;
      }

      console.log(`📊 Queue length: ${this.stats.queueLength}, fetching batch of ${BATCH_SIZE}...`);

      // Get batch of tick data from Redis queue (without removing them yet)
      const tickBatch = await getTickBatch(BATCH_SIZE);

      if (tickBatch.length === 0) {
        console.log("📭 No items in batch, waiting...");
        return;
      }

      this.stats.lastBatchSize = tickBatch.length;
      console.log(`📦 Processing batch of ${tickBatch.length} website ticks...`);

      // Bulk insert to database
      await this.bulkInsertTicks(tickBatch);

      // Only remove from queue AFTER successful database insertion
      await removeProcessedTicks(tickBatch.length);
      console.log(`🗑️  Removed ${tickBatch.length} processed items from queue`);

      this.stats.processed += tickBatch.length;
      this.stats.lastProcessedAt = new Date();
      
      console.log(`✅ Successfully processed ${tickBatch.length} ticks. Total processed: ${this.stats.processed}`);

    } catch (error) {
      this.stats.failed++;
      console.error("❌ Error processing batch:", error);
      
      // Wait longer on error to prevent spam
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

  private async bulkInsertTicks(tickBatch: WebsiteTickData[]): Promise<void> {
    const startTime = Date.now();

    try {
      // Transform tick data for Prisma
      const prismaData = tickBatch.map(tick => ({
        websiteId: tick.websiteId,
        regionId: tick.regionId,
        responseTime: tick.responseTime,
        status: tick.status,
        errorMessage: tick.errorMessage,
        responseBody: tick.responseBody,
        createdAt: tick.timestamp ? new Date(tick.timestamp) : new Date(),
      }));

      // Use Prisma's createMany for bulk insert
      const result = await prisma.websiteTick.createMany({
        data: prismaData,
        skipDuplicates: true, // Skip if duplicate IDs exist
      });

      const duration = Date.now() - startTime;
      console.log(`💾 Bulk inserted ${result.count} records in ${duration}ms`);

    } catch (error) {
      console.error("❌ Bulk insert failed:", error);
      
      // On failure, try individual inserts to save what we can
      await this.fallbackIndividualInserts(tickBatch);
    }
  }

  private async fallbackIndividualInserts(tickBatch: WebsiteTickData[]): Promise<void> {
    console.log("🔄 Attempting individual inserts as fallback...");
    let successCount = 0;
    let failureCount = 0;

    for (const tick of tickBatch) {
      try {
        await prisma.websiteTick.create({
          data: {
            websiteId: tick.websiteId,
            regionId: tick.regionId,
            responseTime: tick.responseTime,
            status: tick.status,
            errorMessage: tick.errorMessage,
            responseBody: tick.responseBody,
            createdAt: tick.timestamp ? new Date(tick.timestamp) : new Date(),
          },
        });
        successCount++;
      } catch (error) {
        failureCount++;
        console.error(`❌ Failed to insert tick for website ${tick.websiteId}:`, error);
      }
    }

    console.log(`📊 Fallback complete: ${successCount} success, ${failureCount} failed`);
  }

  getStats(): BatchStats {
    return { ...this.stats };
  }

  printStats(): void {
    console.log(`
📊 Database Consumer Stats:
   Processed: ${this.stats.processed}
   Failed Batches: ${this.stats.failed}
   Queue Length: ${this.stats.queueLength}
   Last Batch Size: ${this.stats.lastBatchSize}
   Last Processed: ${this.stats.lastProcessedAt.toISOString()}
   Uptime: ${Math.floor((Date.now() - startTime) / 1000)}s
`);
  }
}

const consumer = new DatabaseConsumer();
const startTime = Date.now();

async function main() {
  console.log(`🚀 Database Consumer started`);
  console.log(`📦 Batch size: ${BATCH_SIZE}`);
  console.log(`⏱️  Batch interval: ${BATCH_INTERVAL}ms`);

  // Print stats every 30 seconds
  const statsInterval = setInterval(() => {
    consumer.printStats();
  }, 30000);

  // Main processing loop
  while (true) {
    try {
      await consumer.processBatch();
      
      // Wait for the specified interval before next batch
      await new Promise(resolve => setTimeout(resolve, BATCH_INTERVAL));
      
    } catch (error) {
      console.error("Consumer loop error:", error);
      
      // Wait longer on error
      await new Promise(resolve => setTimeout(resolve, 15000));
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  consumer.printStats();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  consumer.printStats();
  process.exit(0);
});

main().catch((error) => {
  console.error("Database consumer encountered a fatal error:", error);
  process.exit(1);
});
