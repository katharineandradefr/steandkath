import Image from "next/image";

import {
  DEFAULT_GOAL_AVATAR_URL,
  formatGoalDueDate,
  type Goal,
} from "~/shared/goal";

type GoalCardProps = {
  goal: Goal;
  selected?: boolean;
  onSelect?: () => void;
};

/**
 * Card de meta no painel lateral do calendário.
 */
export function GoalCard({ goal, selected = false, onSelect }: GoalCardProps) {
  const avatarUrl = goal.assigneeAvatarUrl ?? DEFAULT_GOAL_AVATAR_URL;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-lg border-l-4 border-calendar-cardinal p-3 text-left transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-calendar-ice hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal ${
        selected
          ? "bg-gray-200 ring-2 ring-calendar-cardinal/60 shadow-md"
          : "bg-white"
      }`}
      aria-pressed={selected}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900">
          {goal.title}
        </p>
        <p className="mt-0.5 text-xs text-gray-500">
          Data Limite: {formatGoalDueDate(goal.dueDate)}
        </p>
      </div>
      <Image
        src={avatarUrl}
        alt={goal.assigneeName ? `Responsável: ${goal.assigneeName}` : "Responsável"}
        width={40}
        height={40}
        className="h-10 w-10 shrink-0 rounded-full object-cover"
      />
    </button>
  );
}
