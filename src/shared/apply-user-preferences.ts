import type { UserPreferences } from "~/shared/user-preferences";

/**
 * Aplica preferências visuais no documento HTML (tema e tamanho da fonte).
 */
export function applyUserPreferencesToDocument(
  preferences: Pick<UserPreferences, "fontSize" | "colorMode">,
): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.dataset.theme = preferences.colorMode;
  root.dataset.fontSize = preferences.fontSize;
}
