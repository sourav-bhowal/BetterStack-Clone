import express from "express";
import cors from "cors";
import { prisma } from "@repo/database";

const app = express();

const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.post("/website", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const website = await prisma.website.create({
      data: {
        url,
      },
    });

    return res.status(201).json({
      data: website,
      message: "Website created successfully",
    });
  } catch (error) {
    console.error("Error creating website:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/status/:websiteId", async (req, res) => {
  const { websiteId } = req.params;

  if (!websiteId) {
    return res.status(400).json({ error: "Website ID is required" });
  }

  const website = await prisma.website.findUnique({
    where: { id: websiteId },
    include: { regions: true, websiteTicks: true },
  });

  if (!website) {
    return res.status(404).json({ error: "Website not found" });
  }

  return res.status(200).json({
    data: website,
    message: "Website status retrieved successfully",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
