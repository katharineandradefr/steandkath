"use client";

import { useCallback, useState } from "react";
import { Minus, Plus, Search } from "lucide-react";

import { FaqItem, type FaqEntry } from "./_components/faq-item";
import { FaqForm } from "./_components/faq-form";
import { FaqConfirmDialog } from "./_components/faq-confirm-dialog";
import { FaqToast } from "./_components/faq-toast";

type Mode = "view" | "add" | "edit";
type Toast = { message: string; variant: "success" | "error" } | null;

const INITIAL_FAQS: FaqEntry[] = [
  {
    id: "1",
    question: "O que é a medcof?",
    answer:
      "A MedCof é uma empresa especializada em cursos preparatórios para Residência Médica e Revalida, com foco em alta performance e metodologia baseada em análise de provas.",
  },
  {
    id: "2",
    question: "Oque é o internato?",
    answer:
      "O Internato MedCof é um programa intensivo voltado para estudantes de medicina em fase de internato, oferecendo acompanhamento especializado e material direcionado para os principais concursos.",
  },
  {
    id: "3",
    question: "Oque é o extensivo?",
    answer:
      "O curso Extensivo MedCof é um preparatório anual voltado para provas de Residência Médica e Revalida, focado em alta performance. Ele utiliza um método de ensino estratégico baseado em análise estatística de provas anteriores, permitindo que o aluno estude os temas mais quentes e otimize seu tempo de estudo.",
  },
];

export default function FaqPage() {
  const [faqs, setFaqs] = useState<FaqEntry[]>(INITIAL_FAQS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<Mode>("view");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const showToast = useCallback((message: string, variant: "success" | "error") => {
    setToast({ message, variant });
  }, []);

  const filteredFaqs = faqs.filter((f) =>
    f.question.toLowerCase().includes(search.toLowerCase()),
  );

  const editingEntry = faqs.find((f) => f.id === editingId);

  function handleToggle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  /* Adicionar */
  function handleAddSave(question: string, answer: string) {
    setFaqs((prev) => [...prev, { id: `${Date.now()}`, question, answer }]);
    setMode("view");
    showToast("Nova pergunta frequente registrada!", "success");
  }

  function handleAddCancel() {
    setMode("view");
    showToast("Registro cancelado!", "error");
  }

  /* Editar */
  function handleEditClick(id: string) {
    setEditingId(id);
    setMode("edit");
  }

  function handleEditSave(question: string, answer: string) {
    const changed =
      question !== editingEntry?.question || answer !== editingEntry?.answer;
    setFaqs((prev) =>
      prev.map((f) => (f.id === editingId ? { ...f, question, answer } : f)),
    );
    setMode("view");
    setEditingId(null);
    if (changed) showToast("Alterações salvas!", "success");
  }

  function handleEditCancel() {
    setMode("view");
    setEditingId(null);
    showToast("Registro cancelado!", "error");
  }

  /* Remover */
  function handleDeleteConfirm() {
    setFaqs((prev) => prev.filter((f) => f.id !== expandedId));
    setExpandedId(null);
    setShowDeleteConfirm(false);
    showToast("Pergunta removida!", "error");
  }

  return (
    /* flex-1 estende para preencher todo o espaço disponível no main */
    <div className="flex flex-1 min-h-0 flex-col gap-4">

      {/* Card central — tamanho fixo com scroll interno */}
      <div className="min-h-0 flex-1 overflow-hidden rounded-3xl bg-gray-300 shadow-xl">
        {/* Área interna rolável */}
        <div className="h-full overflow-y-auto px-8 py-7">
          {/* Título */}
          <h1 className="mb-6 text-center text-2xl font-bold text-[#5B0A0A]">
            Perguntas Frequentes
          </h1>

          {/* Barra de pesquisa — estilo pílula, centralizada em ~2/3 */}
          <div className="mx-auto mb-6 w-full max-w-4xl">
            <div className="flex items-center gap-2 rounded-full bg-gray-400/40 px-4 py-2.5">
              <Search className="h-4 w-4 shrink-0 text-gray-600" />
              <input
                type="text"
                placeholder="Buscar pergunta..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Lista de FAQs — centralizada em ~2/3 */}
          <div className="mx-auto w-full max-w-4xl">
          <div className="flex flex-col gap-3">
            {filteredFaqs.map((entry) => (
              <FaqItem
                key={entry.id}
                entry={entry}
                isExpanded={expandedId === entry.id}
                onToggle={() => handleToggle(entry.id)}
                onEditClick={() => handleEditClick(entry.id)}
              />
            ))}

            {filteredFaqs.length === 0 && (
              <p className="text-center text-sm text-gray-500">
                Nenhuma pergunta encontrada.
              </p>
            )}
          </div>
          </div>
        </div>
      </div>

      {/* Rodapé — botões abaixo do card, alinhados à direita */}
      <div className="flex shrink-0 items-center justify-end gap-2 px-1 pb-1">
        <button
          type="button"
          onClick={() => expandedId && setShowDeleteConfirm(true)}
          disabled={!expandedId}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-600 shadow-sm transition-colors hover:bg-white disabled:opacity-30"
          aria-label="Remover pergunta selecionada"
        >
          <Minus className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => { setMode("add"); setExpandedId(null); }}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-600 shadow-sm transition-colors hover:bg-white"
          aria-label="Adicionar nova pergunta"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Modal: adicionar */}
      {mode === "add" && (
        <FaqForm onSave={handleAddSave} onCancel={handleAddCancel} />
      )}

      {/* Modal: editar */}
      {mode === "edit" && editingEntry && (
        <FaqForm
          mode="edit"
          initialQuestion={editingEntry.question}
          initialAnswer={editingEntry.answer}
          onSave={handleEditSave}
          onCancel={handleEditCancel}
        />
      )}

      {/* Modal: confirmar exclusão */}
      {showDeleteConfirm && expandedId && (
        <FaqConfirmDialog
          message="Realmente deseja remover essa pergunta frequente?"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {/* Toast */}
      {toast && (
        <FaqToast
          message={toast.message}
          variant={toast.variant}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
