"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  getPendencyCardExcerpt,
  PENDENCY_PROJECT_LABELS,
  PENDENCY_PROJECT_STYLES,
  PENDENCY_URGENCY_LABELS,
  PENDENCY_URGENCY_STYLES,
  type Pendency,
} from "~/shared/pendency";

type PendencyCardProps = {
  pendency: Pendency;
  solverName?: string | null;
  onOpen?: (pendency: Pendency) => void;
  onDelete?: (id: string) => void;
};

/**
 * Cartão arrastável de uma pendência.
 */
export function PendencyCard({
  pendency,
  solverName,
  onOpen,
  onDelete,
}: PendencyCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: pendency.id,
    data: { type: "pendency", status: pendency.status },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const urgencyStyle = PENDENCY_URGENCY_STYLES[pendency.urgency];
  const excerpt = getPendencyCardExcerpt(pendency);
  const projectStyle = PENDENCY_PROJECT_STYLES[pendency.projectKey];

  const handleOpen = () => {
    if (!isDragging) onOpen?.(pendency);
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      onClick={handleOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleOpen();
        }
      }}
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      className={
        isDragging
          ? "relative z-10 cursor-grabbing rounded-lg border border-brand/50 bg-white/95 p-3 opacity-90 shadow-lg ring-2 ring-brand/30"
          : "group relative cursor-pointer rounded-lg border border-white/10 bg-white/95 p-3 shadow-sm transition hover:border-brand/25 hover:shadow-md"
      }
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-0.5 shrink-0 cursor-grab touch-none rounded p-0.5 text-zinc-400 hover:text-zinc-600 active:cursor-grabbing"
          aria-label="Arrastar cartão"
          onClick={(e) => e.stopPropagation()}
          {...attributes}
          {...listeners}
        >
          <GripIcon />
        </button>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium leading-snug text-zinc-900">
            {pendency.title}
          </h3>
          {excerpt ? (
            <p className="mt-1 line-clamp-2 text-xs text-zinc-600">{excerpt}</p>
          ) : null}
          {solverName ? (
            <p className="mt-1.5 text-xs text-zinc-500">
              <span className="font-medium text-zinc-700">Solucionador:</span>{" "}
              {solverName}
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span
              className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${projectStyle.badgeOnLight}`}
            >
              {PENDENCY_PROJECT_LABELS[pendency.projectKey]}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${urgencyStyle.badgeOnLight}`}
            >
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${urgencyStyle.dotOnLight}`}
                aria-hidden
              />
              {PENDENCY_URGENCY_LABELS[pendency.urgency]}
            </span>
          </div>
        </div>
      </div>

      {onDelete ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(pendency.id);
          }}
          className="absolute top-2 right-2 rounded p-1 text-zinc-400 opacity-0 transition group-hover:opacity-100 hover:bg-zinc-100 hover:text-zinc-700 focus:opacity-100 focus:outline-none"
          aria-label={`Remover ${pendency.title}`}
        >
          <span aria-hidden>×</span>
        </button>
      ) : null}
    </article>
  );
}

function GripIcon() {
  return (
    <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor" aria-hidden>
      <circle cx="3" cy="3" r="1.5" />
      <circle cx="9" cy="3" r="1.5" />
      <circle cx="3" cy="8" r="1.5" />
      <circle cx="9" cy="8" r="1.5" />
      <circle cx="3" cy="13" r="1.5" />
      <circle cx="9" cy="13" r="1.5" />
    </svg>
  );
}
