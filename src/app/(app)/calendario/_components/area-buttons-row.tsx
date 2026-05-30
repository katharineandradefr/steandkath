import {
  PENDENCY_AREA_BUTTON_STYLES,
  PENDENCY_AREA_KEYS,
  PENDENCY_AREA_LABELS,
  type PendencyAreaKey,
} from "~/shared/pendency";

type AreaButtonsRowProps = {
  value: PendencyAreaKey | null;
  disabledAreas?: PendencyAreaKey[];
  onChange: (area: PendencyAreaKey) => void;
};

/**
 * Botões de seleção de grande área médica (GO, PED, PREV, CIR, CM).
 */
export function AreaButtonsRow({
  value,
  disabledAreas = [],
  onChange,
}: AreaButtonsRowProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {PENDENCY_AREA_KEYS.map((key) => {
        const isDisabled = disabledAreas.includes(key);
        const isSelected = value === key;

        return (
          <button
            key={key}
            type="button"
            disabled={isDisabled}
            onClick={() => onChange(key)}
            className={`min-w-[3rem] rounded-full px-4 py-1.5 text-sm font-semibold transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal ${
              isDisabled
                ? "cursor-not-allowed bg-gray-300 text-gray-500 opacity-60"
                : isSelected
                  ? `${PENDENCY_AREA_BUTTON_STYLES[key]} ring-2 ring-offset-2 ring-gray-400`
                  : `${PENDENCY_AREA_BUTTON_STYLES[key]} opacity-80 hover:opacity-100`
            }`}
            aria-pressed={isSelected}
          >
            {PENDENCY_AREA_LABELS[key]}
          </button>
        );
      })}
    </div>
  );
}
