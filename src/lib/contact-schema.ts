import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name needs at least 2 characters.").max(80),
  email: z.string().trim().email("Enter a valid email.").max(160),
  organization: z.string().trim().max(120).optional().default(""),
  building: z.string().trim().min(3, "Say a little about what you are building.").max(200),
  message: z.string().trim().min(10, "The message needs at least a sentence.").max(4000),
  budget: z.string().trim().max(80).optional().default(""),
  company_url: z.string().max(200).optional().default(""),
  startedAt: z.number(),
});

export type ContactInput = z.infer<typeof contactSchema>;

export type ContactResult =
  | { ok: true; mode: "sent" | "discarded" }
  | { ok: false; code: "UNCONFIGURED" | "SEND_FAILED" | "INVALID" };
