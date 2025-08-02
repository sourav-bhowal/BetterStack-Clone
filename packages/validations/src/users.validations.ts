import { z } from "zod";

export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export type UserSchemaType = z.infer<typeof userSchema>;
