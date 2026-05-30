"use client";

import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Minus, Pencil, Plus } from "lucide-react";

import { GoalCard } from "~/app/(app)/calendario/_components/goal-card";
import { filterGoalsByProject, type Goal } from "~/shared/goal";
import {
  PENDENCY_PROJECT_KEYS,
  PENDENCY_PROJECT_LABELS,
  type PendencyProjectKey,
} from "~/shared/pendency";
import { api } from "~/trpc/react";

type CalendarSidePanelProps = {
  year: number;
  month: number;
  monthGoals: Goal[];
  selectedGoalId: string | null;
  onSelectGoal: (goalId: string | null) => void;
  onOpenCreatePendency: () => void;
  onCreateGoal: () => void;
  onEditGoal: (goal: Goal) => void;
  onCompleteGoal: (goal: Goal) => void;
  onDeleteGoal: (goal: Goal) => void;
};

/**
 * Ilustração minimalista de cubos empilhados para estado vazio.
 */
function StackedCubesIllustration() {
  return (
    <div className="relative mx-auto h-16 w-20" aria-hidden>
      <div className="absolute bottom-0 left-1/2 h-8 w-12 -translate-x-1/2 rounded-sm bg-white/20 shadow-sm" />
      <div className="absolute bottom-4 left-1/2 h-8 w-10 -translate-x-1/2 rounded-sm bg-white/35 shadow-sm" />
      <div className="absolute bottom-8 left-1/2 h-7 w-8 -translate-x-1/2 rounded-sm bg-white/50 shadow-sm" />
    </div>
  );
}

/**
 * Painel lateral direito: essa semana, abas de projeto e lista de metas.
 */
export function CalendarSidePanel({
  year,
  month,
  monthGoals,
  selectedGoalId,
  onSelectGoal,
  onOpenCreatePendency,
  onCreateGoal,
  onEditGoal,
  onCompleteGoal,
  onDeleteGoal,
}: CalendarSidePanelProps) {
  const referenceDate = new Date(Date.UTC(year, month - 1, 15));
  const { data: weekGoals = [], isLoading: weekLoading } =
    api.goal.listByWeek.useQuery({ referenceDate });

  const [activeProject, setActiveProject] =
    useState<PendencyProjectKey>("extensivo_27");

  const filteredGoals = filterGoalsByProject(monthGoals, activeProject);
  const selectedGoal =
    filteredGoals.find((g) => g.id === selectedGoalId) ??
    monthGoals.find((g) => g.id === selectedGoalId) ??
    null;

  const projectIndex = PENDENCY_PROJECT_KEYS.indexOf(activeProject);

  const handlePrevTab = () => {
    const prevIndex =
      projectIndex <= 0
        ? PENDENCY_PROJECT_KEYS.length - 1
        : projectIndex - 1;
    setActiveProject(PENDENCY_PROJECT_KEYS[prevIndex]!);
  };

  const handleNextTab = () => {
    const nextIndex =
      projectIndex >= PENDENCY_PROJECT_KEYS.length - 1
        ? 0
        : projectIndex + 1;
    setActiveProject(PENDENCY_PROJECT_KEYS[nextIndex]!);
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <section>
        <p className="mb-3 text-sm text-calendar-muted">Essa Semana:</p>
        {weekLoading ? (
          <p className="text-center text-sm text-calendar-muted">Carregando…</p>
        ) : weekGoals.length === 0 ? (
          <div className="py-4 text-center">
            <StackedCubesIllustration />
            <p className="mt-3 text-sm text-calendar-muted">
              Não tem nada aqui
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {weekGoals.map((goal) => (
              <li key={goal.id}>
                <GoalCard
                  goal={goal}
                  selected={selectedGoalId === goal.id}
                  onSelect={() => onSelectGoal(goal.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handlePrevTab}
          className="rounded p-1 text-calendar-muted hover:text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal"
          aria-label="Projeto anterior"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
        <div className="flex flex-1 gap-1">
          {PENDENCY_PROJECT_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveProject(key)}
              className={`flex-1 rounded-full px-2 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal ${
                activeProject === key
                  ? "bg-calendar-cardinal text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {PENDENCY_PROJECT_LABELS[key]}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleNextTab}
          className="rounded p-1 text-calendar-muted hover:text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal"
          aria-label="Próximo projeto"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col rounded-xl bg-calendar-bordeaux p-3">
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
          {filteredGoals.length === 0 ? (
            <p className="py-6 text-center text-sm text-white/60">
              Nenhuma meta neste projeto.
            </p>
          ) : (
            filteredGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                selected={selectedGoalId === goal.id}
                onSelect={() => onSelectGoal(goal.id)}
              />
            ))
          )}
        </div>

        <div className="mt-3 flex items-center gap-3 border-t border-white/20 pt-3">
          <button
            type="button"
            onClick={onOpenCreatePendency}
            className="rounded p-1.5 text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label="Adicionar pendência"
          >
            <Plus className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => selectedGoal && onCompleteGoal(selectedGoal)}
            disabled={!selectedGoal}
            className="rounded p-1.5 text-white transition-colors hover:bg-white/10 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label="Marcar meta como concluída"
          >
            <Check className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => selectedGoal && onDeleteGoal(selectedGoal)}
            disabled={!selectedGoal}
            className="rounded p-1.5 text-white transition-colors hover:bg-white/10 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label="Excluir meta"
          >
            <Minus className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => {
              if (selectedGoal) {
                onEditGoal(selectedGoal);
              } else {
                onCreateGoal();
              }
            }}
            className="rounded p-1.5 text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label={
              selectedGoal ? "Editar meta selecionada" : "Adicionar meta"
            }
          >
            <Pencil className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
