import { prisma } from "@repo/database";
import { createWebsiteSchema } from "@repo/validations";
import type { Request, Response } from "express";

export async function createWebsite(req: Request, res: Response) {
  const { data, error } = createWebsiteSchema.safeParse(req.body);

  if (error) {
    return res.status(400).json({
      error: "Invalid input",
      details: error.errors.map((err) => err.message),
    });
  }

  try {
    const website = await prisma.website.create({
      data: {
        url: data.url,
        user: {
          connect: { id: req.user.id }, // Assuming req.user contains the authenticated user's info
        },
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
}

export async function getWebsiteStatus(req: Request, res: Response) {
  const { websiteId } = req.params;

  if (!websiteId) {
    return res.status(400).json({ error: "Website ID is required" });
  }

  try {
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
  } catch (error) {
    console.error("Error retrieving website status:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
