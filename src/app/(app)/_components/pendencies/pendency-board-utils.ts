import { arrayMove } from "@dnd-kit/sortable";

import type { PendencyBoardColumn } from "~/shared/permissions";
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
 * Encontra a coluna do board que exibe o status informado.
 */
export function findBoardColumnForStatus(
  columns: PendencyBoardColumn[],
  status: PendencyStatus,
): PendencyBoardColumn | undefined {
  return columns.find((column) => column.sourceStatuses.includes(status));
}

/**
 * Agrupa pendências pelas colunas visíveis do board.
 */
export function groupPendenciesByBoardColumns(
  pendencies: Pendency[],
  columns: PendencyBoardColumn[],
): Record<PendencyStatus, Pendency[]> {
  const grouped = Object.fromEntries(
    columns.map((column) => [column.columnId, [] as Pendency[]]),
  ) as Record<PendencyStatus, Pendency[]>;

  for (const column of columns) {
    grouped[column.columnId] = pendencies
      .filter((p) => column.sourceStatuses.includes(p.status))
      .sort((a, b) => {
        const statusOrder =
          column.sourceStatuses.indexOf(a.status) -
          column.sourceStatuses.indexOf(b.status);
        if (statusOrder !== 0) return statusOrder;
        return a.position - b.position;
      });
  }

  return grouped;
}

export type BoardDropTarget = {
  columnId: PendencyStatus;
  targetStatus: PendencyStatus;
};

/**
 * Resolve coluna e status alvo a partir do card arrastado e do elemento `over`.
 */
export function resolveBoardDropTarget(
  pendencies: Pendency[],
  activeId: string,
  overId: string,
  columns: PendencyBoardColumn[],
): BoardDropTarget | null {
  const active = pendencies.find((p) => p.id === activeId);
  if (!active) return null;

  const activeColumn = findBoardColumnForStatus(columns, active.status);
  const columnById = new Map(columns.map((column) => [column.columnId, column]));

  const directColumn = columnById.get(overId as PendencyStatus);
  if (directColumn) {
    const sameColumn = activeColumn?.columnId === directColumn.columnId;
    return {
      columnId: directColumn.columnId,
      targetStatus: sameColumn
        ? active.status
        : directColumn.dropTargetStatus,
    };
  }

  const overPendency = pendencies.find((p) => p.id === overId);
  if (!overPendency) return null;

  const overColumn = findBoardColumnForStatus(columns, overPendency.status);
  if (!overColumn) return null;

  const sameBoardColumn = activeColumn?.columnId === overColumn.columnId;
  return {
    columnId: overColumn.columnId,
    targetStatus: sameBoardColumn ? active.status : overColumn.dropTargetStatus,
  };
}

/**
 * Move ou reordena uma pendência após drag-and-drop no board por papel.
 */
export function applyBoardDragEnd(
  pendencies: Pendency[],
  activeId: string,
  overId: string,
  columns: PendencyBoardColumn[],
): Pendency[] {
  if (activeId === overId) return pendencies;

  const active = pendencies.find((p) => p.id === activeId);
  if (!active) return pendencies;

  const drop = resolveBoardDropTarget(pendencies, activeId, overId, columns);
  if (!drop) return pendencies;

  const activeColumn = findBoardColumnForStatus(columns, active.status);
  const isColumnDrop = columns.some((column) => column.columnId === overId);
  const sameBoardColumn =
    activeColumn?.columnId === drop.columnId && drop.targetStatus === active.status;

  if (!isColumnDrop && sameBoardColumn && activeColumn) {
    const columnPendencies = pendencies
      .filter((p) => activeColumn.sourceStatuses.includes(p.status))
      .sort((a, b) => {
        const statusOrder =
          activeColumn.sourceStatuses.indexOf(a.status) -
          activeColumn.sourceStatuses.indexOf(b.status);
        if (statusOrder !== 0) return statusOrder;
        return a.position - b.position;
      });

    const columnIds = columnPendencies.map((p) => p.id);
    const oldIndex = columnIds.indexOf(activeId);
    const newIndex = columnIds.indexOf(overId);
    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      const reorderedIds = arrayMove(columnIds, oldIndex, newIndex);
      const reordered = reorderedIds.map((id, position) => {
        const p = pendencies.find((x) => x.id === id);
        if (!p) return null;
        return {
          ...p,
          position,
          updatedAt: new Date().toISOString(),
        };
      });
      const validReordered = reordered.filter(
        (item): item is Pendency => item !== null,
      );
      const others = pendencies.filter(
        (p) => !activeColumn.sourceStatuses.includes(p.status),
      );
      return normalizePositions([...others, ...validReordered]);
    }
  }

  const targetColumn = columns.find((column) => column.columnId === drop.columnId);
  if (!targetColumn) return pendencies;

  const targetStatus =
    activeColumn?.columnId === drop.columnId
      ? active.status
      : targetColumn.dropTargetStatus;

  const withoutActive = pendencies.filter((p) => p.id !== activeId);
  let targetColumnPendencies = withoutActive
    .filter((p) => p.status === targetStatus)
    .sort((a, b) => a.position - b.position);

  let insertIndex = targetColumnPendencies.length;
  if (!isColumnDrop) {
    const overPendency = pendencies.find((p) => p.id === overId);
    if (overPendency?.status === targetStatus) {
      const overIndex = targetColumnPendencies.findIndex((p) => p.id === overId);
      if (overIndex >= 0) insertIndex = overIndex;
    }
  }

  const moved: Pendency = {
    ...active,
    status: targetStatus,
    updatedAt: new Date().toISOString(),
  };

  targetColumnPendencies = [
    ...targetColumnPendencies.slice(0, insertIndex),
    moved,
    ...targetColumnPendencies.slice(insertIndex),
  ].map((p, position) => ({ ...p, position }));

  const others = withoutActive.filter((p) => p.status !== targetStatus);
  return normalizePositions([...others, ...targetColumnPendencies]);
}
