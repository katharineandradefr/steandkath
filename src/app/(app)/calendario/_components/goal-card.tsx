import Image from "next/image";

import {
  DEFAULT_GOAL_AVATAR_URL,
  formatGoalDueDate,
  getGoalProgress,
  GOAL_STATUS_LABELS,
  type Goal,
  type GoalStatus,
} from "~/shared/goal";

const STATUS_DOT_COLOR: Record<GoalStatus, string> = {
  pending: "#ef4444",
  in_progress: "#eab308",
  completed: "#22c55e",
  postponed: "#f97316",
  cancelled: "#9ca3af",
};

/**
 * Cor gradual do anel: 0% vermelho -> 50% amarelo -> 100% verde.
 */
function progressColor(percent: number): string {
  const hue = Math.round((percent / 100) * 120);
  return `hsl(${hue}, 75%, 45%)`;
}

type GoalCardProps = {
  goal: Goal;
  selected?: boolean;
  onSelect?: () => void;
};

/**
 * Indicador visual da situação da meta (progresso ou status).
 */
function GoalSituationIndicator({ goal }: { goal: Goal }) {
  const progress = getGoalProgress(goal);

  if (!progress.hasProgress) {
    const label = GOAL_STATUS_LABELS[goal.status];
    return (
      <span
        className="flex w-10 shrink-0 items-center justify-center"
        role="img"
        aria-label={`Situação: ${label}`}
      >
        <span
          className="h-3.5 w-3.5 rounded-full"
          style={{ backgroundColor: STATUS_DOT_COLOR[goal.status] }}
        />
      </span>
    );
  }

  const size = 40;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress.percent / 100);

  return (
    <span
      className="relative flex h-10 w-10 shrink-0 items-center justify-center"
      role="img"
      aria-label={`Progresso: ${progress.percent}%`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={progressColor(progress.percent)}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute text-[10px] font-semibold text-gray-700">
        {progress.percent}%
      </span>
    </span>
  );
}

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
      <GoalSituationIndicator goal={goal} />
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
