"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronDown, X } from "lucide-react";

type MultiDropdownOption = {
  value: string;
  label: string;
};

type MultiDropdownProps = {
  label: string;
  values: string[];
  options: MultiDropdownOption[];
  onChange: (values: string[]) => void;
  placeholder?: string;
};

/**
 * Dropdown de múltipla seleção com checkboxes no painel flutuante.
 */
export function MultiDropdown({
  label,
  values,
  options,
  onChange,
  placeholder = "Selecione…",
}: MultiDropdownProps) {
  const labelId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const badgeRef = useRef<HTMLSpanElement | null>(null);
  const [open, setOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(values.length);

  useEffect(() => {
    if (!open) return;

    const onClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggleValue = useCallback(
    (value: string) => {
      if (values.includes(value)) {
        onChange(values.filter((current) => current !== value));
        return;
      }
      onChange([...values, value]);
    },
    [onChange, values],
  );

  useLayoutEffect(() => {
    const recompute = () => {
      if (values.length === 0) {
        setVisibleCount(0);
        return;
      }

      const measure = measureRef.current;
      if (!measure) return;

      const available = measure.clientWidth;
      const gap = 6;
      const badgeW = badgeRef.current?.offsetWidth ?? 0;

      let used = 0;
      let count = 0;
      for (let i = 0; i < values.length; i++) {
        const el = pillRefs.current[i];
        if (!el) break;

        const w = el.offsetWidth + (i > 0 ? gap : 0);
        const remaining = values.length - i - 1;
        const reserve = remaining > 0 ? badgeW + gap : 0;

        if (used + w + reserve > available) break;

        used += w;
        count += 1;
      }

      setVisibleCount(count);
    };

    recompute();

    const ro = new ResizeObserver(recompute);
    if (buttonRef.current) ro.observe(buttonRef.current);

    return () => ro.disconnect();
  }, [values, options]);

  const renderedTags = useMemo(() => {
    if (values.length === 0) {
      return <span className="text-gray-500">{placeholder}</span>;
    }

    const hidden = values.length - visibleCount;

    return (
      <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-1.5 overflow-hidden">
        {values.slice(0, visibleCount).map((value) => {
          const optionLabel =
            options.find((option) => option.value === value)?.label ?? value;
          return (
            <span
              key={value}
              className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-calendar-cardinal/10 px-2.5 py-0.5 text-xs font-medium text-calendar-bordeaux"
            >
              {optionLabel}
              <button
                type="button"
                aria-label={`Remover ${optionLabel}`}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleValue(value);
                }}
                className="rounded-full p-0.5 text-calendar-bordeaux/70 transition-colors hover:bg-calendar-cardinal/20 hover:text-calendar-bordeaux focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-calendar-cardinal"
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            </span>
          );
        })}
        {hidden > 0 && (
          <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full bg-gray-300 px-2.5 py-0.5 text-xs font-medium text-gray-700">
            +{hidden}
          </span>
        )}
      </div>
    );
  }, [options, placeholder, toggleValue, values, visibleCount]);

  pillRefs.current.length = values.length;

  return (
    <div ref={containerRef} className="relative">
      <label
        id={labelId}
        className="mb-1.5 block text-sm font-medium text-calendar-bordeaux"
      >
        {label}
      </label>
      <div
        ref={buttonRef}
        role="combobox"
        tabIndex={0}
        aria-labelledby={labelId}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen((current) => !current);
          }
        }}
        className="relative flex min-h-[2.75rem] w-full cursor-pointer items-center justify-between gap-2 rounded-full bg-gray-200 px-3 py-1.5 text-left text-sm text-gray-800 transition-colors hover:bg-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal"
      >
        {values.length > 0 && (
          <div
            ref={measureRef}
            aria-hidden
            className="pointer-events-none invisible absolute inset-y-0 right-10 left-3 flex items-center gap-1.5 overflow-hidden"
          >
            {values.map((value, index) => {
              const optionLabel =
                options.find((option) => option.value === value)?.label ??
                value;
              return (
                <span
                  key={value}
                  ref={(element) => {
                    pillRefs.current[index] = element;
                  }}
                  className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-calendar-cardinal/10 px-2.5 py-0.5 text-xs font-medium text-calendar-bordeaux"
                >
                  {optionLabel}
                  <span className="rounded-full p-0.5">
                    <X className="h-3 w-3" aria-hidden />
                  </span>
                </span>
              );
            })}
            <span
              ref={badgeRef}
              className="inline-flex items-center whitespace-nowrap rounded-full bg-gray-300 px-2.5 py-0.5 text-xs font-medium text-gray-700"
            >
              +{values.length}
            </span>
          </div>
        )}
        {renderedTags}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-600 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </div>

      {open && (
        <div
          role="listbox"
          aria-labelledby={labelId}
          aria-multiselectable="true"
          className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl bg-gray-200 py-2 shadow-lg"
        >
          <ul>
            {options.map((option) => {
              const checked = values.includes(option.value);
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={checked}
                    onClick={() => toggleValue(option.value)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-300 focus-visible:bg-gray-300 focus-visible:outline-none"
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
                    <span>{option.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div
            className="pointer-events-none absolute right-3 bottom-2 text-gray-500"
            aria-hidden
          >
            ▲
          </div>
        </div>
      )}
    </div>
  );
}
