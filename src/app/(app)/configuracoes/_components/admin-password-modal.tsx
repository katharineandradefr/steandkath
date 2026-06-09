"use client";

import { useState } from "react";

type Props = {
  onConfirm: (adminPassword: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
};

/**
 * Modal para validar senha de administrador antes de revelar senhas de usuários.
 */
export function AdminPasswordModal({
  onConfirm,
  onCancel,
  isLoading,
  error,
}: Props) {
  const [password, setPassword] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-calendar-bordeaux p-6 shadow-2xl">
        <h2 className="text-base font-semibold text-white">
          Senha de administrador
        </h2>
        <p className="mt-2 text-sm text-white/80">
          Informe a senha de administrador para visualizar a senha do usuário.
        </p>

        <label htmlFor="admin-password" className="sr-only">
          Senha de administrador
        </label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-4 w-full rounded-full bg-white/90 px-4 py-2.5 text-sm text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal"
          placeholder="Senha de administrador"
          autoComplete="off"
        />

        {error && (
          <p role="alert" className="mt-2 text-sm text-red-200">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-xl bg-white/20 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/30 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(password)}
            disabled={isLoading || password.trim().length === 0}
            className="rounded-xl bg-white/20 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/30 disabled:opacity-50"
          >
            {isLoading ? "Verificando…" : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
