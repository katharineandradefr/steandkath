"use client";

import { useState } from "react";
import { Check, Minus } from "lucide-react";

import { FaqConfirmDialog } from "./faq-confirm-dialog";

type Props = {
  mode?: "add" | "edit";
  initialQuestion?: string;
  initialAnswer?: string;
  onSave: (question: string, answer: string) => void;
  onCancel: () => void;
};

type ConfirmType = "save" | "cancel" | null;

/**
 * Formulário de adicionar/editar FAQ como overlay modal centralizado.
 *
 * - Modo "add": ✓ salva direto; "-" com conteúdo pede confirmação.
 * - Modo "edit": ✓ e "-" sempre pedem confirmação.
 */
export function FaqForm({
  mode = "add",
  initialQuestion = "",
  initialAnswer = "",
  onSave,
  onCancel,
}: Props) {
  const [question, setQuestion] = useState(initialQuestion);
  const [answer, setAnswer] = useState(initialAnswer);
  const [confirming, setConfirming] = useState<ConfirmType>(null);

  const hasContent = question.trim() || answer.trim();
  const isEdit = mode === "edit";
  const hasChanged =
    question.trim() !== initialQuestion.trim() ||
    answer.trim() !== initialAnswer.trim();

  function handleSaveClick() {
    if (!question.trim()) return;
    if (isEdit && hasChanged) {
      setConfirming("save");
    } else {
      onSave(question.trim(), answer.trim());
    }
  }

  function handleConfirmSave() {
    setConfirming(null);
    onSave(question.trim(), answer.trim());
  }

  function handleCancelClick() {
    if (isEdit || hasContent) {
      setConfirming("cancel");
    } else {
      onCancel();
    }
  }

  function handleConfirmCancel() {
    setConfirming(null);
    onCancel();
  }

  const confirmMessage =
    confirming === "save"
      ? "Realmente deseja salvar as alterações aplicadas?"
      : isEdit
        ? "Realmente deseja cancelar alterações aplicadas?"
        : "Realmente deseja cancelar o registro dessa pergunta frequente?";

  /* Diálogo de confirmação sobrepõe o modal do formulário */
  if (confirming) {
    return (
      <FaqConfirmDialog
        message={confirmMessage}
        onConfirm={confirming === "save" ? handleConfirmSave : handleConfirmCancel}
        onCancel={() => setConfirming(null)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        {/* Campo da pergunta */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-[#5B0A0A]">
            Qual a pergunta frequente?
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full rounded-xl bg-gray-100 px-4 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#5B0A0A]/30"
            placeholder="Digite a pergunta..."
            autoFocus
          />
        </div>

        {/* Campo da resposta */}
        <div className="mb-6">
          <label className="mb-1.5 block text-sm font-medium text-[#5B0A0A]">
            Resposta
          </label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={5}
            className="w-full resize-none rounded-xl bg-gray-100 px-4 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#5B0A0A]/30"
            placeholder="Digite a resposta..."
          />
        </div>

        {/* Ações */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleCancelClick}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100"
            aria-label="Cancelar"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleSaveClick}
            disabled={!question.trim()}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-30"
            aria-label="Salvar"
          >
            <Check className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
