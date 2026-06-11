"use client";

import { useCallback, useMemo, useState } from "react";

import { usePermissions } from "~/app/_components/active-user-provider";
import { CalendarSidePanel } from "~/app/(app)/calendario/_components/calendar-side-panel";
import { GoalFormModal } from "~/app/(app)/calendario/_components/goal-form-modal";
import { MonthCalendar } from "~/app/(app)/calendario/_components/month-calendar";
import { getUtcTodayStart } from "~/app/(app)/calendario/_utils/calendar-grid";
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
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [goalReadOnly, setGoalReadOnly] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [goalInitialStartDate, setGoalInitialStartDate] = useState<Date | null>(
    null,
  );

  const weekReferenceDate = useMemo(
    () => selectedDay ?? getUtcTodayStart(),
    [selectedDay],
  );

  const referenceMonth = useMemo(() => {
    if (selectedDay) {
      return {
        year: selectedDay.getUTCFullYear(),
        month: selectedDay.getUTCMonth() + 1,
      };
    }
    return { year: initialYear, month: initialMonth };
  }, [selectedDay, initialYear, initialMonth]);

  const {
    data: monthGoals = [],
    isError,
  } = api.goal.listByMonth.useQuery(referenceMonth);

  const { can } = usePermissions();
  const utils = api.useUtils();

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
    setGoalReadOnly(false);
    setGoalInitialStartDate(null);
    setModalOpen(true);
  };

  const handleSelectDay = useCallback((date: Date) => {
    setSelectedDay(date);
  }, []);

  const handleActivateDay = useCallback(
    (date: Date) => {
      setSelectedDay(date);
      if (!can("goal.create")) return;
      const todayUtc = getUtcTodayStart().getTime();
      if (date.getTime() >= todayUtc) {
        setModalMode("create");
        setEditingGoal(null);
        setGoalReadOnly(false);
        setGoalInitialStartDate(date);
        setModalOpen(true);
      }
    },
    [can],
  );

  const handleEditGoal = (goal: Goal) => {
    setModalMode("edit");
    setEditingGoal(goal);
    setGoalReadOnly(false);
    setGoalInitialStartDate(null);
    setModalOpen(true);
  };

  const handleViewGoal = (goal: Goal) => {
    setModalMode("edit");
    setEditingGoal(goal);
    setGoalReadOnly(true);
    setGoalInitialStartDate(null);
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
      <div className="-m-2 flex h-full flex-1 flex-col sm:-m-4 md:-m-6">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border-4 border-calendar-cardinal bg-calendar-ice p-3 sm:p-4">
          {isError && (
            <p role="alert" className="mb-3 text-sm text-red-600">
              Não foi possível carregar as metas. Tente novamente.
            </p>
          )}

          <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
            <div className="min-h-[28rem] flex-[7] lg:min-h-0">
              <MonthCalendar
                selectedDay={selectedDay}
                onSelectDay={handleSelectDay}
                onActivateDay={handleActivateDay}
              />
            </div>
            <div className="min-h-[24rem] min-w-0 flex-[3] lg:min-h-0">
              <CalendarSidePanel
                year={referenceMonth.year}
                month={referenceMonth.month}
                monthGoals={monthGoals}
                selectedDay={selectedDay}
                selectedGoalId={selectedGoalId}
                weekReferenceDate={weekReferenceDate}
                onSelectGoal={setSelectedGoalId}
                onCreateGoal={handleCreateGoal}
                onEditGoal={handleEditGoal}
                onCompleteGoal={handleCompleteGoal}
                onDeleteGoal={handleDeleteGoal}
                onViewGoal={handleViewGoal}
              />
            </div>
          </div>
        </div>
      </div>

      <GoalFormModal
        open={modalOpen}
        mode={modalMode}
        goal={editingGoal}
        readOnly={goalReadOnly}
        initialStartDate={goalInitialStartDate}
        onClose={() => setModalOpen(false)}
        onSuccess={() => setSelectedGoalId(null)}
      />
    </>
  );
}
