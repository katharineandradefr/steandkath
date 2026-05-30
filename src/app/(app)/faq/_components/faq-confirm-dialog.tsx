"use client";

type Props = {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Diálogo de confirmação flutuante estilo tooltip, conforme o design.
 */
export function FaqConfirmDialog({ message, onConfirm, onCancel }: Props) {
  return (
    <div className="absolute right-0 bottom-full z-30 mb-2 w-72 rounded-2xl bg-[#5B0A0A] p-4 text-white shadow-xl">
      <p className="mb-3 text-sm leading-snug">{message}</p>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg bg-white/20 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-white/30"
        >
          Não
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-lg bg-white/20 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-white/30"
        >
          Sim
        </button>
      </div>
    </div>
  );
}
