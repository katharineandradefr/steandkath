"use client";

import {
  PENDENCY_PROJECT_KEYS,
  PENDENCY_PROJECT_LABELS,
  PENDENCY_PROJECT_STYLES,
  PENDENCY_URGENCIES,
  PENDENCY_URGENCY_LABELS,
  PENDENCY_URGENCY_STYLES,
  type PendencyProjectKey,
  type PendencyUrgency,
} from "~/shared/pendency";

type ModalTagsRowProps = {
  projectKey: PendencyProjectKey;
  urgency: PendencyUrgency;
  onProjectChange: (key: PendencyProjectKey) => void;
  onUrgencyChange: (urgency: PendencyUrgency) => void;
};

/**
 * Tags de projeto e urgência no topo do modal.
 */
export function ModalTagsRow({
  projectKey,
  urgency,
  onProjectChange,
  onUrgencyChange,
}: ModalTagsRowProps) {
  return (
    <div className="flex flex-col gap-3">
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
