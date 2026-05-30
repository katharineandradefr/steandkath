import {
  PENDENCY_AUDIENCE_LABELS,
  PENDENCY_AUDIENCES,
  type PendencyAudience,
} from "~/shared/pendency";

type AudienceToggleProps = {
  value: PendencyAudience | null;
  onChange: (audience: PendencyAudience) => void;
};

/**
 * Toggle Design / Equipe Médica.
 */
export function AudienceToggle({ value, onChange }: AudienceToggleProps) {
  return (
    <div className="flex gap-2">
      {PENDENCY_AUDIENCES.map((audience) => {
        const isActive = value === audience;
        return (
          <button
            key={audience}
            type="button"
            onClick={() => onChange(audience)}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal ${
              isActive
                ? "bg-calendar-cardinal text-white"
                : "bg-calendar-bordeaux text-white/90 hover:bg-calendar-bordeaux/90"
            }`}
            aria-pressed={isActive}
          >
            {PENDENCY_AUDIENCE_LABELS[audience]}
          </button>
        );
      })}
    </div>
  );
}
