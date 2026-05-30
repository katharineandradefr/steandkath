"use client";

import { useCallback, useRef, useState } from "react";
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

  const containerRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((message: string, variant: "success" | "error") => {
    setToast({ message, variant });
  }, []);

  const filteredFaqs = faqs.filter((f) =>
    f.question.toLowerCase().includes(search.toLowerCase()),
  );

  const expandedEntry = faqs.find((f) => f.id === expandedId);

  function handleToggle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
    if (mode !== "view") setMode("view");
  }

  function handleClickOutside(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === containerRef.current) {
      setExpandedId(null);
    }
  }

  /* Adicionar nova pergunta */
  function handleAddSave(question: string, answer: string) {
    const newEntry: FaqEntry = {
      id: `${Date.now()}`,
      question,
      answer,
    };
    setFaqs((prev) => [...prev, newEntry]);
    setMode("view");
    showToast("Nova pergunta frequente registrada!", "success");
  }

  function handleAddCancel() {
    setMode("view");
    showToast("Registro cancelado!", "error");
  }

  /* Editar pergunta existente */
  function handleEditClick(id: string) {
    setEditingId(id);
    setMode("edit");
  }

  function handleEditSave(question: string, answer: string) {
    setFaqs((prev) =>
      prev.map((f) =>
        f.id === editingId ? { ...f, question, answer } : f,
      ),
    );
    setMode("view");
    setEditingId(null);
    showToast("Alterações salvas!", "success");
  }

  function handleEditCancel() {
    setMode("view");
    setEditingId(null);
    showToast("Registro cancelado!", "error");
  }

  /* Remover pergunta selecionada */
  function handleDeleteConfirm() {
    if (!expandedId) return;
    setFaqs((prev) => prev.filter((f) => f.id !== expandedId));
    setExpandedId(null);
    setShowDeleteConfirm(false);
    showToast("Pergunta removida!", "error");
  }

  const editingEntry = faqs.find((f) => f.id === editingId);

  return (
    <div
      ref={containerRef}
      className="relative min-h-full pb-20"
      onClick={handleClickOutside}
    >
      {/* Título */}
      <h1 className="mb-6 text-center text-2xl font-bold text-[#5B0A0A]">
        Perguntas Frequentes
      </h1>

      {/* Barra de pesquisa */}
      <div className="mx-auto mb-6 flex max-w-2xl items-center gap-2 rounded-xl bg-[#e5e7eb] px-4 py-2.5">
        <Search className="h-4 w-4 shrink-0 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar pergunta..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
        />
      </div>

      {/* Lista de FAQs */}
      <div className="mx-auto flex max-w-2xl flex-col gap-3">
        {filteredFaqs.map((entry) => {
          /* Mostra formulário de edição no lugar do item quando editando */
          if (mode === "edit" && editingId === entry.id && editingEntry) {
            return (
              <FaqForm
                key={entry.id}
                mode="edit"
                initialQuestion={editingEntry.question}
                initialAnswer={editingEntry.answer}
                onSave={handleEditSave}
                onCancel={handleEditCancel}
              />
            );
          }

          return (
            <FaqItem
              key={entry.id}
              entry={entry}
              isExpanded={expandedId === entry.id}
              onToggle={() => handleToggle(entry.id)}
              onEditClick={() => handleEditClick(entry.id)}
            />
          );
        })}

        {/* Formulário de adição de nova pergunta */}
        {mode === "add" && (
          <FaqForm
            onSave={handleAddSave}
            onCancel={handleAddCancel}
          />
        )}

        {filteredFaqs.length === 0 && mode !== "add" && (
          <p className="text-center text-sm text-gray-400">
            Nenhuma pergunta encontrada.
          </p>
        )}
      </div>

      {/* Botões de controle — canto inferior direito */}
      <div className="fixed right-8 bottom-8 flex items-center gap-2">
        {/* Botão remover — só ativo quando há item selecionado */}
        <div className="relative">
          {showDeleteConfirm && expandedId && (
            <FaqConfirmDialog
              message="Realmente deseja remover essa pergunta frequente?"
              onConfirm={handleDeleteConfirm}
              onCancel={() => setShowDeleteConfirm(false)}
            />
          )}
          <button
            type="button"
            onClick={() => {
              if (!expandedId) return;
              setShowDeleteConfirm(true);
            }}
            disabled={!expandedId}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-500 shadow-md transition-colors hover:bg-gray-100 disabled:opacity-30"
            aria-label="Remover pergunta selecionada"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>

        {/* Botão adicionar */}
        <button
          type="button"
          onClick={() => {
            setMode((prev) => (prev === "add" ? "view" : "add"));
            setExpandedId(null);
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-500 shadow-md transition-colors hover:bg-gray-100"
          aria-label="Adicionar nova pergunta"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Toast de notificação */}
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
