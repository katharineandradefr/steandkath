"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { FaqConfirmDialog } from "~/app/(app)/faq/_components/faq-confirm-dialog";
import type { Course } from "~/shared/course";
import { api } from "~/trpc/react";

type Props = {
  courses: Course[];
};

type FormState = {
  name: string;
  bg: string;
} | null;

const COLOR_PRESETS = [
  "#dc2626",
  "#7c3aed",
  "#ea580c",
  "#c084fc",
  "#2563eb",
  "#a855f7",
  "#0d9488",
  "#9f1239",
  "#78716c",
];

/**
 * Gerenciamento de cursos usados nas listas do chat.
 */
export function CoursesPanel({ courses: initialCourses }: Props) {
  const [courses, setCourses] = useState(initialCourses);
  const [form, setForm] = useState<FormState>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const utils = api.useUtils();

  const createMutation = api.course.create.useMutation({
    onSuccess: async (created) => {
      setCourses((current) =>
        [...current, created].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setForm(null);
      setFeedback("Curso adicionado com sucesso.");
      setError(null);
      await utils.course.invalidate();
    },
    onError: () => {
      setError("Não foi possível adicionar o curso.");
      setFeedback(null);
    },
  });

  const updateMutation = api.course.update.useMutation({
    onSuccess: async (updated) => {
      setCourses((current) =>
        current
          .map((course) => (course.id === updated.id ? updated : course))
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
      setForm(null);
      setEditingId(null);
      setFeedback("Curso atualizado com sucesso.");
      setError(null);
      await utils.course.invalidate();
    },
    onError: () => {
      setError("Não foi possível atualizar o curso.");
      setFeedback(null);
    },
  });

  const deleteMutation = api.course.delete.useMutation({
    onSuccess: async (_, variables) => {
      setCourses((current) =>
        current.filter((course) => course.id !== variables.id),
      );
      setDeleteId(null);
      setFeedback("Curso removido.");
      setError(null);
      await utils.course.invalidate();
    },
    onError: () => {
      setError("Não foi possível remover o curso.");
      setFeedback(null);
      setDeleteId(null);
    },
  });

  const setActiveMutation = api.course.setActive.useMutation({
    onSuccess: async (updated) => {
      setCourses((current) =>
        current.map((course) => (course.id === updated.id ? updated : course)),
      );
      setFeedback(
        updated.active ? "Curso ativado." : "Curso desativado.",
      );
      setError(null);
      await utils.course.invalidate();
    },
    onError: () => {
      setError("Não foi possível alterar o status do curso.");
      setFeedback(null);
    },
  });

  const openCreateForm = () => {
    setEditingId(null);
    setForm({ name: "", bg: COLOR_PRESETS[0] ?? "#dc2626" });
  };

  const openEditForm = (course: Course) => {
    setEditingId(course.id);
    setForm({ name: course.name, bg: course.bg });
  };

  const handleSave = () => {
    if (!form || form.name.trim().length === 0) return;

    const payload = {
      name: form.name.trim(),
      bg: form.bg,
      users: editingId
        ? (courses.find((course) => course.id === editingId)?.users ?? [])
        : [],
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload });
      return;
    }

    createMutation.mutate(payload);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-calendar-bordeaux">Cursos</h2>
          <p className="text-sm text-calendar-muted">
            Gerencie os cursos exibidos nas listas do chat.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 self-start rounded-2xl bg-gray-200 px-4 py-2 text-sm font-medium text-calendar-bordeaux transition-colors hover:bg-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal"
        >
          <Plus className="h-4 w-4" />
          Novo curso
        </button>
      </div>

      {feedback && (
        <p role="status" className="text-sm text-emerald-700">
          {feedback}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {form && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-calendar-bordeaux">
            {editingId ? "Editar curso" : "Novo curso"}
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="course-name"
                className="mb-1.5 block text-sm font-medium text-calendar-bordeaux"
              >
                Nome do curso
              </label>
              <input
                id="course-name"
                type="text"
                value={form.name}
                onChange={(event) =>
                  setForm((current) =>
                    current ? { ...current, name: event.target.value } : current,
                  )
                }
                className="w-full rounded-full bg-gray-200 px-4 py-2.5 text-sm text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal"
              />
            </div>
            <div>
              <label
                htmlFor="course-color"
                className="mb-1.5 block text-sm font-medium text-calendar-bordeaux"
              >
                Cor
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Cor ${color}`}
                    onClick={() =>
                      setForm((current) =>
                        current ? { ...current, bg: color } : current,
                      )
                    }
                    className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-105 ${
                      form.bg === color
                        ? "border-calendar-cardinal"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <input
                  id="course-color"
                  type="text"
                  value={form.bg}
                  onChange={(event) =>
                    setForm((current) =>
                      current ? { ...current, bg: event.target.value } : current,
                    )
                  }
                  className="w-28 rounded-full bg-gray-200 px-3 py-2 text-sm text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal"
                />
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setForm(null);
                setEditingId(null);
              }}
              className="rounded-2xl bg-gray-200 px-4 py-2 text-sm font-medium text-calendar-bordeaux hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || form.name.trim().length === 0}
              className="rounded-2xl bg-calendar-cardinal px-4 py-2 text-sm font-medium text-white hover:brightness-95 disabled:opacity-50"
            >
              {isSaving ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-calendar-bordeaux">
                Curso
              </th>
              <th className="px-4 py-3 text-left font-semibold text-calendar-bordeaux">
                Status
              </th>
              <th className="px-4 py-3 text-right font-semibold text-calendar-bordeaux">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-6 text-center text-calendar-muted"
                >
                  Nenhum curso cadastrado.
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr
                  key={course.id}
                  className={`border-b border-gray-100 hover:bg-gray-50/60 ${
                    !course.active ? "opacity-60" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-block h-4 w-4 rounded-full"
                        style={{ backgroundColor: course.bg }}
                      />
                      <span className="font-medium text-gray-900">
                        {course.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveMutation.mutate({
                          id: course.id,
                          active: !course.active,
                        })
                      }
                      disabled={setActiveMutation.isPending}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                        course.active
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {course.active ? "Ativo" : "Inativo"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(course)}
                        className="rounded-full p-2 text-calendar-muted transition-colors hover:bg-gray-100 hover:text-calendar-bordeaux"
                        aria-label={`Editar ${course.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(course.id)}
                        className="rounded-full p-2 text-calendar-muted transition-colors hover:bg-red-50 hover:text-red-600"
                        aria-label={`Remover ${course.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {deleteId && (
        <FaqConfirmDialog
          message="Tem certeza que deseja remover este curso?"
          onCancel={() => setDeleteId(null)}
          onConfirm={() => deleteMutation.mutate({ id: deleteId })}
        />
      )}
    </div>
  );
}
