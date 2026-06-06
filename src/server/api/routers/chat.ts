import Groq from "groq-sdk";
import { z } from "zod";

import { env } from "~/env";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const historyItemSchema = z.object({
  role: z.enum(["user", "model"]),
  text: z.string(),
});

/**
 * Gera uma resposta para uma mensagem de chat usando Gemini.
 * Usa o histórico das últimas mensagens para dar contexto à resposta.
 */
export const chatRouter = createTRPCRouter({
  reply: publicProcedure
    .input(
      z.object({
        message: z.string().min(1).max(2000),
        senderName: z.string().min(1).max(100),
        history: z.array(historyItemSchema).max(20).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      if (!env.GROQ_API_KEY) {
        console.warn("[chat.reply] GROQ_API_KEY não configurada — usando fallback.");
        return { text: "Oi! Tudo bem por aí?" };
      }

      try {
        const groq = new Groq({ apiKey: env.GROQ_API_KEY });

        const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
          {
            role: "system",
            content: `Você é ${input.senderName}, uma pessoa real em uma conversa de chat casual. Responda de forma natural, direta e descontraída em português brasileiro, como qualquer pessoa responderia num chat do dia a dia — sem formalidades, sem ser robótico. Use linguagem simples e coloquial. Responda com 1 a 2 frases curtas no máximo. Responda apenas com o texto da mensagem, sem prefixos ou aspas.`,
          },
        ];

        if (input.history) {
          for (const h of input.history) {
            messages.push({ role: h.role === "user" ? "user" : "assistant", content: h.text });
          }
        }

        messages.push({ role: "user", content: input.message });

        const completion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages,
          max_tokens: 150,
        });
        const text = completion.choices[0]?.message?.content?.trim() ?? "";

        return { text: text || "Hm, me conta mais!" };
      } catch (err) {
        console.error("[chat.reply] Erro ao chamar Groq:", err);
        return { text: "Poxa, não consegui responder agora. Tenta de novo?" };
      }
    }),
});
