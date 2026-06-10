"use client";

import { useEffect } from "react";

type ToastVariant = "success" | "error";

type Props = {
  message: string;
  variant: ToastVariant;
  onDismiss: () => void;
};

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  success: "bg-green-500",
  error: "bg-red-500",
};

/**
 * Toast de notificação que se auto-dispensa após 3 segundos.
 */
export function FaqToast({ message, variant, onDismiss }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 rounded-2xl px-8 py-4 text-center text-sm font-medium text-white shadow-xl transition-all duration-300 ${VARIANT_CLASSES[variant]}`}
    >
      {message}
    </div>
  );
}
