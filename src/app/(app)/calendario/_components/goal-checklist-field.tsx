"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import type { GoalChecklistItem } from "~/shared/goal";

type GoalChecklistFieldProps = {
  items: GoalChecklistItem[];
  readOnly?: boolean;
  /** Permite marcar/desmarcar itens sem editar a lista (modo visualização). */
  toggleOnly?: boolean;
  onChange: (items: GoalChecklistItem[]) => void;
};

export type GoalChecklistFieldHandle = {
  /** Retorna itens atuais, incluindo texto pendente no campo de adição. */
  getItemsForSave: () => GoalChecklistItem[];
};

/**
 * Checklist da meta com barra de progresso (tema claro do modal).
 */
export const GoalChecklistField = forwardRef<
  GoalChecklistFieldHandle,
  GoalChecklistFieldProps
>(function GoalChecklistField(
  { items, readOnly = false, toggleOnly = false, onChange },
  ref,
) {
  const [newText, setNewText] = useState("");
  const itemsRef = useRef(items);
  const canToggle = !readOnly || toggleOnly;
  const canEditStructure = !readOnly && !toggleOnly;

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const emitChange = useCallback(
    (next: GoalChecklistItem[]) => {
      itemsRef.current = next;
      onChange(next);
    },
    [onChange],
  );

  const getItemsForSave = useCallback((): GoalChecklistItem[] => {
    const text = newText.trim();
    if (!text || !canEditStructure) {
      return itemsRef.current;
    }
    return [
      ...itemsRef.current,
      { id: crypto.randomUUID(), text, checked: false },
    ];
  }, [newText, canEditStructure]);

  useImperativeHandle(ref, () => ({ getItemsForSave }), [getItemsForSave]);

  const { done, total, percent } = useMemo(() => {
    const total = items.length;
    const done = items.filter((item) => item.checked).length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    return { done, total, percent };
  }, [items]);

  const addItem = () => {
    const text = newText.trim();
    if (!text || !canEditStructure) return;
    emitChange([
      ...itemsRef.current,
      { id: crypto.randomUUID(), text, checked: false },
    ]);
    setNewText("");
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  };

  const toggle = (id: string) => {
    if (!canToggle) return;
    emitChange(
      itemsRef.current.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    );
  };

  const remove = (id: string) => {
    if (!canEditStructure) return;
    emitChange(itemsRef.current.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-3">
      <div>
        <span className="mb-1 block text-sm font-medium text-gray-700">
          Checklist
        </span>
        <p className="text-xs text-gray-500">
          Adicione etapas da meta. O progresso é calculado pelos itens concluídos.
        </p>
      </div>

      {total > 0 ? (
        <div>
          <div className="mb-1 flex justify-between text-xs text-gray-500">
            <span>{percent}% concluído</span>
            <span>
              {done}/{total}
            </span>
          </div>
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progresso da meta"
          >
            <div
              className="h-full rounded-full bg-calendar-cardinal transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      ) : null}

      <ul className="space-y-1">
        {items.map((item) => (
          <li
            key={item.id}
            className="group flex items-start gap-2 rounded-md py-1"
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => toggle(item.id)}
              disabled={!canToggle}
              className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 accent-calendar-cardinal disabled:opacity-60"
            />
            <span
              className={
                item.checked
                  ? "min-w-0 flex-1 text-sm text-gray-400 line-through"
                  : "min-w-0 flex-1 text-sm text-gray-800"
              }
            >
              {item.text}
            </span>
            {canEditStructure ? (
              <button
                type="button"
                onClick={() => remove(item.id)}
                className="shrink-0 rounded p-0.5 text-gray-400 opacity-0 transition group-hover:opacity-100 hover:text-gray-700"
                aria-label="Remover item"
              >
                ×
              </button>
            ) : null}
          </li>
        ))}
      </ul>

      {canEditStructure ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Adicionar um item…"
            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-calendar-cardinal focus:outline-none focus:ring-1 focus:ring-calendar-cardinal"
            maxLength={500}
          />
          <button
            type="button"
            onClick={addItem}
            className="shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            aria-label="Adicionar item ao checklist"
          >
            +
          </button>
        </div>
      ) : null}
    </div>
  );
});
