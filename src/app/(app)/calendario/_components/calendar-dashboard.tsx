"use client";

import { useCallback, useState } from "react";

import { CalendarSidePanel } from "~/app/(app)/calendario/_components/calendar-side-panel";
import { GoalFormModal } from "~/app/(app)/calendario/_components/goal-form-modal";
import { MonthCalendar } from "~/app/(app)/calendario/_components/month-calendar";
import type { Goal } from "~/shared/goal";
import { api } from "~/trpc/react";

type CalendarDashboardProps = {
  initialYear: number;
  initialMonth: number;
};

/**
 * Dashboard do calendário: grade mensal + painel lateral de metas.
 */
export function CalendarDashboard({
  initialYear,
  initialMonth,
}: CalendarDashboardProps) {
  const [viewYear, setViewYear] = useState(initialYear);
  const [viewMonth, setViewMonth] = useState(initialMonth);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const monthInput = { year: viewYear, month: viewMonth };
  const {
    data: monthGoals = [],
    isLoading,
    isError,
  } = api.goal.listByMonth.useQuery(monthInput);

  const utils = api.useUtils();

  const handleMonthChange = useCallback((year: number, month: number) => {
    setViewYear(year);
    setViewMonth(month);
    setSelectedGoalId(null);
  }, []);

  const updateStatusMutation = api.goal.updateStatus.useMutation({
    onSuccess: async () => {
      await utils.goal.invalidate();
    },
  });

  const deleteMutation = api.goal.delete.useMutation({
    onSuccess: async () => {
      setSelectedGoalId(null);
      await utils.goal.invalidate();
    },
  });

  const handleCreateGoal = () => {
    setModalMode("create");
    setEditingGoal(null);
    setModalOpen(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setModalMode("edit");
    setEditingGoal(goal);
    setModalOpen(true);
  };

  const handleCompleteGoal = (goal: Goal) => {
    updateStatusMutation.mutate({ id: goal.id, status: "completed" });
  };

  const handleDeleteGoal = (goal: Goal) => {
    const confirmed = window.confirm(
      `Excluir a meta "${goal.title}"? Esta ação não pode ser desfeita.`,
    );
    if (confirmed) {
      deleteMutation.mutate({ id: goal.id });
    }
  };

  return (
    <>
      <div className="-m-2 flex min-h-[calc(100vh-4rem)] flex-col sm:-m-4 md:-m-6">
        <div className="flex min-h-0 flex-1 flex-col rounded-2xl border-4 border-calendar-cardinal bg-calendar-ice p-3 sm:p-4">
          {isError && (
            <p role="alert" className="mb-3 text-sm text-red-600">
              Não foi possível carregar as metas. Tente novamente.
            </p>
          )}

          {isLoading ? (
            <p className="py-12 text-center text-calendar-muted">
              Carregando calendário…
            </p>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
              <div className="min-h-[28rem] flex-[7] lg:min-h-0">
                <MonthCalendar
                  year={viewYear}
                  month={viewMonth}
                  goals={monthGoals}
                  onMonthChange={handleMonthChange}
                />
              </div>
              <div className="min-h-[24rem] flex-[3] lg:min-h-0">
                <CalendarSidePanel
                  year={viewYear}
                  month={viewMonth}
                  monthGoals={monthGoals}
                  selectedGoalId={selectedGoalId}
                  onSelectGoal={setSelectedGoalId}
                  onCreateGoal={handleCreateGoal}
                  onEditGoal={handleEditGoal}
                  onCompleteGoal={handleCompleteGoal}
                  onDeleteGoal={handleDeleteGoal}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <GoalFormModal
        open={modalOpen}
        mode={modalMode}
        goal={editingGoal}
        onClose={() => setModalOpen(false)}
        onSuccess={() => setSelectedGoalId(null)}
      />
    </>
  );
}
