import { GoogleGenerativeAI } from "@google/generative-ai";
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
      if (!env.GEMINI_API_KEY) {
        console.warn("[chat.reply] GEMINI_API_KEY não configurada — usando fallback.");
        return { text: "Oi! Tudo bem por aí?" };
      }

      try {
        const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

        const historyBlock =
          input.history && input.history.length > 0
            ? input.history
                .map((h) =>
                  h.role === "user"
                    ? `Eu disse: "${h.text}"`
                    : `${input.senderName} respondeu: "${h.text}"`,
                )
                .join("\n")
            : null;

        const prompt = [
          `Você é ${input.senderName}, uma pessoa real em uma conversa de chat casual.`,
          `Responda de forma natural, direta e descontraída em português brasileiro,`,
          `como qualquer pessoa responderia num chat do dia a dia — sem formalidades, sem ser robótico.`,
          `Use linguagem simples e coloquial. Responda com 1 a 2 frases curtas no máximo.`,
          historyBlock ? `\nContexto da conversa até agora:\n${historyBlock}` : "",
          `\nMensagem recebida: "${input.message}"`,
          `\nResponda apenas com o texto da sua mensagem de resposta, sem prefixos ou aspas.`,
        ]
          .filter(Boolean)
          .join("\n");

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        return { text: text || "Hm, me conta mais!" };
      } catch (err) {
        console.error("[chat.reply] Erro ao chamar Gemini:", err);
        return { text: "Poxa, não consegui responder agora. Tenta de novo?" };
      }
    }),
});
