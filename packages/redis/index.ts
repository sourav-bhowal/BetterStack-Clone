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
