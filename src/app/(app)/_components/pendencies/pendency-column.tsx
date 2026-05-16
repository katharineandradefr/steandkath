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

type PendencyColumnProps = {
  status: PendencyStatus;
  pendencies: Pendency[];
  onOpen?: (pendency: Pendency) => void;
  onDelete?: (id: string) => void;
};

/**
 * Coluna Kanban para um status (Pendente, Em revisão, Corrigido).
 */
export function PendencyColumn({
  status,
  pendencies,
  onOpen,
  onDelete,
}: PendencyColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: "column", status },
  });

  const itemIds = pendencies.map((p) => p.id);

  return (
    <section
      className="flex w-[min(100%,280px)] shrink-0 flex-col rounded-xl border border-sidebar-border bg-shell-warm/80"
      aria-label={PENDENCY_STATUS_LABELS[status]}
    >
      <header className="flex items-center justify-between gap-2 border-b border-sidebar-border px-3 py-3">
        <h2 className="text-sm font-semibold text-white">
          {PENDENCY_STATUS_LABELS[status]}
        </h2>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-white/70 tabular-nums">
          {pendencies.length}
        </span>
      </header>

      <div
        ref={setNodeRef}
        className={
          isOver
            ? "flex min-h-[120px] flex-1 flex-col gap-2 overflow-y-auto p-2 ring-2 ring-inset ring-brand/40"
            : "flex min-h-[120px] flex-1 flex-col gap-2 overflow-y-auto p-2"
        }
        style={{ maxHeight: "calc(100vh - 280px)" }}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {pendencies.map((p) => (
            <PendencyCard
              key={p.id}
              pendency={p}
              onOpen={onOpen}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>

        {pendencies.length === 0 ? (
          <p className="py-4 text-center text-xs text-white/40">
            Nenhuma pendência
          </p>
        ) : null}
      </div>
    </section>
  );
}
