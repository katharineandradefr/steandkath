"use client";

type Props = {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Diálogo de confirmação centralizado na tela como overlay.
 */
export function FaqConfirmDialog({ message, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-2xl bg-[#5B0A0A] p-6 shadow-2xl">
        <p className="mb-5 text-sm leading-snug text-white">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl bg-white/20 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/30"
          >
            Não
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-white/20 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/30"
          >
            Sim
          </button>
        </div>
      </div>
    </div>
  );
}
