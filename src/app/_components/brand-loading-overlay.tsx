"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

import { useUserPreferences } from "~/app/_components/user-preferences-provider";
import { BrandLogoFill } from "~/app/_components/brand-logo-fill";

type Props = {
  durationMs?: number;
  exiting?: boolean;
};

/**
 * Tela de transição com logo preenchendo — usada entre chat e pendências.
 */
export function BrandLoadingOverlay({ durationMs = 1000, exiting = false }: Props) {
  const { preferences } = useUserPreferences();
  const [mounted, setMounted] = useState(false);
  const isDark = preferences.colorMode === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`brand-loading-overlay ${isDark ? "brand-loading-overlay--dark" : "brand-loading-overlay--light"}${exiting ? " brand-loading-overlay--exiting" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Carregando pendência"
    >
      <BrandLogoFill durationMs={durationMs} />
    </div>,
    document.body,
  );
}
