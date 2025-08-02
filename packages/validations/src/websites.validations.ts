import { z } from "zod";

export const createWebsiteSchema = z.object({
  url: z.string().url(),
});

export type CreateWebsiteSchemaType = z.infer<typeof createWebsiteSchema>;