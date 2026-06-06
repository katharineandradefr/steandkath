"use client";

import { useState } from "react";
import { Trash2, X } from "lucide-react";

import { api } from "~/trpc/react";

type Props = {
  onClose: () => void;
};

/**
 * Modal para ensinar novos conhecimentos ao Dr. Cof.
 * Lista os textos salvos e permite adicionar ou excluir.
 */
export function TeachModal({ onClose }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: knowledge = [], refetch } = api.drCof.listKnowledge.useQuery();
  const addMutation = api.drCof.addKnowledge.useMutation();
  const deleteMutation = api.drCof.deleteKnowledge.useMutation();

  async function handleSave() {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      await addMutation.mutateAsync({ title: title.trim(), content: content.trim() });
      setTitle("");
      setContent("");
      await refetch();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await deleteMutation.mutateAsync({ id });
    await refetch();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex w-full max-w-xl flex-col gap-5 rounded-2xl bg-white p-6 shadow-2xl">
        {/* Título */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">Ensinar Dr. Cof</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Formulário */}
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#5B0A0A]">
              Título do conhecimento
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Horário de atendimento ao aluno"
              className="w-full rounded-xl bg-gray-100 px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#5B0A0A]/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#5B0A0A]">
              Conteúdo
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Escreva aqui o conhecimento que o Dr. Cof deve aprender..."
              className="w-full resize-none rounded-xl bg-gray-100 px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#5B0A0A]/30"
            />
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={!title.trim() || !content.trim() || saving}
            className="self-end rounded-xl bg-[#5B0A0A] px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {saving ? "Salvando..." : "Salvar conhecimento"}
          </button>
        </div>

        {/* Lista de conhecimentos salvos */}
        {knowledge.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Conhecimentos salvos ({knowledge.length})
            </p>
            <div className="flex max-h-52 flex-col gap-2 overflow-y-auto">
              {knowledge.map((k) => (
                <div
                  key={k.id}
                  className="flex items-start justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">{k.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{k.content}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(k.id)}
                    className="shrink-0 text-gray-400 transition-colors hover:text-red-500"
                    aria-label="Excluir conhecimento"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {knowledge.length === 0 && (
          <p className="text-center text-xs text-gray-400">
            Nenhum conhecimento salvo ainda. Adicione o primeiro acima.
          </p>
        )}
      </div>
    </div>
  );
}
