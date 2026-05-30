type CancelConfirmModalProps = {
  open: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
};

/**
 * Modal de confirmação para cancelar registro de pendência.
 */
export function CancelConfirmModal({
  open,
  onConfirm,
  onDismiss,
}: CancelConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-confirm-title"
    >
      <div className="w-full max-w-sm rounded-2xl bg-calendar-bordeaux p-5 text-white shadow-xl">
        <p
          id="cancel-confirm-title"
          className="text-center text-sm font-medium leading-relaxed"
        >
          Realmente deseja cancelar o registro dessa pendência?
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <button
            type="button"
            onClick={onDismiss}
            className="min-w-[5rem] rounded-full bg-calendar-cardinal px-5 py-2 text-sm font-semibold text-white hover:bg-brand-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Não
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="min-w-[5rem] rounded-full bg-white px-5 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Sim
          </button>
        </div>
      </div>
    </div>
  );
}
