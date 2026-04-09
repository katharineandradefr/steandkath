import "server-only";

import sgMail from "@sendgrid/mail";

import { env } from "~/env";

/**
 * Indica se as variáveis mínimas do SendGrid estão definidas.
 */
export function isSendGridConfigured(): boolean {
  return Boolean(env.SENDGRID_API_KEY && env.SENDGRID_FROM_EMAIL);
}

/**
 * Envia um e-mail transacional via SendGrid (API key e remetente devem estar no `.env`).
 */
export async function sendTransactionalEmail(params: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}): Promise<void> {
  if (!env.SENDGRID_API_KEY) {
    throw new Error("SENDGRID_API_KEY is not set");
  }
  if (!env.SENDGRID_FROM_EMAIL) {
    throw new Error("SENDGRID_FROM_EMAIL is not set");
  }

  const apiKey = env.SENDGRID_API_KEY;
  const from = env.SENDGRID_FROM_EMAIL;
  sgMail.setApiKey(apiKey);
  await sgMail.send({
    to: params.to,
    from,
    subject: params.subject,
    text: params.text ?? " ",
    ...(params.html !== undefined ? { html: params.html } : {}),
  });
}
