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

import {
  DEFAULT_AREA_KEY,
  filterPendenciesBySearch,
  filterPendenciesByUrgency,
  groupPendenciesByStatus,
  PENDENCY_STATUSES,
  stripHtmlToPlainText,
  type Pendency,
  type PendencyFormValues,
  type PendencyUrgency,
} from "~/shared/pendency";
import { api } from "~/trpc/react";

import { PendencyDetailModal } from "./modal/pendency-detail-modal";
import { applyDragEnd } from "./pendency-board-utils";
import { PendencyBoardHeader } from "./pendency-board-header";
import { PendencyCard } from "./pendency-card";
import { PendencyColumn } from "./pendency-column";

/**
 * Monta o payload de reorder a partir da lista atualizada.
 */
function buildReorderMoves(pendencies: Pendency[]) {
  return pendencies.map((p) => ({
    id: p.id,
    status: p.status,
    position: p.position,
  }));
}

/**
 * Board Kanban de pendências com persistência MongoDB via tRPC.
 */
export function PendencyBoard() {
  const utils = api.useUtils();
  const [urgencyFilter, setUrgencyFilter] = useState<PendencyUrgency | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingPendency, setEditingPendency] = useState<Pendency | null>(null);

  const listInput = {};
  const { data: pendencies = [], isLoading, isError } =
    api.pendency.list.useQuery(listInput);

  const setListCache = (updater: (prev: Pendency[]) => Pendency[]) => {
    utils.pendency.list.setData(listInput, (prev) =>
      updater(prev ?? []),
    );
  };

  const createMutation = api.pendency.create.useMutation({
    onMutate: async (input) => {
      await utils.pendency.list.cancel(listInput);
      const previous = utils.pendency.list.getData(listInput) ?? [];
      const now = new Date().toISOString();
      const optimistic: Pendency = {
        id: crypto.randomUUID(),
        areaKey: input.areaKey ?? DEFAULT_AREA_KEY,
        title: input.title,
        description: null,
        descriptionMarkdown: input.descriptionMarkdown ?? "",
        projectKey: input.projectKey,
        status: "pending",
        urgency: input.urgency,
        position: previous.filter((p) => p.status === "pending").length,
        attachments: [],
        links: input.links ?? [],
        checklist: input.checklist ?? [],
        createdAt: now,
        updatedAt: now,
      };
      setListCache((prev) => [...prev, optimistic]);
      return { previous, optimisticId: optimistic.id };
    },
    onSuccess: (saved, _input, context) => {
      setListCache((prev) =>
        prev.map((p) => (p.id === context?.optimisticId ? saved : p)),
      );
    },
    onError: (_err, _input, context) => {
      utils.pendency.list.setData(listInput, context?.previous);
    },
    onSettled: () => {
      void utils.pendency.list.invalidate(listInput);
    },
  });

  const updateMutation = api.pendency.update.useMutation({
    onMutate: async ({ id, patch }) => {
      await utils.pendency.list.cancel(listInput);
      const previous = utils.pendency.list.getData(listInput) ?? [];
      setListCache((prev) =>
        prev.map((p): Pendency => {
          if (p.id !== id) return p;
          const descriptionMarkdown =
            patch.descriptionMarkdown ?? p.descriptionMarkdown;
          const plain = stripHtmlToPlainText(descriptionMarkdown);
          const excerpt = plain.split("\n")[0]?.trim() ?? "";
          return {
            ...p,
            title: patch.title ?? p.title,
            areaKey: patch.areaKey ?? p.areaKey,
            descriptionMarkdown,
            description: excerpt.length > 0 ? excerpt : null,
            projectKey: patch.projectKey ?? p.projectKey,
            urgency: patch.urgency ?? p.urgency,
            links: patch.links ?? p.links,
            checklist: patch.checklist ?? p.checklist,
            updatedAt: new Date().toISOString(),
          };
        }),
      );
      return { previous };
    },
    onError: (_err, _input, context) => {
      utils.pendency.list.setData(listInput, context?.previous);
    },
    onSettled: () => {
      void utils.pendency.list.invalidate(listInput);
    },
  });

  const deleteMutation = api.pendency.delete.useMutation({
    onMutate: async ({ id }) => {
      await utils.pendency.list.cancel(listInput);
      const previous = utils.pendency.list.getData(listInput) ?? [];
      setListCache((prev) => prev.filter((p) => p.id !== id));
      return { previous };
    },
    onError: (_err, _input, context) => {
      utils.pendency.list.setData(listInput, context?.previous);
    },
    onSettled: () => {
      void utils.pendency.list.invalidate(listInput);
    },
  });

  const reorderMutation = api.pendency.reorder.useMutation({
    onError: () => {
      void utils.pendency.list.invalidate(listInput);
    },
  });

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

  const isSaving = createMutation.isPending || updateMutation.isPending;

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

  const handleSave = (values: PendencyFormValues) => {
    const payload = {
      areaKey: values.areaKey,
      title: values.title,
      descriptionMarkdown: values.descriptionMarkdown,
      projectKey: values.projectKey,
      urgency: values.urgency,
      links: values.links,
      checklist: values.checklist,
      attachments: values.attachments,
    };

    if (modalMode === "create") {
      createMutation.mutate(payload, {
        onSuccess: () => setModalOpen(false),
      });
      return;
    }

    if (!editingPendency) return;

    updateMutation.mutate(
      { id: editingPendency.id, patch: payload },
      { onSuccess: () => setModalOpen(false) },
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over) return;

    const next = applyDragEnd(
      pendencies,
      String(active.id),
      String(over.id),
    );
    setListCache(() => next);
    reorderMutation.mutate({ moves: buildReorderMoves(next) });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Remover esta pendência?")) return;
    deleteMutation.mutate({ id });
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-3xl bg-gray-100 text-calendar-muted">
        Carregando pendências…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-3xl bg-gray-100 text-red-700">
        Não foi possível carregar as pendências.
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col rounded-3xl bg-calendar-bordeaux p-3 sm:p-4">
      <div className="flex min-h-0 flex-1 flex-col rounded-3xl bg-gray-100 p-4 shadow-sm sm:p-6">
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
            modalMode === "edit" ? editingPendency : null
          }
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
}
