import { goalOverlapsRange, parseGoalDate, type Goal } from "~/shared/goal";

export type CalendarCell = {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
};

export type GoalBarSegment = {
  goalId: string;
  isStart: boolean;
  isEnd: boolean;
};

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
 * Gera grade de 42 células (6 semanas) para o mês informado.
 */
export function buildCalendarGrid(year: number, month: number): CalendarCell[] {
  const firstOfMonth = toUtcDate(year, month, 1);
  const startOffset = firstOfMonth.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const today = new Date();
  const todayUtc = toUtcDate(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate(),
  );

  const cells: CalendarCell[] = [];

  for (let i = 0; i < 42; i++) {
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
): GoalBarSegment[] {
  const segments: GoalBarSegment[] = [];

  for (const goal of goals) {
    if (!goalOverlapsRange(goal, cellDate, cellDate)) continue;

    const start = parseGoalDate(goal.startDate);
    const end = parseGoalDate(goal.dueDate);
    segments.push({
      goalId: goal.id,
      isStart: isSameUtcDay(cellDate, start),
      isEnd: isSameUtcDay(cellDate, end),
    });
  }

  return segments;
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
