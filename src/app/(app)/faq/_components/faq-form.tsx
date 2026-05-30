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

const CONFIRM_CONFIG = {
  save: {
    message: "Realmente deseja salvar as alterações aplicadas?",
  },
  cancel: {
    message: "Realmente deseja cancelar alterações aplicadas?",
  },
  cancelAdd: {
    message: "Realmente deseja cancelar o registro dessa pergunta frequente?",
  },
};

/**
 * Formulário inline para adicionar ou editar uma pergunta frequente.
 *
 * - Modo "add": ✓ salva direto; "-" com conteúdo pede confirmação de cancelamento.
 * - Modo "edit": ✓ pede confirmação de salvar; "-" pede confirmação de cancelar.
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

  /* --- Lógica do botão ✓ --- */
  function handleSaveClick() {
    if (!question.trim()) return;

    if (isEdit) {
      // Edit: pede confirmação antes de salvar
      setConfirming("save");
    } else {
      // Add: salva diretamente
      onSave(question.trim(), answer.trim());
    }
  }

  function handleConfirmSave() {
    setConfirming(null);
    onSave(question.trim(), answer.trim());
  }

  /* --- Lógica do botão "-" --- */
  function handleCancelClick() {
    if (isEdit) {
      // Edit: sempre pede confirmação de cancelar
      setConfirming("cancel");
    } else {
      // Add: só pede confirmação se já digitou algo
      if (hasContent) {
        setConfirming("cancel");
      } else {
        onCancel();
      }
    }
  }

  function handleConfirmCancel() {
    setConfirming(null);
    onCancel();
  }

  /* Mensagem do diálogo de confirmação */
  const confirmMessage =
    confirming === "save"
      ? CONFIRM_CONFIG.save.message
      : isEdit
        ? CONFIRM_CONFIG.cancel.message
        : CONFIRM_CONFIG.cancelAdd.message;

  return (
    <div className="relative rounded-2xl bg-[#f3f4f6] p-6 shadow-sm">
      {/* Campo da pergunta */}
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-[#5B0A0A]">
          Qual a pergunta frequente?
        </label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full rounded-xl bg-[#e5e7eb] px-4 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#5B0A0A]/30"
          placeholder="Digite a pergunta..."
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
          className="w-full resize-none rounded-xl bg-[#e5e7eb] px-4 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#5B0A0A]/30"
          placeholder="Digite a resposta..."
        />
      </div>

      {/* Ações — canto inferior */}
      <div className="relative flex items-center justify-between">
        <span className="text-xs text-gray-400">+</span>

        <div className="relative flex items-center gap-3">
          {/* Diálogo de confirmação (salvar ou cancelar) */}
          {confirming && (
            <FaqConfirmDialog
              message={confirmMessage}
              onConfirm={confirming === "save" ? handleConfirmSave : handleConfirmCancel}
              onCancel={() => setConfirming(null)}
            />
          )}

          {/* Botão "-" */}
          <button
            type="button"
            onClick={handleCancelClick}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-200"
            aria-label="Cancelar"
          >
            <Minus className="h-4 w-4" />
          </button>

          {/* Botão "✓" */}
          <button
            type="button"
            onClick={handleSaveClick}
            disabled={!question.trim()}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-200 disabled:opacity-30"
            aria-label="Salvar"
          >
            <Check className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
