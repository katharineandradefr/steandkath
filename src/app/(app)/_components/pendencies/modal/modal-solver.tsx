"use client";

import { UserRound } from "lucide-react";

import { api } from "~/trpc/react";

type Props = {
  solverId: string | null;
  readOnly?: boolean;
  onSolverChange: (id: string | null) => void;
};

/**
 * Seleção opcional do solucionador da pendência.
 */
export function ModalSolver({
  solverId,
  readOnly = false,
  onSolverChange,
}: Props) {
  const { data: users = [], isLoading } = api.user.list.useQuery();

  const selectedUser = users.find((user) => user.id === solverId);

  return (
    <section className="border-t border-sidebar-border py-4">
      <div className="mb-3 flex items-center gap-2">
        <UserRound className="h-4 w-4 text-white/50" aria-hidden />
        <h3 className="text-sm font-semibold text-white">Solucionador</h3>
        <span className="text-xs text-white/40">(opcional)</span>
      </div>

      {readOnly ? (
        <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/80">
          {selectedUser?.name ?? "Nenhum selecionado"}
        </p>
      ) : (
        <>
          <label className="mb-1.5 block text-xs font-medium text-white/50">
            Selecionar usuário
          </label>
          <select
            value={solverId ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              onSolverChange(value.length > 0 ? value : null);
            }}
            disabled={isLoading}
            className="pendency-direct-select w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50"
          >
            <option value="" className="pendency-direct-select-option">
              {isLoading ? "Carregando usuários…" : "Nenhum selecionado"}
            </option>
            {users.map((user) => (
              <option
                key={user.id}
                value={user.id}
                className="pendency-direct-select-option"
              >
                {user.name}
              </option>
            ))}
          </select>
        </>
      )}
    </section>
  );
}
