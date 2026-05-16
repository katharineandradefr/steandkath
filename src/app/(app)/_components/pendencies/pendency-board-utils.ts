import { arrayMove } from "@dnd-kit/sortable";

import {
  PENDENCY_STATUSES,
  type Pendency,
  type PendencyStatus,
} from "~/shared/pendency";

/**
 * Reordena posições dentro de cada coluna (0, 1, 2…).
 */
export function normalizePositions(pendencies: Pendency[]): Pendency[] {
  const result = pendencies.map((p) => ({ ...p }));

  for (const status of PENDENCY_STATUSES) {
    const inColumn = result
      .filter((p) => p.status === status)
      .sort((a, b) => a.position - b.position);

    inColumn.forEach((p, index) => {
      const idx = result.findIndex((r) => r.id === p.id);
      if (idx !== -1) result[idx] = { ...result[idx]!, position: index };
    });
  }

  return result;
}

/**
 * Resolve o status alvo a partir do id do elemento `over` (coluna ou cartão).
 */
export function resolveTargetStatus(
  pendencies: Pendency[],
  overId: string,
): PendencyStatus | null {
  if (PENDENCY_STATUSES.includes(overId as PendencyStatus)) {
    return overId as PendencyStatus;
  }
  const overPendency = pendencies.find((p) => p.id === overId);
  return overPendency?.status ?? null;
}

/**
 * Move ou reordena uma pendência após drag-and-drop.
 */
export function applyDragEnd(
  pendencies: Pendency[],
  activeId: string,
  overId: string,
): Pendency[] {
  if (activeId === overId) return pendencies;

  const active = pendencies.find((p) => p.id === activeId);
  if (!active) return pendencies;

  const targetStatus = resolveTargetStatus(pendencies, overId);
  if (!targetStatus) return pendencies;

  const isColumnDrop = PENDENCY_STATUSES.includes(overId as PendencyStatus);

  if (!isColumnDrop && active.status === targetStatus) {
    const columnIds = pendencies
      .filter((p) => p.status === active.status)
      .sort((a, b) => a.position - b.position)
      .map((p) => p.id);

    const oldIndex = columnIds.indexOf(activeId);
    const newIndex = columnIds.indexOf(overId);
    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      const reorderedIds = arrayMove(columnIds, oldIndex, newIndex);
      const others = pendencies.filter((p) => p.status !== active.status);
      const reordered = reorderedIds.map((id, position) => {
        const p = pendencies.find((x) => x.id === id)!;
        return {
          ...p,
          position,
          updatedAt: new Date().toISOString(),
        };
      });
      return normalizePositions([...others, ...reordered]);
    }
  }

  const withoutActive = pendencies.filter((p) => p.id !== activeId);
  let targetColumn = withoutActive
    .filter((p) => p.status === targetStatus)
    .sort((a, b) => a.position - b.position);

  let insertIndex = targetColumn.length;
  if (!isColumnDrop) {
    const overIndex = targetColumn.findIndex((p) => p.id === overId);
    if (overIndex >= 0) insertIndex = overIndex;
  }

  const moved: Pendency = {
    ...active,
    status: targetStatus,
    updatedAt: new Date().toISOString(),
  };

  targetColumn = [
    ...targetColumn.slice(0, insertIndex),
    moved,
    ...targetColumn.slice(insertIndex),
  ].map((p, position) => ({ ...p, position }));

  const others = withoutActive.filter((p) => p.status !== targetStatus);
  return normalizePositions([...others, ...targetColumn]);
}
