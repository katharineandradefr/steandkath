import { goalOverlapsRange, parseGoalDate, type Goal } from "~/shared/goal";
import type { PendencyProjectKey } from "~/shared/pendency";

export type CalendarCell = {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
};

export type GoalBarSegment = {
  goalId: string;
  projectKey: PendencyProjectKey;
  lane: number;
  isStart: boolean;
  isEnd: boolean;
};

const MS_PER_DAY = 86_400_000;
const GOAL_BAR_LANE_STEP_PX = 8;

/**
 * Retorna a duração da meta em dias (inclusivo).
 */
function getGoalDurationDays(goal: Goal): number {
  const start = parseGoalDate(goal.startDate);
  const end = parseGoalDate(goal.dueDate);
  return Math.round((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;
}

/**
 * Verifica se duas metas se sobrepõem em pelo menos um dia.
 */
function goalsOverlap(a: Goal, b: Goal): boolean {
  const bStart = parseGoalDate(b.startDate);
  const bEnd = parseGoalDate(b.dueDate);
  return goalOverlapsRange(a, bStart, bEnd);
}

/**
 * Atribui faixa fixa por meta no mês: metas mais longas embaixo, novas/curtas por cima.
 */
export function assignGoalLanes(goals: Goal[]): Map<string, number> {
  const sorted = [...goals].sort((a, b) => {
    const durationDiff = getGoalDurationDays(b) - getGoalDurationDays(a);
    if (durationDiff !== 0) return durationDiff;
    return (
      parseGoalDate(a.startDate).getTime() - parseGoalDate(b.startDate).getTime()
    );
  });

  const lanes = new Map<string, number>();
  const goalsByLane = new Map<number, Goal[]>();

  for (const goal of sorted) {
    let lane = 0;
    while (true) {
      const occupants = goalsByLane.get(lane) ?? [];
      const overlaps = occupants.some((other) => goalsOverlap(goal, other));
      if (!overlaps) break;
      lane += 1;
    }

    lanes.set(goal.id, lane);
    const next = goalsByLane.get(lane) ?? [];
    next.push(goal);
    goalsByLane.set(lane, next);
  }

  return lanes;
}

/** Altura em px da base de cada faixa de barra (barra + gap). */
export function getGoalBarLaneBottomPx(lane: number): number {
  return 8 + lane * GOAL_BAR_LANE_STEP_PX;
}

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Quin", "Sex", "Sab"] as const;

const MONTH_LABELS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

/**
 * Retorna rótulos dos dias da semana em português.
 */
export function getWeekdayLabels(): readonly string[] {
  return WEEKDAY_LABELS;
}

/**
 * Formata mês e ano para exibição (ex.: "Maio 2026").
 */
export function formatMonthYear(year: number, month: number): string {
  return `${MONTH_LABELS[month - 1]} ${year}`;
}

/**
 * Verifica se o dia é fim de semana (domingo=0, sábado=6).
 */
export function isWeekendDay(dayIndex: number): boolean {
  return dayIndex === 0 || dayIndex === 6;
}

/**
 * Verifica se duas datas UTC representam o mesmo dia.
 */
export function isSameUtcDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

/**
 * Normaliza data para meia-noite UTC.
 */
function toUtcDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Retorna meia-noite UTC do dia atual (fuso local do cliente).
 */
export function getUtcTodayStart(): Date {
  const today = new Date();
  return toUtcDate(today.getFullYear(), today.getMonth() + 1, today.getDate());
}

/**
 * Gera grade de células para o mês informado (5 ou 6 semanas conforme necessário).
 */
export function buildCalendarGrid(year: number, month: number): CalendarCell[] {
  const firstOfMonth = toUtcDate(year, month, 1);
  const startOffset = firstOfMonth.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const today = new Date();
  const todayUtc = toUtcDate(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate(),
  );

  const cells: CalendarCell[] = [];

  for (let i = 0; i < totalCells; i++) {
    const dayNumber = i - startOffset + 1;
    const isCurrentMonth = dayNumber >= 1 && dayNumber <= daysInMonth;

    let date: Date;
    if (isCurrentMonth) {
      date = toUtcDate(year, month, dayNumber);
    } else if (dayNumber < 1) {
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      const daysInPrevMonth = new Date(Date.UTC(prevYear, prevMonth, 0)).getUTCDate();
      date = toUtcDate(prevYear, prevMonth, daysInPrevMonth + dayNumber);
    } else {
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      date = toUtcDate(nextYear, nextMonth, dayNumber - daysInMonth);
    }

    cells.push({
      date,
      day: date.getUTCDate(),
      isCurrentMonth,
      isToday: isSameUtcDay(date, todayUtc),
    });
  }

  return cells;
}

/**
 * Calcula segmentos de barra de cronograma para uma célula do calendário.
 */
export function getGoalBarSegmentsForCell(
  cellDate: Date,
  goals: Goal[],
  lanes: Map<string, number>,
): GoalBarSegment[] {
  const segments: GoalBarSegment[] = [];

  for (const goal of goals) {
    if (!goalOverlapsRange(goal, cellDate, cellDate)) continue;

    const start = parseGoalDate(goal.startDate);
    const end = parseGoalDate(goal.dueDate);

    segments.push({
      goalId: goal.id,
      projectKey: goal.projectKey,
      lane: lanes.get(goal.id) ?? 0,
      isStart: isSameUtcDay(cellDate, start),
      isEnd: isSameUtcDay(cellDate, end),
    });
  }

  return segments.sort((a, b) => a.lane - b.lane);
}

/**
 * Retorna ano/mês anterior.
 */
export function getPreviousMonth(year: number, month: number): {
  year: number;
  month: number;
} {
  if (month === 1) return { year: year - 1, month: 12 };
  return { year, month: month - 1 };
}

/**
 * Retorna ano/mês seguinte.
 */
export function getNextMonth(year: number, month: number): {
  year: number;
  month: number;
} {
  if (month === 12) return { year: year + 1, month: 1 };
  return { year, month: month + 1 };
}

/**
 * Desloca um ano/mês por N meses (delta negativo = passado).
 */
export function addMonths(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
  };
}
