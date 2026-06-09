"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  addMonths,
  assignGoalLanes,
  buildCalendarGrid,
  formatMonthYear,
  getGoalBarLaneBottomPx,
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
import { PENDENCY_PROJECT_BAR_HEX } from "~/shared/pendency";
import { api } from "~/trpc/react";

const INITIAL_OFFSETS = [-2, -1, 0, 1, 2] as const;
const MONTHS_PER_BATCH = 3;
const MAX_MONTH_WINDOW = 18;

type MonthCalendarProps = {
  selectedDay: Date | null;
  onSelectDay: (date: Date) => void;
  onActivateDay: (date: Date) => void;
};

type MonthBlockProps = {
  year: number;
  month: number;
  selectedDay: Date | null;
  onSelectDay: (date: Date) => void;
  onActivateDay: (date: Date) => void;
};

/**
 * Bloco de um mês: busca metas e renderiza a grade (5 ou 6 semanas).
 */
const MonthBlock = forwardRef<HTMLDivElement, MonthBlockProps>(
  function MonthBlock({ year, month, selectedDay, onSelectDay, onActivateDay }, ref) {
    const cells = buildCalendarGrid(year, month);
    const weeks = cells.length / 7;
    const { data: goals = [] } = api.goal.listByMonth.useQuery({ year, month });
    const lanes = useMemo(() => assignGoalLanes(goals), [goals]);
    const [startOfTodayUtc, setStartOfTodayUtc] = useState<number | null>(null);

    useEffect(() => {
      setStartOfTodayUtc(getUtcTodayStart().getTime());
    }, []);

    return (
      <div
        ref={ref}
        data-year={year}
        data-month={month}
        className="h-full snap-start"
      >
        <div
          className="grid h-full grid-cols-7"
          style={{
            gridTemplateRows: `repeat(${weeks}, minmax(0, 1fr))`,
          }}
        >
          {cells.map((cell) => {
            const segments = getGoalBarSegmentsForCell(cell.date, goals, lanes);
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
                  onDoubleClick={() => onActivateDay(cell.date)}
                  aria-pressed={isSelected}
                  aria-label={`Selecionar dia ${dayLabel}`}
                  className={`calendar-day-cell relative min-h-0 w-full border border-gray-200 text-left transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-calendar-cardinal ${
                    isSelected
                      ? "calendar-day-selected bg-red-200"
                      : isPast
                        ? "bg-gray-50"
                        : "bg-white"
                  } ${cell.isToday ? "calendar-day-today" : ""}`}
                >
                  {cellContent}
                </button>
              );
            }

            return (
              <div
                key={cell.date.toISOString()}
                className={`calendar-day-cell relative min-h-0 border border-gray-200 bg-calendar-muted/30 ${
                  cell.isToday ? "calendar-day-today" : ""
                }`}
              >
                {cellContent}
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);

/**
 * Calendário com scroll vertical contínuo de meses empilhados.
 */
export function MonthCalendar({
  selectedDay,
  onSelectDay,
  onActivateDay,
}: MonthCalendarProps) {
  const today = useMemo(() => getUtcTodayStart(), []);
  const baseYear = today.getUTCFullYear();
  const baseMonth = today.getUTCMonth() + 1;

  const [monthOffsets, setMonthOffsets] = useState<number[]>([
    ...INITIAL_OFFSETS,
  ]);
  const [activeYear, setActiveYear] = useState(baseYear);
  const [activeMonth, setActiveMonth] = useState(baseMonth);

  const scrollRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);
  const monthBlockRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const prependHeightRef = useRef(0);
  const isPrependingRef = useRef(false);
  const hasInitialScrollRef = useRef(false);
  const pendingScrollOffsetRef = useRef<number | null>(null);

  const weekdayLabels = getWeekdayLabels();

  const setMonthBlockRef = useCallback(
    (offset: number, element: HTMLDivElement | null) => {
      if (element) {
        monthBlockRefs.current.set(offset, element);
      } else {
        monthBlockRefs.current.delete(offset);
      }
    },
    [],
  );

  const scrollToOffset = useCallback(
    (offset: number, behavior: ScrollBehavior = "smooth") => {
      const container = scrollRef.current;
      const block = monthBlockRefs.current.get(offset);
      if (!container || !block) return;
      container.scrollTo({ top: block.offsetTop, behavior });
    },
    [],
  );

  const ensureOffsetInWindow = useCallback((targetOffset: number) => {
    setMonthOffsets((current) => {
      if (current.includes(targetOffset)) return current;
      const min = Math.min(...current);
      const max = Math.max(...current);
      if (targetOffset < min) {
        const next = [...current];
        for (let o = min - 1; o >= targetOffset; o -= 1) {
          next.unshift(o);
        }
        return next;
      }
      const next = [...current];
      for (let o = max + 1; o <= targetOffset; o += 1) {
        next.push(o);
      }
      return next;
    });
  }, []);

  const trimWindow = useCallback((offsets: number[], addedAt: "start" | "end") => {
    if (offsets.length <= MAX_MONTH_WINDOW) return offsets;
    const excess = offsets.length - MAX_MONTH_WINDOW;
    if (addedAt === "start") {
      return offsets.slice(0, MAX_MONTH_WINDOW);
    }
    return offsets.slice(excess);
  }, []);

  const appendMonths = useCallback(() => {
    setMonthOffsets((current) => {
      const max = Math.max(...current);
      const next = [...current];
      for (let i = 1; i <= MONTHS_PER_BATCH; i += 1) {
        next.push(max + i);
      }
      return trimWindow(next, "end");
    });
  }, [trimWindow]);

  const prependMonths = useCallback(() => {
    setMonthOffsets((current) => {
      const min = Math.min(...current);
      const container = scrollRef.current;
      prependHeightRef.current = container?.scrollHeight ?? 0;
      isPrependingRef.current = true;

      const next = [...current];
      for (let i = 1; i <= MONTHS_PER_BATCH; i += 1) {
        next.unshift(min - i);
      }
      return trimWindow(next, "start");
    });
  }, [trimWindow]);

  const updateActiveMonth = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const anchorY = containerRect.top + 8;

    let bestOffset: number | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const offset of monthOffsets) {
      const block = monthBlockRefs.current.get(offset);
      if (!block) continue;
      const rect = block.getBoundingClientRect();
      if (rect.bottom <= anchorY) continue;
      const distance = Math.abs(rect.top - anchorY);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestOffset = offset;
      }
    }

    if (bestOffset === null) return;
    const { year, month } = addMonths(baseYear, baseMonth, bestOffset);
    setActiveYear(year);
    setActiveMonth(month);
  }, [baseYear, baseMonth, monthOffsets]);

  useLayoutEffect(() => {
    if (!isPrependingRef.current) return;
    const container = scrollRef.current;
    if (!container) return;

    const addedHeight = container.scrollHeight - prependHeightRef.current;
    if (addedHeight > 0) {
      container.scrollTop += addedHeight;
    }
    isPrependingRef.current = false;
  }, [monthOffsets]);

  useLayoutEffect(() => {
    if (pendingScrollOffsetRef.current === null) return;
    scrollToOffset(pendingScrollOffsetRef.current);
    pendingScrollOffsetRef.current = null;
  }, [monthOffsets, scrollToOffset]);

  useLayoutEffect(() => {
    if (hasInitialScrollRef.current) return;
    const container = scrollRef.current;
    const todayBlock = monthBlockRefs.current.get(0);
    if (!container || !todayBlock) return;

    container.scrollTop = todayBlock.offsetTop;
    hasInitialScrollRef.current = true;
    updateActiveMonth();
  }, [monthOffsets, updateActiveMonth]);

  useEffect(() => {
    const container = scrollRef.current;
    const topSentinel = topSentinelRef.current;
    const bottomSentinel = bottomSentinelRef.current;
    if (!container || !topSentinel || !bottomSentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (entry.target === topSentinel) prependMonths();
          if (entry.target === bottomSentinel) appendMonths();
        }
      },
      { root: container, rootMargin: "120px", threshold: 0 },
    );

    observer.observe(topSentinel);
    observer.observe(bottomSentinel);
    return () => observer.disconnect();
  }, [appendMonths, prependMonths]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateActiveMonth);
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      container.removeEventListener("scroll", onScroll);
    };
  }, [updateActiveMonth]);

  const scrollToYearMonth = (year: number, month: number) => {
    const targetOffset = (year - baseYear) * 12 + (month - baseMonth);
    if (monthOffsets.includes(targetOffset)) {
      scrollToOffset(targetOffset);
      return;
    }
    pendingScrollOffsetRef.current = targetOffset;
    ensureOffsetInWindow(targetOffset);
  };

  const handlePrev = () => {
    const prev = getPreviousMonth(activeYear, activeMonth);
    scrollToYearMonth(prev.year, prev.month);
  };

  const handleNext = () => {
    const next = getNextMonth(activeYear, activeMonth);
    scrollToYearMonth(next.year, next.month);
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border-4 border-calendar-cardinal bg-white">
      <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3">
        <button
          type="button"
          onClick={handlePrev}
          className="rounded-lg p-1.5 text-calendar-bordeaux transition-colors hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <h2 className="text-lg font-semibold text-calendar-bordeaux">
          {formatMonthYear(activeYear, activeMonth)}
        </h2>
        <button
          type="button"
          onClick={handleNext}
          className="rounded-lg p-1.5 text-calendar-bordeaux transition-colors hover:bg-gray-100 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal"
          aria-label="Próximo mês"
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <div className="grid shrink-0 grid-cols-7 border-b border-gray-200">
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

      <div
        ref={scrollRef}
        className="no-scrollbar min-h-0 flex-1 snap-y snap-proximity overflow-y-auto overscroll-y-contain"
      >
        <div ref={topSentinelRef} className="h-px" aria-hidden />

        {monthOffsets.map((offset) => {
          const { year, month } = addMonths(baseYear, baseMonth, offset);
          return (
            <MonthBlock
              key={offset}
              ref={(element) => setMonthBlockRef(offset, element)}
              year={year}
              month={month}
              selectedDay={selectedDay}
              onSelectDay={onSelectDay}
              onActivateDay={onActivateDay}
            />
          );
        })}

        <div ref={bottomSentinelRef} className="h-px" aria-hidden />
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

      {segments.map((segment) => (
        <div
          key={`${cell.date.toISOString()}-${segment.goalId}`}
          className={`absolute right-0 left-0 h-1.5 px-0.5 ${
            segment.isStart && segment.isEnd
              ? "mx-1 rounded-full"
              : segment.isStart
                ? "ml-1 rounded-l-full"
                : segment.isEnd
                  ? "mr-1 rounded-r-full"
                  : ""
          }`}
          style={{
            bottom: `${getGoalBarLaneBottomPx(segment.lane)}px`,
            backgroundColor: PENDENCY_PROJECT_BAR_HEX[segment.projectKey],
          }}
        />
      ))}
    </>
  );
}
