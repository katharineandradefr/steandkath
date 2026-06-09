"use client";

import {
  isPendencyAreaKey,
  PENDENCY_AREA_BUTTON_STYLES,
  PENDENCY_AREA_KEYS,
  PENDENCY_AREA_LABELS,
  PENDENCY_PROJECT_KEYS,
  PENDENCY_PROJECT_LABELS,
  PENDENCY_PROJECT_STYLES,
  PENDENCY_URGENCIES,
  PENDENCY_URGENCY_LABELS,
  PENDENCY_URGENCY_STYLES,
  projectRequiresArea,
  type PendencyAreaKey,
  type PendencyProjectKey,
  type PendencyUrgency,
} from "~/shared/pendency";

type ModalTagsRowProps = {
  areaKey: string;
  projectKey: PendencyProjectKey;
  urgency: PendencyUrgency;
  onAreaChange: (key: PendencyAreaKey | null) => void;
  onProjectChange: (key: PendencyProjectKey) => void;
  onUrgencyChange: (urgency: PendencyUrgency) => void;
};

/**
 * Tags de Grande área, projeto e urgência no topo do modal.
 */
export function ModalTagsRow({
  areaKey,
  projectKey,
  urgency,
  onAreaChange,
  onProjectChange,
  onUrgencyChange,
}: ModalTagsRowProps) {
  const areaRequired = projectRequiresArea(projectKey);
  const selectedArea = isPendencyAreaKey(areaKey) ? areaKey : null;

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="mb-1.5 text-xs font-medium text-white/50">
          Grande área{areaRequired ? " *" : ""}
        </p>
        <div className="flex flex-wrap gap-2">
          {PENDENCY_AREA_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() =>
                onAreaChange(selectedArea === key ? null : key)
              }
              className={
                selectedArea === key
                  ? `rounded-md border px-2.5 py-1 text-xs font-medium ${PENDENCY_AREA_BUTTON_STYLES[key]}`
                  : "rounded-md border border-white/10 px-2.5 py-1 text-xs text-white/55 transition hover:border-white/25 hover:text-white"
              }
            >
              {PENDENCY_AREA_LABELS[key]}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-xs font-medium text-white/50">Projeto</p>
        <div className="flex flex-wrap gap-2">
          {PENDENCY_PROJECT_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onProjectChange(key)}
              className={
                projectKey === key
                  ? `rounded-md border px-2.5 py-1 text-xs font-medium ${PENDENCY_PROJECT_STYLES[key].badgeOnDark}`
                  : "rounded-md border border-white/10 px-2.5 py-1 text-xs text-white/55 transition hover:border-white/25 hover:text-white"
              }
            >
              {PENDENCY_PROJECT_LABELS[key]}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-xs font-medium text-white/50">Urgência</p>
        <div className="flex flex-wrap gap-2">
          {PENDENCY_URGENCIES.map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => onUrgencyChange(u)}
              className={
                urgency === u
                  ? `inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${PENDENCY_URGENCY_STYLES[u].badgeOnDark}`
                  : "rounded-md border border-white/10 px-2.5 py-1 text-xs text-white/55 transition hover:border-white/25 hover:text-white"
              }
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${PENDENCY_URGENCY_STYLES[u].dotOnDark}`}
                aria-hidden
              />
              {PENDENCY_URGENCY_LABELS[u]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
