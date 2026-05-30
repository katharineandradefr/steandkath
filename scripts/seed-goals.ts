/**
 * Popula metas de exemplo para validar o layout do calendário.
 * Uso: pnpm seed:goals
 */
import { connectToDatabase } from "../src/server/db/connection";
import { GoalModel } from "../src/server/db/models/goal";
import { DEFAULT_GOAL_AVATAR_URL } from "../src/shared/goal";
import { DEFAULT_AREA_KEY } from "../src/shared/pendency";

const SEED_GOALS = [
  {
    id: "a1000000-0000-4000-8000-000000000001",
    title: "Extensivo Rev 2",
    projectKey: "extensivo" as const,
    status: "in_progress" as const,
    startDate: new Date(Date.UTC(2026, 4, 22)),
    dueDate: new Date(Date.UTC(2026, 4, 25)),
  },
  {
    id: "a1000000-0000-4000-8000-000000000002",
    title: "Revalida Livro Físico",
    projectKey: "usa" as const,
    status: "pending" as const,
    startDate: new Date(Date.UTC(2026, 4, 20)),
    dueDate: new Date(Date.UTC(2026, 4, 25)),
  },
  {
    id: "a1000000-0000-4000-8000-000000000003",
    title: "Rádio Rev 3",
    projectKey: "radio" as const,
    status: "pending" as const,
    startDate: new Date(Date.UTC(2026, 4, 24)),
    dueDate: new Date(Date.UTC(2026, 4, 25)),
  },
];

async function main() {
  await connectToDatabase();

  for (const seed of SEED_GOALS) {
    await GoalModel.findOneAndUpdate(
      { id: seed.id },
      {
        ...seed,
        areaKey: DEFAULT_AREA_KEY,
        assigneeName: "Responsável",
        assigneeAvatarUrl: DEFAULT_GOAL_AVATAR_URL,
      },
      { upsert: true, new: true },
    );
  }

  console.log(`Seed concluído: ${SEED_GOALS.length} metas inseridas/atualizadas.`);
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error("Erro no seed:", error);
  process.exit(1);
});
