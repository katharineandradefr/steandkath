"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { AdminPasswordModal } from "~/app/(app)/configuracoes/_components/admin-password-modal";
import type { User } from "~/shared/user";
import { api } from "~/trpc/react";

type Props = {
  users: User[];
};

type RevealState = {
  userId: string;
  password: string | null;
} | null;

/**
 * Tabela de usuários com senha mascarada e revelação protegida por senha admin.
 */
export function UsersPanel({ users }: Props) {
  const [revealTargetId, setRevealTargetId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<RevealState>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const revealMutation = api.user.revealPassword.useMutation({
    onSuccess: (result) => {
      if (!revealTargetId) return;
      setRevealed({
        userId: revealTargetId,
        password: result.password,
      });
      setRevealTargetId(null);
      setModalError(null);
    },
    onError: (err) => {
      setModalError(err.message);
    },
  });

  const handleRevealRequest = (userId: string) => {
    setRevealTargetId(userId);
    setModalError(null);
  };

  const handleHidePassword = (userId: string) => {
    if (revealed?.userId === userId) {
      setRevealed(null);
    }
  };

  const getPasswordDisplay = (user: User) => {
    if (!user.hasPassword) return "Não definida";

    if (revealed?.userId === user.id) {
      return revealed.password ?? "Não definida";
    }

    return "••••••••";
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-calendar-bordeaux">Usuários</h2>
        <p className="text-sm text-calendar-muted">
          Lista de usuários cadastrados no sistema.
        </p>
      </div>

      {users.length === 0 ? (
        <p className="rounded-2xl bg-gray-200 px-4 py-6 text-center text-sm text-calendar-muted">
          Nenhum usuário cadastrado ainda.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-semibold text-calendar-bordeaux">
                  Nome
                </th>
                <th className="px-4 py-3 text-left font-semibold text-calendar-bordeaux">
                  E-mail
                </th>
                <th className="px-4 py-3 text-left font-semibold text-calendar-bordeaux">
                  Telefone
                </th>
                <th className="px-4 py-3 text-left font-semibold text-calendar-bordeaux">
                  Senha
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isRevealed = revealed?.userId === user.id;

                return (
                  <tr
                    key={user.id}
                    className="border-b border-gray-100 hover:bg-gray-50/60"
                  >
                    <td className="px-4 py-3 text-gray-900">{user.name}</td>
                    <td className="px-4 py-3 text-gray-700">{user.email}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {user.phone ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-gray-700">
                          {getPasswordDisplay(user)}
                        </span>
                        {user.hasPassword && (
                          <button
                            type="button"
                            onClick={() =>
                              isRevealed
                                ? handleHidePassword(user.id)
                                : handleRevealRequest(user.id)
                            }
                            className="rounded-full p-1 text-calendar-muted transition-colors hover:bg-gray-100 hover:text-calendar-bordeaux focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal"
                            aria-label={
                              isRevealed
                                ? `Ocultar senha de ${user.name}`
                                : `Revelar senha de ${user.name}`
                            }
                          >
                            {isRevealed ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {revealTargetId && (
        <AdminPasswordModal
          isLoading={revealMutation.isPending}
          error={modalError}
          onCancel={() => {
            setRevealTargetId(null);
            setModalError(null);
          }}
          onConfirm={(adminPassword) => {
            revealMutation.mutate({
              userId: revealTargetId,
              adminPassword,
            });
          }}
        />
      )}
    </div>
  );
}
