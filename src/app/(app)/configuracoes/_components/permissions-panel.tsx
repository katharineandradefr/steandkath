"use client";

import { Fragment, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { ToggleSwitch } from "~/app/(app)/configuracoes/_components/toggle-switch";
import {
  PERMISSION_GROUPS,
  type PermissionKey,
  type PermissionMatrix,
} from "~/shared/permissions";
import { USER_ROLE_LABELS, USER_ROLES, type UserRole } from "~/shared/user";
import { api } from "~/trpc/react";

type Props = {
  matrix: PermissionMatrix;
};

/**
 * Matriz de permissões por papel (linhas = permissões, colunas = papéis).
 */
export function PermissionsPanel({ matrix: initialMatrix }: Props) {
  const [matrix, setMatrix] = useState(initialMatrix);
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingCell, setPendingCell] = useState<string | null>(null);

  const utils = api.useUtils();

  const updateMutation = api.settings.updatePermission.useMutation({
    onSuccess: async (result) => {
      setMatrix(result.matrix);
      setFeedback("Permissão atualizada.");
      setError(null);
      setPendingCell(null);
      await utils.settings.invalidate();
    },
    onError: () => {
      setError("Não foi possível salvar a permissão. Tente novamente.");
      setFeedback(null);
      setPendingCell(null);
    },
  });

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return PERMISSION_GROUPS;

    return PERMISSION_GROUPS.map((group) => ({
      ...group,
      permissions: group.permissions.filter(
        (permission) =>
          permission.label.toLowerCase().includes(query) ||
          group.label.toLowerCase().includes(query),
      ),
    })).filter((group) => group.permissions.length > 0);
  }, [search]);

  const handleToggle = (
    role: UserRole,
    permissionKey: PermissionKey,
    allowed: boolean,
  ) => {
    const cellKey = `${role}:${permissionKey}`;
    setPendingCell(cellKey);
    setFeedback(null);
    setError(null);

    setMatrix((current) => ({
      ...current,
      [role]: {
        ...current[role],
        [permissionKey]: allowed,
      },
    }));

    updateMutation.mutate({ role, permissionKey, allowed });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-calendar-bordeaux">
            Permissões de acesso
          </h2>
          <p className="text-sm text-calendar-muted">
            Defina o que cada tipo de usuário pode fazer no sistema.
          </p>
        </div>

        <label className="relative w-full sm:max-w-xs">
          <span className="sr-only">Pesquisar permissões</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-calendar-muted" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Pesquisar"
            className="w-full rounded-full bg-gray-200 py-2.5 pr-4 pl-10 text-sm text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal"
          />
        </label>
      </div>

      {feedback && (
        <p role="status" className="text-sm text-emerald-700">
          {feedback}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="sticky left-0 z-10 min-w-[220px] border-r border-gray-200 bg-gray-50 px-4 py-3 text-left font-semibold text-calendar-bordeaux">
                Funções
              </th>
              {USER_ROLES.map((role) => (
                <th
                  key={role}
                  className="min-w-[140px] px-4 py-3 text-center font-semibold text-calendar-bordeaux"
                >
                  {USER_ROLE_LABELS[role]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredGroups.map((group) => (
              <Fragment key={group.id}>
                <tr className="bg-gray-100/80">
                  <td
                    colSpan={USER_ROLES.length + 1}
                    className="px-4 py-2 text-xs font-bold tracking-wide text-calendar-bordeaux uppercase"
                  >
                    {group.label}
                  </td>
                </tr>
                {group.permissions.map((permission) => (
                  <tr
                    key={permission.key}
                    className="border-b border-gray-100 hover:bg-gray-50/60"
                  >
                    <td className="sticky left-0 z-10 border-r border-gray-100 bg-white px-4 py-3 text-calendar-bordeaux">
                      {permission.label}
                    </td>
                    {USER_ROLES.map((role) => {
                      const cellKey = `${role}:${permission.key}`;
                      const isPending = pendingCell === cellKey;

                      return (
                        <td key={role} className="px-4 py-3 text-center">
                          <div className="flex justify-center">
                            <ToggleSwitch
                              checked={matrix[role][permission.key]}
                              onChange={(allowed) =>
                                handleToggle(role, permission.key, allowed)
                              }
                              disabled={isPending}
                              label={`${permission.label} — ${USER_ROLE_LABELS[role]}`}
                            />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
