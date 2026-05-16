"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

import { useMemo, useState } from "react";

import { MOCK_PENDENCIES } from "~/app/(app)/_data/mock-pendencies";
import {
  createEmptyPendencyDraft,
  filterPendenciesBySearch,
  filterPendenciesByUrgency,
  groupPendenciesByStatus,
  PENDENCY_STATUSES,
  type Pendency,
  type PendencyUrgency,
} from "~/shared/pendency";

import { PendencyDetailModal } from "./modal/pendency-detail-modal";
import { applyDragEnd } from "./pendency-board-utils";
import { PendencyBoardHeader } from "./pendency-board-header";
import { PendencyCard } from "./pendency-card";
import { PendencyColumn } from "./pendency-column";

/**
 * Board Kanban de pendências com estado local, modal e drag-and-drop.
 */
export function PendencyBoard() {
  const [pendencies, setPendencies] = useState<Pendency[]>(() => [
    ...MOCK_PENDENCIES,
  ]);
  const [urgencyFilter, setUrgencyFilter] = useState<PendencyUrgency | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingPendency, setEditingPendency] = useState<Pendency | null>(
    null,
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const filtered = useMemo(() => {
    let list = filterPendenciesByUrgency(pendencies, urgencyFilter);
    list = filterPendenciesBySearch(list, searchQuery);
    return list;
  }, [pendencies, urgencyFilter, searchQuery]);

  const grouped = useMemo(
    () => groupPendenciesByStatus(filtered),
    [filtered],
  );

  const activePendency = activeDragId
    ? pendencies.find((p) => p.id === activeDragId)
    : null;

  const openCreate = () => {
    setModalMode("create");
    setEditingPendency(null);
    setModalOpen(true);
  };

  const openEdit = (pendency: Pendency) => {
    setModalMode("edit");
    setEditingPendency(pendency);
    setModalOpen(true);
  };

  const handleSave = (saved: Pendency) => {
    if (modalMode === "create") {
      const pending = pendencies.filter((p) => p.status === "pending");
      setPendencies((prev) => [
        ...prev,
        {
          ...saved,
          status: "pending",
          position: pending.length,
        },
      ]);
    } else {
      setPendencies((prev) =>
        prev.map((p) => (p.id === saved.id ? saved : p)),
      );
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over) return;

    setPendencies((prev) =>
      applyDragEnd(prev, String(active.id), String(over.id)),
    );
  };

  const handleDelete = (id: string) => {
    setPendencies((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PendencyBoardHeader
        urgencyFilter={urgencyFilter}
        onUrgencyFilterChange={setUrgencyFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateClick={openCreate}
      />

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex min-h-0 flex-1 gap-4 overflow-x-auto pb-4">
          {PENDENCY_STATUSES.map((status) => (
            <PendencyColumn
              key={status}
              status={status}
              pendencies={grouped[status]}
              onOpen={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activePendency ? (
            <div className="w-[260px] rotate-2 opacity-95">
              <PendencyCard pendency={activePendency} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <PendencyDetailModal
        open={modalOpen}
        mode={modalMode}
        initialValues={
          modalMode === "edit" ? editingPendency : createEmptyPendencyDraft()
        }
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
