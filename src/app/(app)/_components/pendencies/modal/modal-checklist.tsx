"use client";

import { useMemo, useState } from "react";

import type { ChecklistItem } from "~/shared/pendency";

type ModalChecklistProps = {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
};

/**
 * Checklist com progresso, strikethrough e ocultar concluídos.
 */
export function ModalChecklist({ items, onChange }: ModalChecklistProps) {
  const [newText, setNewText] = useState("");
  const [hideChecked, setHideChecked] = useState(false);

  const { done, total, percent } = useMemo(() => {
    const total = items.length;
    const done = items.filter((i) => i.checked).length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    return { done, total, percent };
  }, [items]);

  const visible = hideChecked ? items.filter((i) => !i.checked) : items;

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    const text = newText.trim();
    if (!text) return;
    onChange([
      ...items,
      { id: crypto.randomUUID(), text, checked: false },
    ]);
    setNewText("");
  };

  const toggle = (id: string) => {
    onChange(
      items.map((i) =>
        i.id === id ? { ...i, checked: !i.checked } : i,
      ),
    );
  };

  const remove = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
  };

  return (
    <section className="border-t border-sidebar-border pt-5 pb-2">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CheckIcon />
          <h3 className="text-sm font-semibold text-white">Checklist</h3>
        </div>
        {total > 0 ? (
          <button
            type="button"
            onClick={() => setHideChecked((v) => !v)}
            className="text-xs text-white/50 underline-offset-2 hover:text-white hover:underline"
          >
            {hideChecked ? "Mostrar itens marcados" : "Ocultar itens marcados"}
          </button>
        ) : null}
      </div>

      {total > 0 ? (
        <div className="mb-4">
          <div className="mb-1 flex justify-between text-xs text-white/50">
            <span>{percent}%</span>
            <span>
              {done}/{total}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      ) : null}

      <ul className="space-y-1">
        {visible.map((item) => (
          <li
            key={item.id}
            className="group flex items-start gap-2 rounded-md py-1"
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => toggle(item.id)}
              className="mt-1 h-4 w-4 shrink-0 rounded border-white/30 bg-transparent accent-emerald-500"
            />
            <span
              className={
                item.checked
                  ? "min-w-0 flex-1 text-sm text-white/45 line-through"
                  : "min-w-0 flex-1 text-sm text-white/90"
              }
            >
              {item.text}
            </span>
            <button
              type="button"
              onClick={() => remove(item.id)}
              className="shrink-0 rounded p-0.5 text-white/30 opacity-0 transition group-hover:opacity-100 hover:text-white"
              aria-label="Remover item"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={addItem} className="mt-3 flex gap-2">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Adicionar um item…"
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-shell/50 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-brand/40 focus:outline-none"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15"
        >
          +
        </button>
      </form>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-white/50"
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
