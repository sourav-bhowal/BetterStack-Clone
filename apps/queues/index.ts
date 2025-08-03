import { prisma } from "@repo/database";
import { client as producer } from "@repo/redis";

async function main() {
  const websites = await prisma.website.findMany({
    select: {
      id: true,
      url: true,
    },
  });
  console.log(websites);
}

setInterval(() => {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}, 3000);
