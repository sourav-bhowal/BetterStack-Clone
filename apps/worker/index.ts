import { xReadGroup, xAck } from "@repo/redis";
import { prisma } from "@repo/database";
import { parseWebsiteMessages } from "./utils/redis-parser.js";
import axios from "axios";

const REGION_ID = process.env.REGION_ID!;
const WORKER_ID = process.env.WORKER_ID!;

if (!REGION_ID || !WORKER_ID) {
  throw new Error(
    "REGION_ID and WORKER_ID must be set in environment variables"
  );
}

async function processMessages() {
  try {
    // Read messages from the "websites" stream for the specified region and worker
    const data = await xReadGroup(REGION_ID, WORKER_ID);

    // Check if data is in the expected format
    if (
      !Array.isArray(data) ||
      data.length === 0 ||
      !Array.isArray(data[0][1])
    ) {
      console.log("No website entries in stream, waiting...");
      return;
    }

    // Extract the messages from the stream data
    const messages = data[0][1];

    // Parse the messages to extract website data
    const websites = parseWebsiteMessages(messages);

    console.log(`Processing ${websites.length} websites...`);

    // Process each website
    for (const website of websites) {
      const startTime = Date.now();
      let status: "UP" | "DOWN" = "DOWN";
      let responseTime = 0;
      let errorMessage: string | null = null;

      try {
        const response = await axios.get(website.url, {
          timeout: 10000, // 10 second timeout
          validateStatus: (status) => status < 600, // Don't throw on 4xx/5xx, we want to handle them
        });

        const endTime = Date.now();
        responseTime = endTime - startTime;

        // Consider 2xx and 3xx as UP, 4xx and 5xx as DOWN
        status = response.status < 400 ? "UP" : "DOWN";

        // Set error message for 4xx and 5xx status codes
        if (response.status >= 400) {
          errorMessage = `HTTP ${response.status} - ${response.statusText}`;
        }

        console.log(
          `${status === "UP" ? "✅" : "❌"} ${website.url} - Status: ${response.status}, Time: ${responseTime}ms`
        );
      } catch (error) {
        const endTime = Date.now();
        responseTime = endTime - startTime;
        status = "DOWN";

        if (axios.isAxiosError(error)) {
          if (error.code === "ECONNABORTED") {
            errorMessage = "Request timeout";
          } else if (error.code === "ENOTFOUND") {
            errorMessage = "Domain not found";
          } else if (error.code === "ECONNREFUSED") {
            errorMessage = "Connection refused";
          } else {
            errorMessage = error.message;
          }
        } else {
          errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        }

        console.error(
          `❌ Error fetching ${website.url}: ${errorMessage} (${responseTime}ms)`
        );
      }

      try {
        // Always save the result to database
        await prisma.websiteTick.create({
          data: {
            websiteId: website.websiteId,
            regionId: REGION_ID,
            responseTime: responseTime,
            status: status,
            errorMessage: errorMessage,
          },
        });

        // Acknowledge the message after successful processing and DB save
        await xAck(REGION_ID, website.messageId);
      } catch (dbError) {
        console.error(
          `❌ Database error for ${website.url}:`,
          dbError instanceof Error ? dbError.message : dbError
        );

        // Still acknowledge the message to prevent infinite reprocessing
        // The monitoring data is lost but we don't want to block the queue
        await xAck(REGION_ID, website.messageId);
      }
    }
  } catch (error) {
    console.error("Error processing messages:", error);
  }
}

async function main() {
  console.log(`🚀 Worker started - Region: ${REGION_ID}, Worker: ${WORKER_ID}`);

  // Keep the worker running indefinitely
  while (true) {
    try {
      await processMessages();

      // Small delay to prevent overwhelming the Redis server
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
    } catch (error) {
      console.error("Worker loop error:", error);

      // Wait a bit longer before retrying on error
      await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 second delay on error
    }
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Received SIGINT, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Received SIGTERM, shutting down gracefully...");
  process.exit(0);
});

main().catch((error) => {
  console.error("Worker encountered a fatal error:", error);
  process.exit(1);
});
