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

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  DEFAULT_AREA_KEY,
  filterPendenciesByAreas,
  filterPendenciesByProjects,
  filterPendenciesBySearch,
  filterPendenciesByUrgencies,
  groupPendenciesByStatus,
  stripHtmlToPlainText,
  type Pendency,
  type PendencyAreaKey,
  type PendencyFormValues,
  type PendencyProjectKey,
  type PendencyUrgency,
} from "~/shared/pendency";
import { usePermissions } from "~/app/_components/active-user-provider";
import { usePendencyNavigation } from "~/app/_components/pendency-navigation-provider";
import {
  getVisiblePendencyStatuses,
  pendencyActionToPermissionKey,
} from "~/shared/permissions";
import { api } from "~/trpc/react";

import { PendencyDetailModal } from "./modal/pendency-detail-modal";
import { applyDragEnd, resolveTargetStatus } from "./pendency-board-utils";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isNavigating, completeNavigation } = usePendencyNavigation();
  const openedFromUrlRef = useRef<string | null>(null);
  const utils = api.useUtils();
  const [urgencyFilters, setUrgencyFilters] = useState<PendencyUrgency[]>([]);
  const [areaFilters, setAreaFilters] = useState<PendencyAreaKey[]>([]);
  const [projectFilters, setProjectFilters] = useState<PendencyProjectKey[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingPendency, setEditingPendency] = useState<Pendency | null>(null);
  const { can, role } = usePermissions();

  const canEdit = can("pendency.edit");
  const canDelete = can("pendency.delete");
  const visibleStatuses = useMemo(
    () => getVisiblePendencyStatuses(role),
    [role],
  );

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
        directResponsibleId: input.directResponsibleId ?? null,
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
            directResponsibleId:
              patch.directResponsibleId !== undefined
                ? patch.directResponsibleId
                : p.directResponsibleId,
            updatedAt: new Date().toISOString(),
          };
        }),
      );
      return { previous };
    },
    onSuccess: (saved, { id }) => {
      setListCache((prev) => prev.map((p) => (p.id === id ? saved : p)));
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
    let list = filterPendenciesByUrgencies(pendencies, urgencyFilters);
    list = filterPendenciesByAreas(list, areaFilters);
    list = filterPendenciesByProjects(list, projectFilters);
    list = filterPendenciesBySearch(list, searchQuery);
    return list;
  }, [pendencies, urgencyFilters, areaFilters, projectFilters, searchQuery]);

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

  const pendenciaFromUrl = searchParams.get("pendencia");

  useEffect(() => {
    if (!pendenciaFromUrl || isLoading || pendencies.length === 0) return;
    if (openedFromUrlRef.current === pendenciaFromUrl) return;

    const pendency = pendencies.find((item) => item.id === pendenciaFromUrl);
    if (!pendency) return;

    openedFromUrlRef.current = pendenciaFromUrl;
    setModalMode("edit");
    setEditingPendency(pendency);
    setModalOpen(true);
    router.replace("/", { scroll: false });
  }, [pendenciaFromUrl, isLoading, pendencies, router]);

  useEffect(() => {
    if (!isNavigating || !modalOpen || !openedFromUrlRef.current) return;
    completeNavigation();
  }, [isNavigating, modalOpen, completeNavigation]);

  useEffect(() => {
    if (!isNavigating || isLoading || !pendenciaFromUrl) return;
    if (pendencies.length === 0) return;

    const pendency = pendencies.find((item) => item.id === pendenciaFromUrl);
    if (!pendency && openedFromUrlRef.current !== pendenciaFromUrl) {
      completeNavigation();
    }
  }, [
    completeNavigation,
    isLoading,
    isNavigating,
    pendenciaFromUrl,
    pendencies,
  ]);

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
      directResponsibleId: values.directResponsibleId ?? null,
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

    const activeId = String(active.id);
    const overId = String(over.id);
    const activePendency = pendencies.find((p) => p.id === activeId);
    if (!activePendency) return;

    const targetStatus = resolveTargetStatus(pendencies, overId);
    if (!targetStatus) return;

    if (!visibleStatuses.includes(targetStatus)) {
      return;
    }

    if (targetStatus !== activePendency.status) {
      const key = pendencyActionToPermissionKey("set_status", targetStatus);
      if (!can(key)) {
        window.alert("Você não tem permissão para mover para esta coluna.");
        return;
      }
    } else if (!canEdit) {
      window.alert("Você não tem permissão para reordenar pendências.");
      return;
    }

    const next = applyDragEnd(pendencies, activeId, overId);
    setListCache(() => next);
    reorderMutation.mutate({ moves: buildReorderMoves(next) });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Remover esta pendência?")) return;
    deleteMutation.mutate({ id });
  };

  if (isLoading) {
    return (
      <div className="-m-4 flex h-full min-h-0 flex-1 flex-col sm:-m-6 md:-m-8">
        <div className="flex flex-1 items-center justify-center rounded-3xl bg-gray-100 text-calendar-muted">
          Carregando pendências…
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="-m-4 flex h-full min-h-0 flex-1 flex-col sm:-m-6 md:-m-8">
        <div className="flex flex-1 items-center justify-center rounded-3xl bg-gray-100 text-red-700">
          Não foi possível carregar as pendências.
        </div>
      </div>
    );
  }

  return (
    <div className="-m-4 flex h-full min-h-0 flex-1 flex-col sm:-m-6 md:-m-8">
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-calendar-bordeaux p-3 sm:p-4">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-gray-100 p-4 shadow-sm sm:p-6">
        <PendencyBoardHeader
          urgencyFilters={urgencyFilters}
          onUrgencyFiltersChange={setUrgencyFilters}
          areaFilters={areaFilters}
          onAreaFiltersChange={setAreaFilters}
          projectFilters={projectFilters}
          onProjectFiltersChange={setProjectFilters}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCreateClick={openCreate}
        />

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex min-h-0 flex-1 gap-4 overflow-x-auto overflow-y-hidden">
            {visibleStatuses.map((status) => (
              <PendencyColumn
                key={status}
                status={status}
                pendencies={grouped[status]}
                onOpen={openEdit}
                onDelete={canDelete ? handleDelete : undefined}
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
          readOnly={modalMode === "edit" && !canEdit}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          isSaving={isSaving}
        />
      </div>
    </div>
    </div>
  );
}
