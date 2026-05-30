"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  buildCalendarGrid,
  formatMonthYear,
  getGoalBarSegmentsForCell,
  getNextMonth,
  getPreviousMonth,
  getUtcTodayStart,
  getWeekdayLabels,
  isSameUtcDay,
  isWeekendDay,
  type CalendarCell,
  type GoalBarSegment,
} from "~/app/(app)/calendario/_utils/calendar-grid";
import type { Goal } from "~/shared/goal";

type MonthCalendarProps = {
  year: number;
  month: number;
  goals: Goal[];
  selectedDay: Date | null;
  onSelectDay: (date: Date) => void;
  onMonthChange: (year: number, month: number) => void;
};

/**
 * Calendário mensal com cabeçalho de dias e barras de cronograma.
 */
export function MonthCalendar({
  year,
  month,
  goals,
  selectedDay,
  onSelectDay,
  onMonthChange,
}: MonthCalendarProps) {
  const cells = buildCalendarGrid(year, month);
  const weekdayLabels = getWeekdayLabels();
  const [startOfTodayUtc, setStartOfTodayUtc] = useState<number | null>(null);

  useEffect(() => {
    setStartOfTodayUtc(getUtcTodayStart().getTime());
  }, []);

  const handlePrev = () => {
    const prev = getPreviousMonth(year, month);
    onMonthChange(prev.year, prev.month);
  };

  const handleNext = () => {
    const next = getNextMonth(year, month);
    onMonthChange(next.year, next.month);
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border-4 border-calendar-cardinal bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <button
          type="button"
          onClick={handlePrev}
          className="rounded-lg p-1.5 text-calendar-bordeaux transition-colors hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <h2 className="text-lg font-semibold text-calendar-bordeaux">
          {formatMonthYear(year, month)}
        </h2>
        <button
          type="button"
          onClick={handleNext}
          className="rounded-lg p-1.5 text-calendar-bordeaux transition-colors hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal"
          aria-label="Próximo mês"
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-200">
        {weekdayLabels.map((label, index) => (
          <div
            key={label}
            className={`py-2 text-center text-sm font-semibold text-white ${
              isWeekendDay(index)
                ? "bg-calendar-bordeaux"
                : "bg-calendar-cardinal"
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6">
        {cells.map((cell) => {
          const segments = getGoalBarSegmentsForCell(cell.date, goals);
          const dayLabel = String(cell.day).padStart(2, "0");
          const isPast =
            startOfTodayUtc !== null &&
            !cell.isToday &&
            cell.date.getTime() < startOfTodayUtc;
          const isSelected =
            selectedDay !== null && isSameUtcDay(cell.date, selectedDay);
          const isClickable = cell.isCurrentMonth;

          const cellContent = (
            <CalendarDayCellContent
              cell={cell}
              dayLabel={dayLabel}
              segments={segments}
            />
          );

          if (isClickable) {
            return (
              <button
                key={cell.date.toISOString()}
                type="button"
                onClick={() => onSelectDay(cell.date)}
                aria-pressed={isSelected}
                aria-label={`Selecionar dia ${dayLabel}`}
                className={`relative min-h-[4.5rem] w-full border border-gray-200 text-left transition-colors duration-150 hover:bg-calendar-cardinal/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-calendar-cardinal ${
                  isPast ? "bg-gray-50" : "bg-white"
                } ${
                  isSelected
                    ? "bg-calendar-cardinal/[0.12] hover:bg-calendar-cardinal/[0.12]"
                    : ""
                } ${cell.isToday ? "ring-2 ring-inset ring-calendar-cardinal/50" : ""}`}
              >
                {cellContent}
              </button>
            );
          }

          return (
            <div
              key={cell.date.toISOString()}
              className={`relative min-h-[4.5rem] border border-gray-200 bg-calendar-muted/30 ${
                cell.isToday ? "ring-2 ring-inset ring-calendar-cardinal/50" : ""
              }`}
            >
              {cellContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type CalendarDayCellContentProps = {
  cell: CalendarCell;
  dayLabel: string;
  segments: GoalBarSegment[];
  muted?: boolean;
};

function CalendarDayCellContent({
  cell,
  dayLabel,
  segments,
  muted = false,
}: CalendarDayCellContentProps) {
  return (
    <>
      <span
        className={`absolute top-1.5 left-2 text-sm ${
          muted
            ? "text-calendar-muted"
            : cell.isCurrentMonth
              ? "text-gray-800"
              : "text-calendar-muted"
        }`}
      >
        {dayLabel}
      </span>

      {segments.length > 0 && (
        <div className="absolute right-0 bottom-2 left-0 flex flex-col gap-0.5 px-0.5">
          {segments.map((segment) => (
            <div
              key={`${cell.date.toISOString()}-${segment.goalId}`}
              className={`h-1.5 bg-calendar-cardinal ${
                segment.isStart && segment.isEnd
                  ? "mx-1 rounded-full"
                  : segment.isStart
                    ? "ml-1 rounded-l-full"
                    : segment.isEnd
                      ? "mr-1 rounded-r-full"
                      : ""
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}
