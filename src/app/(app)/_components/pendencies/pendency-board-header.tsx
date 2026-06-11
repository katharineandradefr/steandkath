"use client";

import { usePermissions } from "~/app/_components/active-user-provider";
import {
  PENDENCY_AREA_FULL_LABELS,
  type PendencyAreaKey,
  type PendencyProjectKey,
  type PendencyUrgency,
} from "~/shared/pendency";

import { PendencyFiltersMenu } from "./pendency-filters-menu";

type PendencyBoardHeaderProps = {
  urgencyFilters: PendencyUrgency[];
  onUrgencyFiltersChange: (urgencies: PendencyUrgency[]) => void;
  areaFilters: PendencyAreaKey[];
  onAreaFiltersChange: (areas: PendencyAreaKey[]) => void;
  projectFilters: PendencyProjectKey[];
  onProjectFiltersChange: (projects: PendencyProjectKey[]) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateClick: () => void;
};

/**
 * Cabeçalho do board: título dinâmico, busca, filtros e criar pendência.
 */
export function PendencyBoardHeader({
  urgencyFilters,
  onUrgencyFiltersChange,
  areaFilters,
  onAreaFiltersChange,
  projectFilters,
  onProjectFiltersChange,
  searchQuery,
  onSearchChange,
  onCreateClick,
}: PendencyBoardHeaderProps) {
  const { can } = usePermissions();
  const canCreate = can("pendency.create");

  const areaTitle =
    areaFilters.length === 1
      ? PENDENCY_AREA_FULL_LABELS[areaFilters[0]!]
      : "Todas as áreas";

  return (
    <header className="mb-6 shrink-0">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-wider text-calendar-bordeaux/70 uppercase">
            Grande área
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-calendar-bordeaux sm:text-3xl">
            {areaTitle}
          </h1>
        </div>
        {canCreate ? (
          <button
            type="button"
            onClick={onCreateClick}
            className="shrink-0 rounded-lg bg-calendar-cardinal px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-calendar-bordeaux focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal"
          >
            Criar Pendência
          </button>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
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

        <PendencyFiltersMenu
          urgencyFilters={urgencyFilters}
          onUrgencyFiltersChange={onUrgencyFiltersChange}
          areaFilters={areaFilters}
          onAreaFiltersChange={onAreaFiltersChange}
          projectFilters={projectFilters}
          onProjectFiltersChange={onProjectFiltersChange}
        />
      </div>
    </header>
  );
}
