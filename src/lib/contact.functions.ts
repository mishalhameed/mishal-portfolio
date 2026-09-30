import { createServerFn } from "@tanstack/react-start";
import { contactSchema, type ContactResult } from "@/lib/contact-schema";

function formatMessage(data: {
  name: string;
  email: string;
  message: string;
  budget: string;
}) {
  return [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Budget: ${data.budget || "—"}`,
    "",
    data.message,
  ].join("\n");
}

export const submitContact = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const parsed = contactSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error("Invalid contact form");
    }
    return parsed.data;
  })
  .handler(async ({ data }): Promise<ContactResult> => {
    if (data.company_url || Date.now() - data.startedAt < 400) {
      return { ok: false, code: "INVALID" };
    }

    const text = formatMessage(data);
    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.CONTACT_TO_EMAIL;
    const from = process.env.CONTACT_FROM_EMAIL;
    const webhook = process.env.CONTACT_WEBHOOK_URL;

    try {
      if (apiKey && to && from) {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to: [to],
            reply_to: data.email,
            subject: `Conversation — ${data.name}`,
            text,
          }),
        });
        if (!response.ok) return { ok: false, code: "SEND_FAILED" };
        return { ok: true, mode: "sent" };
      }

      if (webhook) {
        const response = await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            message: data.message,
            budget: data.budget,
          }),
        });
        if (!response.ok) return { ok: false, code: "SEND_FAILED" };
        return { ok: true, mode: "sent" };
      }

      return { ok: false, code: "UNCONFIGURED" };
    } catch {
      return { ok: false, code: "SEND_FAILED" };
    }
  });
