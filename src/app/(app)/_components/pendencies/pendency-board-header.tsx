"use client";

import {
  DEFAULT_AREA_TITLE,
  PENDENCY_URGENCY_LABELS,
  PENDENCY_URGENCIES,
  type PendencyUrgency,
} from "~/shared/pendency";

type PendencyBoardHeaderProps = {
  urgencyFilter: PendencyUrgency | null;
  onUrgencyFilterChange: (urgency: PendencyUrgency | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateClick: () => void;
};

/**
 * Cabeçalho do board: título da área fixa, busca, filtros e criar pendência.
 */
export function PendencyBoardHeader({
  urgencyFilter,
  onUrgencyFilterChange,
  searchQuery,
  onSearchChange,
  onCreateClick,
}: PendencyBoardHeaderProps) {
  return (
    <header className="mb-6 shrink-0">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-wider text-calendar-bordeaux/70 uppercase">
            Grande área
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-calendar-bordeaux sm:text-3xl">
            {DEFAULT_AREA_TITLE}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-calendar-muted">
            Protótipo visual — clique num cartão para editar ou use Criar
            Pendência. Alterações não persistem ao atualizar a página.
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateClick}
          className="shrink-0 rounded-lg bg-calendar-cardinal px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-calendar-bordeaux focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal"
        >
          Criar Pendência
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
        <label className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <span className="sr-only">Buscar pendência</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por título…"
            className="w-full rounded-full bg-gray-200 px-4 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-calendar-bordeaux/70">Urgência:</span>
          <FilterChip
            active={urgencyFilter === null}
            onClick={() => onUrgencyFilterChange(null)}
          >
            Todas
          </FilterChip>
          {PENDENCY_URGENCIES.map((u) => (
            <FilterChip
              key={u}
              active={urgencyFilter === u}
              onClick={() => onUrgencyFilterChange(u)}
            >
              {PENDENCY_URGENCY_LABELS[u]}
            </FilterChip>
          ))}
        </div>
      </div>
    </header>
  );
}

function FilterChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full bg-calendar-cardinal px-3 py-1 text-xs font-medium text-white"
          : "rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-calendar-bordeaux transition-colors hover:bg-gray-300"
      }
    >
      {children}
    </button>
  );
}
