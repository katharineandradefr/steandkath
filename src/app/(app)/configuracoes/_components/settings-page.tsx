"use client";

import { useState } from "react";

import { CoursesPanel } from "~/app/(app)/configuracoes/_components/courses-panel";
import { GeneralSettingsPanel } from "~/app/(app)/configuracoes/_components/general-settings-panel";
import { PermissionsPanel } from "~/app/(app)/configuracoes/_components/permissions-panel";
import { UsersPanel } from "~/app/(app)/configuracoes/_components/users-panel";
import { api } from "~/trpc/react";

type SettingsTab = "general" | "permissions" | "users" | "courses";

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "general", label: "Configurações gerais" },
  { id: "permissions", label: "Permissões" },
  { id: "users", label: "Usuários" },
  { id: "courses", label: "Cursos" },
];

/**
 * Tela de configurações com abas para permissões, usuários e cursos.
 */
export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  const permissionsQuery = api.settings.getPermissions.useQuery(undefined, {
    enabled: activeTab === "permissions",
  });
  const usersQuery = api.user.list.useQuery(undefined, {
    enabled: activeTab === "users",
  });
  const coursesQuery = api.course.list.useQuery(undefined, {
    enabled: activeTab === "courses",
  });

  const isLoading =
    (activeTab === "permissions" && permissionsQuery.isLoading) ||
    (activeTab === "users" && usersQuery.isLoading) ||
    (activeTab === "courses" && coursesQuery.isLoading);

  const loadError =
    activeTab === "permissions"
      ? permissionsQuery.error?.message
      : activeTab === "users"
        ? usersQuery.error?.message
        : activeTab === "courses"
          ? coursesQuery.error?.message
          : null;

  return (
    <div className="flex flex-1 flex-col rounded-3xl bg-calendar-bordeaux p-3 sm:p-4">
      <div className="flex flex-1 flex-col rounded-3xl bg-gray-100 p-4 shadow-sm sm:p-6">
        <h1 className="text-2xl font-bold tracking-tight text-calendar-bordeaux sm:text-3xl">
          Configurações
        </h1>

        <div
          className="mt-5 flex flex-wrap gap-2 border-b border-gray-200 pb-4"
          role="tablist"
          aria-label="Seções de configurações"
        >
          {TABS.map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal ${
                  selected
                    ? "bg-calendar-cardinal text-white"
                    : "bg-gray-200 text-calendar-bordeaux hover:bg-gray-300"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex-1" role="tabpanel">
          {isLoading && (
            <p className="text-sm text-calendar-muted">Carregando…</p>
          )}

          {loadError && (
            <p role="alert" className="text-sm text-red-600">
              {loadError}
            </p>
          )}

          {activeTab === "general" && <GeneralSettingsPanel />}

          {!isLoading && !loadError && activeTab === "permissions" && permissionsQuery.data && (
            <PermissionsPanel matrix={permissionsQuery.data.matrix} />
          )}

          {!isLoading && !loadError && activeTab === "users" && usersQuery.data && (
            <UsersPanel users={usersQuery.data} />
          )}

          {!isLoading && !loadError && activeTab === "courses" && coursesQuery.data && (
            <CoursesPanel courses={coursesQuery.data} />
          )}
        </div>
      </div>
    </div>
  );
}
