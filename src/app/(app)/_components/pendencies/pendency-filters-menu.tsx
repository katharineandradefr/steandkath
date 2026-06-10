"use client";

import {
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  PENDENCY_AREA_KEYS,
  PENDENCY_AREA_LABELS,
  PENDENCY_PROJECT_KEYS,
  PENDENCY_PROJECT_LABELS,
  PENDENCY_URGENCY_LABELS,
  PENDENCY_URGENCIES,
  type PendencyAreaKey,
  type PendencyProjectKey,
  type PendencyUrgency,
} from "~/shared/pendency";

type FilterCategory = "urgency" | "project" | "area";

type Props = {
  urgencyFilters: PendencyUrgency[];
  onUrgencyFiltersChange: (v: PendencyUrgency[]) => void;
  areaFilters: PendencyAreaKey[];
  onAreaFiltersChange: (v: PendencyAreaKey[]) => void;
  projectFilters: PendencyProjectKey[];
  onProjectFiltersChange: (v: PendencyProjectKey[]) => void;
};

const CATEGORY_LABELS: Record<FilterCategory, string> = {
  urgency: "Urgência",
  project: "Projeto",
  area: "Grande área",
};

const PANEL_SLIDE_MS = 280;

/**
 * Botão "Filtros" com badge e dropdown em dois níveis (categorias → opções).
 */
export function PendencyFiltersMenu({
  urgencyFilters,
  onUrgencyFiltersChange,
  areaFilters,
  onAreaFiltersChange,
  projectFilters,
  onProjectFiltersChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const slideTimerRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<FilterCategory | null>(
    null,
  );
  const [displayedCategory, setDisplayedCategory] =
    useState<FilterCategory | null>(null);

  const totalActive =
    urgencyFilters.length + areaFilters.length + projectFilters.length;

  const clearSlideTimer = () => {
    if (slideTimerRef.current !== null) {
      window.clearTimeout(slideTimerRef.current);
      slideTimerRef.current = null;
    }
  };

  const closeMenu = useCallback(() => {
    clearSlideTimer();
    setOpen(false);
    setActiveCategory(null);
    setDisplayedCategory(null);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [closeMenu, open]);

  useEffect(() => () => clearSlideTimer(), []);

  const clearAll = () => {
    onUrgencyFiltersChange([]);
    onAreaFiltersChange([]);
    onProjectFiltersChange([]);
  };

  const getCategoryCount = (category: FilterCategory) => {
    if (category === "urgency") return urgencyFilters.length;
    if (category === "project") return projectFilters.length;
    return areaFilters.length;
  };

  const openCategory = (category: FilterCategory) => {
    clearSlideTimer();
    setActiveCategory(category);
    setDisplayedCategory(category);
  };

  const goBackToCategories = () => {
    clearSlideTimer();
    setActiveCategory(null);
    slideTimerRef.current = window.setTimeout(() => {
      setDisplayedCategory(null);
      slideTimerRef.current = null;
    }, PANEL_SLIDE_MS);
  };

  const toggleUrgency = (value: PendencyUrgency) => {
    onUrgencyFiltersChange(
      urgencyFilters.includes(value)
        ? urgencyFilters.filter((u) => u !== value)
        : [...urgencyFilters, value],
    );
  };

  const toggleProject = (value: PendencyProjectKey) => {
    onProjectFiltersChange(
      projectFilters.includes(value)
        ? projectFilters.filter((p) => p !== value)
        : [...projectFilters, value],
    );
  };

  const toggleArea = (value: PendencyAreaKey) => {
    onAreaFiltersChange(
      areaFilters.includes(value)
        ? areaFilters.filter((a) => a !== value)
        : [...areaFilters, value],
    );
  };

  const isSubpanel = activeCategory !== null;

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-2 rounded-full bg-gray-200 px-4 py-2 text-sm font-medium text-calendar-bordeaux transition-colors hover:bg-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
        <span>Filtros</span>
        {totalActive > 0 && (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-calendar-cardinal px-1.5 text-xs font-semibold text-white">
            {totalActive}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="pendency-filters-dropdown absolute top-full right-0 z-20 mt-2 w-64 overflow-hidden rounded-2xl py-2 shadow-lg"
        >
          <div className="overflow-hidden">
            <div
              className={`pendency-filters-panels flex w-[200%] ${
                isSubpanel
                  ? "pendency-filters-panels--subpanel"
                  : "pendency-filters-panels--root"
              }`}
            >
              <div className="w-1/2 shrink-0">
                <div className="border-b border-gray-100 px-2 pb-2">
                  <button
                    type="button"
                    role="menuitem"
                    disabled={totalActive === 0}
                    onClick={clearAll}
                    className="pendency-filters-item w-full rounded-lg px-3 py-2 text-left text-sm text-calendar-bordeaux transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Limpar tudo
                  </button>
                </div>
                <ul>
                  {(["urgency", "project", "area"] as const).map((category) => {
                    const count = getCategoryCount(category);
                    return (
                      <li key={category}>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => openCategory(category)}
                          className="pendency-filters-item flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 focus-visible:outline-none"
                        >
                          <span>{CATEGORY_LABELS[category]}</span>
                          <span className="flex items-center gap-1 text-gray-500">
                            {count > 0 && (
                              <span className="text-xs font-medium text-calendar-cardinal">
                                {count}
                              </span>
                            )}
                            <ChevronRight className="h-4 w-4" aria-hidden />
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="w-1/2 shrink-0">
                {displayedCategory && (
                  <>
                    <button
                      type="button"
                      onClick={goBackToCategories}
                      className="pendency-filters-item flex w-full items-center gap-1 border-b border-gray-100 px-4 py-2.5 text-left text-sm font-medium text-calendar-bordeaux transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 focus-visible:outline-none"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden />
                      {CATEGORY_LABELS[displayedCategory]}
                    </button>
                    <ul className="max-h-64 overflow-y-auto py-1">
                      {displayedCategory === "urgency" &&
                        PENDENCY_URGENCIES.map((value) => (
                          <FilterOption
                            key={value}
                            label={PENDENCY_URGENCY_LABELS[value]}
                            checked={urgencyFilters.includes(value)}
                            onToggle={() => toggleUrgency(value)}
                          />
                        ))}
                      {displayedCategory === "project" &&
                        PENDENCY_PROJECT_KEYS.map((value) => (
                          <FilterOption
                            key={value}
                            label={PENDENCY_PROJECT_LABELS[value]}
                            checked={projectFilters.includes(value)}
                            onToggle={() => toggleProject(value)}
                          />
                        ))}
                      {displayedCategory === "area" &&
                        PENDENCY_AREA_KEYS.map((value) => (
                          <FilterOption
                            key={value}
                            label={PENDENCY_AREA_LABELS[value]}
                            checked={areaFilters.includes(value)}
                            onToggle={() => toggleArea(value)}
                          />
                        ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterOption({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={onToggle}
        className="pendency-filters-item flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 focus-visible:outline-none"
      >
        <span
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
            checked
              ? "border-calendar-cardinal bg-calendar-cardinal text-white"
              : "border-gray-400 bg-white"
          }`}
          aria-hidden
        >
          {checked ? "✓" : ""}
        </span>
        <span>{label}</span>
      </button>
    </li>
  );
}
