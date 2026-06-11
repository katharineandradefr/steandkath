import Groq from "groq-sdk";
import { z } from "zod";

import { env } from "~/env";
import { assertPlatformPermission } from "~/server/auth/platform-permissions";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { connectToDatabase } from "~/server/db/connection";
import { DrCofKnowledgeModel } from "~/server/db/models/dr-cof-knowledge";

const historyItemSchema = z.object({
  role: z.enum(["user", "model"]),
  text: z.string(),
});

/** Tenta buscar conhecimentos do banco; retorna [] se o banco estiver indisponível */
async function fetchKnowledge(): Promise<{ title: string; content: string }[]> {
  try {
    await connectToDatabase();
    return await DrCofKnowledgeModel.find().sort({ createdAt: -1 }).lean();
  } catch {
    console.warn("[drCof] Banco indisponível — respondendo sem conhecimentos salvos.");
    return [];
  }
}

/**
 * Router do Dr. Cof: chatbot com base de conhecimento treinável.
 * O banco de dados é opcional — se falhar, a IA responde sem o contexto salvo.
 */
export const drCofRouter = createTRPCRouter({
  ask: publicProcedure
    .input(
      z.object({
        message: z.string().min(1).max(2000),
        history: z.array(historyItemSchema).max(20).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      if (!env.GROQ_API_KEY) {
        console.warn("[drCof.ask] GROQ_API_KEY não configurada.");
        return { text: "Olá! Sou o Dr. Cof. Configure a chave da IA para começar." };
      }

      const knowledgeDocs = await fetchKnowledge();

      const systemPrompt = [
        `Você é o Dr. Cof, assistente de IA da MedCof — empresa de cursos preparatórios para Residência Médica.`,
        `Responda sempre em português brasileiro, de forma clara, objetiva e profissional.`,
        `Responda de forma direta e útil, sem repetir a pergunta nem usar prefixos como "Dr. Cof:".`,
        knowledgeDocs.length > 0
          ? `\nUse os seguintes conhecimentos para responder:\n\n${knowledgeDocs.map((k, i) => `[${i + 1}] ${k.title}:\n${k.content}`).join("\n\n")}`
          : `\nAinda não possuo conhecimentos específicos cadastrados. Responda de forma geral e educada.`,
      ]
        .filter(Boolean)
        .join("\n");

      const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
        { role: "system", content: systemPrompt },
      ];

      if (input.history) {
        for (const h of input.history) {
          messages.push({ role: h.role === "user" ? "user" : "assistant", content: h.text });
        }
      }

      messages.push({ role: "user", content: input.message });

      try {
        const groq = new Groq({ apiKey: env.GROQ_API_KEY });
        const completion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages,
          max_tokens: 1024,
        });
        const text = completion.choices[0]?.message?.content?.trim() ?? "";
        return { text: text || "Não consegui formular uma resposta. Tente reformular a pergunta." };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[drCof.ask] Erro Groq:", message);
        return { text: `Erro da IA: ${message}` };
      }
    }),

  addKnowledge: publicProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        content: z.string().min(1).max(10000),
      }),
    )
    .mutation(async ({ input }) => {
      await assertPlatformPermission("ai.teach");
      await connectToDatabase();
      const doc = await DrCofKnowledgeModel.create(input);
      return { id: doc._id.toString() };
    }),

  listKnowledge: publicProcedure.query(async () => {
    try {
      await connectToDatabase();
      const docs = await DrCofKnowledgeModel.find().sort({ createdAt: -1 }).lean();
      return docs.map((d) => ({
        id: d._id.toString(),
        title: d.title,
        content: d.content,
        createdAt: (d as { createdAt?: Date }).createdAt?.toISOString() ?? "",
      }));
    } catch {
      return [];
    }
  }),

  deleteKnowledge: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await assertPlatformPermission("ai.teach");
      await connectToDatabase();
      await DrCofKnowledgeModel.findByIdAndDelete(input.id);
      return { ok: true };
    }),
});
