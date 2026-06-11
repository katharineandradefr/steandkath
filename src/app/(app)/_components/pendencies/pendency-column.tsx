"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import {
  PENDENCY_STATUS_LABELS,
  type Pendency,
  type PendencyStatus,
} from "~/shared/pendency";

import { PendencyCard } from "./pendency-card";

const STATUS_TINTS: Record<
  PendencyStatus,
  { section: string; header: string; counter: string }
> = {
  pending: {
    section: "pendency-col pendency-col--pending border-red-300 bg-red-100",
    header: "pendency-col-header border-red-300",
    counter: "pendency-col-counter bg-red-200 text-red-900",
  },
  in_review: {
    section: "pendency-col pendency-col--review border-amber-300 bg-amber-100",
    header: "pendency-col-header border-amber-300",
    counter: "pendency-col-counter bg-amber-200 text-amber-900",
  },
  fixed: {
    section: "pendency-col pendency-col--fixed border-emerald-300 bg-emerald-100",
    header: "pendency-col-header border-emerald-300",
    counter: "pendency-col-counter bg-emerald-200 text-emerald-900",
  },
  finished: {
    section: "pendency-col pendency-col--finished border-gray-300 bg-gray-100",
    header: "pendency-col-header border-gray-300",
    counter: "pendency-col-counter bg-gray-200 text-gray-800",
  },
};

type PendencyColumnProps = {
  status: PendencyStatus;
  label?: string;
  pendencies: Pendency[];
  userNameById?: Record<string, string>;
  onOpen?: (pendency: Pendency) => void;
  onDelete?: (id: string) => void;
};

/**
 * Coluna Kanban para um status de pendência.
 */
export function PendencyColumn({
  status,
  label,
  pendencies,
  userNameById = {},
  onOpen,
  onDelete,
}: PendencyColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: "column", status },
  });

  const itemIds = pendencies.map((p) => p.id);
  const tint = STATUS_TINTS[status];
  const columnLabel = label ?? PENDENCY_STATUS_LABELS[status];

  return (
    <section
      className={`flex h-full min-h-0 w-[min(100%,280px)] shrink-0 flex-col rounded-2xl border shadow-sm ${tint.section}`}
      aria-label={columnLabel}
    >
      <header
        className={`flex items-center justify-between gap-2 border-b px-3 py-3 ${tint.header}`}
      >
        <h2 className="text-sm font-semibold text-calendar-bordeaux">
          {columnLabel}
        </h2>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium tabular-nums ${tint.counter}`}
        >
          {pendencies.length}
        </span>
      </header>

      <div
        ref={setNodeRef}
        className={
          isOver
            ? "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain p-2 ring-2 ring-inset ring-calendar-cardinal/40"
            : "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain p-2"
        }
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {pendencies.map((p) => (
            <PendencyCard
              key={p.id}
              pendency={p}
              solverName={
                p.solverId ? userNameById[p.solverId] ?? null : null
              }
              onOpen={onOpen}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>

        {pendencies.length === 0 ? (
          <p className="py-4 text-center text-xs text-gray-400">
            Nenhuma pendência
          </p>
        ) : null}
      </div>
    </section>
  );
}
