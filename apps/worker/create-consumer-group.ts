import { createConsumerGroup } from "@repo/redis";
import { prisma } from "@repo/database";

async function main() {
  // Define the region IDs for which to create consumer groups
  const region_ids = await prisma.region.findMany({
    select: {
      id: true,
    },
  });

  // Create consumer groups for the specified region IDs
  await createConsumerGroup(region_ids.map((region) => region.id));
}

main()
  .then(() => {
    console.log("All consumer groups created successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error creating consumer groups:", error);
    process.exit(1);
  });
