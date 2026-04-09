import "server-only";

import OpenAI from "openai";

import { env } from "~/env";

/**
 * Indica se a chave da API OpenAI está configurada.
 */
export function isOpenAIConfigured(): boolean {
  return Boolean(env.OPENAI_API_KEY);
}

/**
 * Cliente OpenAI oficial (use apenas em código server-side / tRPC).
 */
export function getOpenAIClient(): OpenAI {
  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return new OpenAI({ apiKey: env.OPENAI_API_KEY });
}
