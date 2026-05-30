"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

type DropdownOption = {
  value: string;
  label: string;
};

type DropdownProps = {
  label: string;
  value: string | null;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
};

/**
 * Dropdown de seleção única com painel flutuante customizado.
 */
export function Dropdown({
  label,
  value,
  options,
  onChange,
  placeholder = "Selecione…",
}: DropdownProps) {
  const labelId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? placeholder;

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
        <span className={value ? "text-gray-900" : "text-gray-500"}>
          {selectedLabel}
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
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl bg-gray-200 py-2 shadow-lg"
        >
          <ul>
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === option.value}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-300 focus-visible:bg-gray-300 focus-visible:outline-none ${
                    value === option.value
                      ? "font-medium text-gray-900"
                      : "text-gray-700"
                  }`}
                >
                  {option.label}
                </button>
              </li>
            ))}
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
