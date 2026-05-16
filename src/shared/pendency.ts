/**
 * Contrato de domínio para pendências.
 * Fase 2: reutilizar estes tipos em schemas Zod e router tRPC.
 */

export type PendencyStatus = "pending" | "in_review" | "fixed";

export type PendencyUrgency = "low" | "medium" | "high";

export type PendencyProjectKey =
  | "extensivo_27"
  | "internato"
  | "usa_fichas";

export type PendencyAttachment = {
  id: string;
  fileName: string;
  dataUrl: string;
  createdAt: string;
};

export type PendencyLink = {
  id: string;
  url: string;
  label?: string;
};

export type ChecklistItem = {
  id: string;
  text: string;
  checked: boolean;
};

export type Pendency = {
  id: string;
  areaKey: string;
  title: string;
  /** @deprecated Preferir descriptionMarkdown; mantido para compatibilidade no card. */
  description?: string | null;
  descriptionMarkdown: string;
  projectKey: PendencyProjectKey;
  status: PendencyStatus;
  urgency: PendencyUrgency;
  position: number;
  attachments: PendencyAttachment[];
  links: PendencyLink[];
  checklist: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
};

export const PENDENCY_STATUSES: readonly PendencyStatus[] = [
  "pending",
  "in_review",
  "fixed",
] as const;

export const PENDENCY_URGENCIES: readonly PendencyUrgency[] = [
  "low",
  "medium",
  "high",
] as const;

export const PENDENCY_PROJECT_KEYS: readonly PendencyProjectKey[] = [
  "extensivo_27",
  "internato",
  "usa_fichas",
] as const;

export const PENDENCY_STATUS_LABELS: Record<PendencyStatus, string> = {
  pending: "Pendente",
  in_review: "Em revisão",
  fixed: "Corrigido",
};

export const PENDENCY_URGENCY_LABELS: Record<PendencyUrgency, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

export const PENDENCY_PROJECT_LABELS: Record<PendencyProjectKey, string> = {
  extensivo_27: "Extensivo 27",
  internato: "Internato",
  usa_fichas: "USA Fichas",
};

export const PENDENCY_PROJECT_STYLES: Record<
  PendencyProjectKey,
  { badgeOnLight: string; badgeOnDark: string }
> = {
  extensivo_27: {
    badgeOnLight: "bg-violet-100 text-violet-700 border-violet-200",
    badgeOnDark: "bg-violet-500/25 text-violet-200 border-violet-400/40",
  },
  internato: {
    badgeOnLight: "bg-sky-100 text-sky-700 border-sky-200",
    badgeOnDark: "bg-sky-500/20 text-sky-200 border-sky-400/35",
  },
  usa_fichas: {
    badgeOnLight: "bg-pink-100 text-pink-700 border-pink-200",
    badgeOnDark: "bg-pink-500/20 text-pink-200 border-pink-400/35",
  },
};

export const DEFAULT_AREA_KEY = "default";

export const DEFAULT_AREA_TITLE = "Clínica Médica";

export const DEFAULT_PROJECT_KEY: PendencyProjectKey = "extensivo_27";

/** Classes Tailwind para badges de urgência (fundo claro vs. modal escuro). */
export const PENDENCY_URGENCY_STYLES: Record<
  PendencyUrgency,
  { badgeOnLight: string; badgeOnDark: string; dotOnLight: string; dotOnDark: string }
> = {
  low: {
    badgeOnLight: "bg-emerald-100 text-emerald-700 border-emerald-200",
    badgeOnDark: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    dotOnLight: "bg-emerald-700",
    dotOnDark: "bg-emerald-400",
  },
  medium: {
    badgeOnLight: "bg-amber-100 text-amber-700 border-amber-200",
    badgeOnDark: "bg-amber-500/15 text-amber-200 border-amber-500/30",
    dotOnLight: "bg-amber-700",
    dotOnDark: "bg-amber-400",
  },
  high: {
    badgeOnLight: "bg-red-100 text-red-700 border-red-200",
    badgeOnDark: "bg-red-500/20 text-red-200 border-red-400/40",
    dotOnLight: "bg-red-700",
    dotOnDark: "bg-red-500",
  },
};

/**
 * Rascunho vazio para criação de pendência no modal.
 */
export function createEmptyPendencyDraft(
  overrides?: Partial<Pendency>,
): Pendency {
  const now = new Date().toISOString();
  const pendingPosition = overrides?.position ?? 0;

  return {
    id: crypto.randomUUID(),
    areaKey: DEFAULT_AREA_KEY,
    title: "",
    description: null,
    descriptionMarkdown: "",
    projectKey: DEFAULT_PROJECT_KEY,
    status: "pending",
    urgency: "medium",
    position: pendingPosition,
    attachments: [],
    links: [],
    checklist: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Texto curto para exibição no card do Kanban.
 */
export function getPendencyCardExcerpt(pendency: Pendency): string | null {
  const md = pendency.descriptionMarkdown.trim();
  if (md) return md.split("\n")[0] ?? null;
  return pendency.description?.trim() ?? null;
}

/**
 * Agrupa pendências por status, ordenadas por position.
 */
export function groupPendenciesByStatus(
  pendencies: Pendency[],
): Record<PendencyStatus, Pendency[]> {
  const grouped: Record<PendencyStatus, Pendency[]> = {
    pending: [],
    in_review: [],
    fixed: [],
  };

  for (const status of PENDENCY_STATUSES) {
    grouped[status] = pendencies
      .filter((p) => p.status === status)
      .sort((a, b) => a.position - b.position);
  }

  return grouped;
}

/**
 * Filtra pendências por urgência; `null` = todas.
 */
export function filterPendenciesByUrgency(
  pendencies: Pendency[],
  urgency: PendencyUrgency | null,
): Pendency[] {
  if (urgency === null) return pendencies;
  return pendencies.filter((p) => p.urgency === urgency);
}

/**
 * Filtra pendências por texto no título (case-insensitive).
 */
export function filterPendenciesBySearch(
  pendencies: Pendency[],
  query: string,
): Pendency[] {
  const q = query.trim().toLowerCase();
  if (!q) return pendencies;
  return pendencies.filter((p) => p.title.toLowerCase().includes(q));
}
