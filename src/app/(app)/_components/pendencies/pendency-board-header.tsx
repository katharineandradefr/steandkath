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
          <p className="text-xs font-medium tracking-wider text-brand-bright/80 uppercase">
            Grande área
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {DEFAULT_AREA_TITLE}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/60">
            Protótipo visual — clique num cartão para editar ou use Criar
            Pendência. Alterações não persistem ao atualizar a página.
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateClick}
          className="shrink-0 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-[0_0_24px_-8px_var(--color-brand)] transition hover:bg-brand-bright"
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
            className="w-full rounded-lg border border-sidebar-border bg-shell/60 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/25"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-white/50">Urgência:</span>
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
          ? "rounded-full border border-brand/40 bg-brand/20 px-3 py-1 text-xs font-medium text-white"
          : "rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/65 transition hover:border-white/20 hover:text-white"
      }
    >
      {children}
    </button>
  );
}
