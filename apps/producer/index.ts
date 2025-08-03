import { prisma } from "@repo/database";
import { xAddBulk } from "@repo/redis";

async function main() {
  const websites = await prisma.website.findMany({
    select: {
      id: true,
      url: true,
    },
  });

  // console.log(websites);

  if (websites.length > 0) {
    await xAddBulk(websites);
    console.log("Added websites to Redis stream");
  } else {
    console.log("No websites found to add to Redis stream");
  }
}

setInterval(
  () => {
    console.log("Running periodic task...");
    main()
      .then(() => console.log("Periodic task completed"))
      .catch((error) => console.error("Error in periodic task:", error));
  },
  3 * 60 * 1000
); // Run every 3 minutes

main()
  .then(() => {
    console.log("Script executed successfully");
  })
  .catch((error) => {
    console.error("Error executing script:", error);
  });
