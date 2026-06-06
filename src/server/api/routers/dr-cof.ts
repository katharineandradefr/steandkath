import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

import { env } from "~/env";
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
      if (!env.GEMINI_API_KEY) {
        console.warn("[drCof.ask] GEMINI_API_KEY não configurada.");
        return { text: "Olá! Sou o Dr. Cof. Configure a chave da IA para começar." };
      }

      const knowledgeDocs = await fetchKnowledge();

      const knowledgeBlock =
        knowledgeDocs.length > 0
          ? knowledgeDocs
              .map((k, i) => `[${i + 1}] ${k.title}:\n${k.content}`)
              .join("\n\n")
          : null;

      const historyBlock =
        input.history && input.history.length > 0
          ? input.history
              .map((h) =>
                h.role === "user"
                  ? `Usuário perguntou: "${h.text}"`
                  : `Dr. Cof respondeu: "${h.text}"`,
              )
              .join("\n")
          : null;

      const prompt = [
        `Você é o Dr. Cof, assistente de IA da MedCof — empresa de cursos preparatórios para Residência Médica.`,
        `Responda sempre em português brasileiro, de forma clara, objetiva e profissional.`,
        knowledgeBlock
          ? `\nUse os seguintes conhecimentos para responder:\n\n${knowledgeBlock}`
          : `\nAinda não possuo conhecimentos específicos cadastrados. Responda de forma geral e educada.`,
        historyBlock ? `\nContexto da conversa:\n${historyBlock}` : "",
        `\nPergunta do usuário: "${input.message}"`,
        `\nResponda de forma direta e útil, sem repetir a pergunta nem usar prefixos como "Dr. Cof:".`,
      ]
        .filter(Boolean)
        .join("\n");

      try {
        const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        return { text: text || "Não consegui formular uma resposta. Tente reformular a pergunta." };
      } catch (err) {
        console.error("[drCof.ask] Erro Gemini:", err);
        return { text: "Não consegui me conectar à IA agora. Verifique sua chave GEMINI_API_KEY e tente novamente." };
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
      await connectToDatabase();
      await DrCofKnowledgeModel.findByIdAndDelete(input.id);
      return { ok: true };
    }),
});
