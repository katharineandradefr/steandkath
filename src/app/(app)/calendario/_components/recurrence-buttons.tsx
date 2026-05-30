import {
  PENDENCY_RECURRENCE_LABELS,
  PENDENCY_RECURRENCES,
  type PendencyRecurrence,
} from "~/shared/pendency";

type RecurrenceButtonsProps = {
  value: PendencyRecurrence;
  onChange: (recurrence: PendencyRecurrence) => void;
};

/**
 * Botões de recorrência: Semanal, Mensal, N/A.
 */
export function RecurrenceButtons({ value, onChange }: RecurrenceButtonsProps) {
  return (
    <div className="flex gap-2">
      {PENDENCY_RECURRENCES.map((recurrence) => {
        const isActive = value === recurrence;
        return (
          <button
            key={recurrence}
            type="button"
            onClick={() => onChange(recurrence)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal ${
              isActive
                ? "bg-calendar-bordeaux text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            aria-pressed={isActive}
          >
            {PENDENCY_RECURRENCE_LABELS[recurrence]}
          </button>
        );
      })}
    </div>
  );
}
