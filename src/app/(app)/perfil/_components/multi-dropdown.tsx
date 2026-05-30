"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

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
  const [open, setOpen] = useState(false);

  const buttonLabel = useMemo(() => {
    if (values.length === 0) return placeholder;
    if (values.length === 1) {
      return (
        options.find((option) => option.value === values[0])?.label ??
        placeholder
      );
    }
    return `${values.length} selecionados`;
  }, [options, placeholder, values]);

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

  const toggleValue = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((current) => current !== value));
      return;
    }
    onChange([...values, value]);
  };

  return (
    <div ref={containerRef} className="relative">
      <label
        id={labelId}
        className="mb-1.5 block text-sm font-medium text-calendar-bordeaux"
      >
        {label}
      </label>
      <button
        type="button"
        aria-labelledby={labelId}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-full bg-gray-200 px-4 py-2.5 text-left text-sm text-gray-800 transition-colors hover:bg-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal"
      >
        <span className={values.length > 0 ? "text-gray-900" : "text-gray-500"}>
          {buttonLabel}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-600 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>

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
