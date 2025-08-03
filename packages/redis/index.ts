import { Redis } from "ioredis";

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL!);

// Define the key and ID for the Redis stream
// The key is used to store the stream, and the ID is used to identify entries in the stream
const STREAM_NAME = "betterstack:website";
const _id = "*"; // The asterisk (*) is used to automatically generate a unique ID for each entry

// Define the type for the entries that will be added to the Redis stream
type WebsiteEntry = {
  id: string;
  url: string;
};

// Function to add a single entry to the Redis stream
async function xAdd({ url, id }: WebsiteEntry): Promise<void> {
  await redis.xadd(STREAM_NAME, _id, "id", id, "url", url);
}

// Function to add multiple entries to the Redis stream
export async function xAddBulk(entries: WebsiteEntry[]): Promise<void> {
  for (const entry of entries) {
    await xAdd(entry);
  }
}

// Create a consumer group for the Redis stream
export async function createConsumerGroup(region_ids: string[]): Promise<void> {
  for (const region_id of region_ids) {
    await redis.xgroup("CREATE", STREAM_NAME, region_id, "0", "MKSTREAM");
  }
}

// Function to read entries from the Redis stream
export async function xReadGroup(
  region_id: string,
  worker_id: string
): Promise<any> {
  const result = await redis.xreadgroup(
    "GROUP",
    region_id,
    worker_id,
    "COUNT",
    5, // Number of entries to read
    "STREAMS",
    STREAM_NAME,
    ">"
  );
  // console.log("xReadGroup result:", result);
  return result;
}

// Function to acknowledge a message in the Redis stream
export async function xAck(
  region_id: string,
  message_id: string
): Promise<number> {
  const result = await redis.xack(STREAM_NAME, region_id, message_id);
  console.log("xAck result:", result);
  return result;
}

// =================== WEBSITE TICK QUEUE ===================

const TICK_QUEUE_NAME = "betterstack:website-ticks";

// Define the type for website tick data
export type WebsiteTickData = {
  websiteId: string;
  regionId: string;
  responseTime: number;
  status: "UP" | "DOWN";
  errorMessage?: string | null;
  responseBody?: string | null;
  timestamp?: number;
};

// Add website tick data to queue
export async function addToTickQueue(tickData: WebsiteTickData): Promise<void> {
  const dataWithTimestamp = {
    ...tickData,
    timestamp: tickData.timestamp || Date.now(),
  };

  await redis.lpush(TICK_QUEUE_NAME, JSON.stringify(dataWithTimestamp));
}

// Get batch of website ticks from queue (without removing them)
export async function getTickBatch(batchSize: number = 50): Promise<WebsiteTickData[]> {
  const items = await redis.lrange(TICK_QUEUE_NAME, -batchSize, -1);
  return items.map(item => JSON.parse(item) as WebsiteTickData);
}

// Remove processed items from queue after successful database insertion
export async function removeProcessedTicks(count: number): Promise<void> {
  if (count > 0) {
    await redis.ltrim(TICK_QUEUE_NAME, 0, -(count + 1));
  }
}

// Get and remove batch atomically (original behavior if needed)
export async function popTickBatch(batchSize: number = 50): Promise<WebsiteTickData[]> {
  const items = await redis.lrange(TICK_QUEUE_NAME, -batchSize, -1);
  
  if (items.length > 0) {
    await redis.ltrim(TICK_QUEUE_NAME, 0, -(items.length + 1));
  }

  return items.map(item => JSON.parse(item) as WebsiteTickData);
}

// Get queue length
export async function getTickQueueLength(): Promise<number> {
  return await redis.llen(TICK_QUEUE_NAME);
}

// Clear the tick queue (useful for debugging)
export async function clearTickQueue(): Promise<void> {
  await redis.del(TICK_QUEUE_NAME);
}
