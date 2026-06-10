"use client";

import { useCallback, useEffect, useState } from "react";

import { AppSidebar } from "~/app/_components/app-sidebar";
import { ProfileSetupBanner } from "~/app/_components/profile-setup-banner";

const STORAGE_KEY = "sidebar-expanded";

type AppShellProps = {
  children: React.ReactNode;
};

/**
 * Shell da área autenticada: sidebar fixa + conteúdo com padding dinâmico.
 */
export function AppShell({ children }: AppShellProps) {
  const [expanded, setExpanded] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") setExpanded(true);
    setHydrated(true);
  }, []);

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const closeExpanded = useCallback(() => {
    setExpanded(false);
    localStorage.setItem(STORAGE_KEY, "false");
  }, []);

  const isExpanded = hydrated && expanded;

  return (
    <div
      className={`sidebar-sync h-screen overflow-hidden bg-linear-to-br from-shell-mid via-shell-warm to-shell text-white${isExpanded ? " sidebar-sync--expanded" : ""}`}
    >
      <AppSidebar expanded={expanded} onToggle={toggleExpanded} onMouseLeave={closeExpanded} />

      {expanded && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          aria-label="Fechar menu"
          onClick={closeExpanded}
        />
      )}

      <div className="flex h-full min-h-0 min-w-0 flex-col pl-(--sidebar-width)">
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 sm:p-6 md:p-8">
          <ProfileSetupBanner />
          {children}
        </main>
      </div>
    </div>
  );
}
