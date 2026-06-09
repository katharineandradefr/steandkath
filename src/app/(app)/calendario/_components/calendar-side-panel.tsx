"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Minus, Pencil, Plus } from "lucide-react";

import { GoalCard } from "~/app/(app)/calendario/_components/goal-card";
import {
  filterGoalsByProject,
  goalsOverlappingRange,
  type Goal,
} from "~/shared/goal";
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
  selectedDay: Date | null;
  selectedGoalId: string | null;
  weekReferenceDate: Date;
  onSelectGoal: (goalId: string | null) => void;
  onOpenCreatePendency: () => void;
  onCreateGoal: () => void;
  onEditGoal: (goal: Goal) => void;
  onCompleteGoal: (goal: Goal) => void;
  onDeleteGoal: (goal: Goal) => void;
};

type ViewMode = "project" | "day";

/**
 * Formata a data selecionada para a pílula DD/MM.
 */
function formatDayPillLabel(date: Date): string {
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
}

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
  year: _year,
  month: _month,
  monthGoals,
  selectedDay,
  selectedGoalId,
  weekReferenceDate,
  onSelectGoal,
  onOpenCreatePendency,
  onCreateGoal,
  onEditGoal,
  onCompleteGoal,
  onDeleteGoal,
}: CalendarSidePanelProps) {
  const { data: weekGoals = [], isLoading: weekLoading } =
    api.goal.listByWeek.useQuery({ referenceDate: weekReferenceDate });

  const [activeProject, setActiveProject] =
    useState<PendencyProjectKey>("extensivo");
  const [viewMode, setViewMode] = useState<ViewMode>("project");
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const dayGoals = useMemo(() => {
    if (!selectedDay) return [];
    return goalsOverlappingRange(monthGoals, selectedDay, selectedDay);
  }, [monthGoals, selectedDay]);

  useEffect(() => {
    if (selectedDay && dayGoals.length > 0) {
      setViewMode("day");
    } else {
      setViewMode("project");
    }
  }, [selectedDay, dayGoals.length]);

  useEffect(() => {
    if (!createMenuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!createMenuRef.current?.contains(e.target as Node)) {
        setCreateMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCreateMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [createMenuOpen]);

  const filteredGoals = filterGoalsByProject(monthGoals, activeProject);
  const displayedGoals = viewMode === "day" ? dayGoals : filteredGoals;
  const selectedGoal =
    displayedGoals.find((g) => g.id === selectedGoalId) ??
    monthGoals.find((g) => g.id === selectedGoalId) ??
    null;

  const handleSelectProject = (key: PendencyProjectKey) => {
    setViewMode("project");
    setActiveProject(key);
  };

  const scrollByViewport = (direction: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const delta = el.clientWidth * 0.8 * (direction === "left" ? -1 : 1);
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col gap-4">
      <section className="shrink-0">
        <p className="mb-3 text-sm text-calendar-muted">Essa Semana:</p>
        <div className="h-52 overflow-y-auto pr-1">
          {weekLoading ? (
            <p className="text-center text-sm text-calendar-muted">Carregando…</p>
          ) : weekGoals.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
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
        </div>
      </section>

      <div className="flex min-w-0 items-center gap-1">
        <button
          type="button"
          onClick={() => scrollByViewport("left")}
          className="rounded p-1 text-calendar-muted hover:text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal"
          aria-label="Rolar projetos para a esquerda"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
        <div
          ref={scrollerRef}
          className="no-scrollbar min-w-0 flex-1 overflow-x-auto"
        >
          <div className="flex w-max flex-nowrap gap-1.5">
            {PENDENCY_PROJECT_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectProject(key)}
                className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal ${
                  viewMode === "project" && activeProject === key
                    ? "bg-calendar-cardinal text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {PENDENCY_PROJECT_LABELS[key]}
              </button>
            ))}
            {selectedDay && dayGoals.length > 0 && (
              <button
                type="button"
                onClick={() => setViewMode("day")}
                className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal ${
                  viewMode === "day"
                    ? "bg-calendar-cardinal text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
                aria-label={`Metas do dia ${formatDayPillLabel(selectedDay)}`}
              >
                {formatDayPillLabel(selectedDay)}
              </button>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => scrollByViewport("right")}
          className="rounded p-1 text-calendar-muted hover:text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal"
          aria-label="Rolar projetos para a direita"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div
        className="flex min-h-0 flex-1 flex-col rounded-xl bg-calendar-bordeaux p-3"
        onMouseLeave={() => onSelectGoal(null)}
      >
        <div className="min-h-0 flex-1 space-y-2 overflow-x-hidden overflow-y-auto">
          {displayedGoals.length === 0 ? (
            <p className="py-6 text-center text-sm text-white/60">
              {viewMode === "day"
                ? "Nenhuma meta neste dia."
                : "Nenhuma meta neste projeto."}
            </p>
          ) : (
            displayedGoals.map((goal) => (
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
          <div ref={createMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setCreateMenuOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={createMenuOpen}
              aria-label="Adicionar"
              className="rounded-md p-1.5 text-white transition-colors duration-150 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Plus className="h-5 w-5" aria-hidden />
            </button>
            {createMenuOpen && (
              <div
                role="menu"
                className="absolute bottom-full left-0 mb-2 min-w-[140px] overflow-hidden rounded-lg border border-white/15 bg-white text-sm text-gray-900 shadow-lg"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setCreateMenuOpen(false);
                    onCreateGoal();
                  }}
                  className="block w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  Meta
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setCreateMenuOpen(false);
                    onOpenCreatePendency();
                  }}
                  className="block w-full border-t border-gray-100 px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  Pendência
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => selectedGoal && onCompleteGoal(selectedGoal)}
            disabled={!selectedGoal}
            className="rounded-md p-1.5 text-white transition-colors duration-150 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label="Marcar meta como concluída"
          >
            <Check className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => selectedGoal && onDeleteGoal(selectedGoal)}
            disabled={!selectedGoal}
            className="rounded-md p-1.5 text-white transition-colors duration-150 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
            className="rounded-md p-1.5 text-white transition-colors duration-150 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
