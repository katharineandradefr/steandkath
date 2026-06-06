/**
 * Contrato de domínio para pendências.
 * Fase 2: reutilizar estes tipos em schemas Zod e router tRPC.
 */

export type PendencyStatus = "pending" | "in_review" | "fixed";

export type PendencyUrgency = "low" | "medium" | "high";

export type PendencyProjectKey =
  | "extensivo"
  | "extensivo_performance"
  | "internato"
  | "medical_life_hacks_ps"
  | "radio"
  | "revalida"
  | "usa"
  | "clinicof"
  | "concursus";

export type PendencyAreaKey = "go" | "ped" | "prev" | "cir" | "cm";

export type PendencyAudience = "design" | "medical_team";

export type PendencyRecurrence = "none" | "weekly" | "monthly";

export type PendencyAttachment = {
  id: string;
  fileName: string;
  url: string;
  publicId: string;
  provider: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  createdAt: string;
};

/** Anexo pendente de upload (ainda não persistido no storage). */
export type PendencyAttachmentPending = {
  id: string;
  fileName: string;
  dataUrl: string;
  size: number;
  mimeType: string;
  pending: true;
};

/** Anexo no modal: já salvo ou aguardando upload no save. */
export type PendencyAttachmentDraft =
  | PendencyAttachment
  | PendencyAttachmentPending;

export function isPendingAttachment(
  attachment: PendencyAttachmentDraft,
): attachment is PendencyAttachmentPending {
  return "pending" in attachment && attachment.pending === true;
}

export function getAttachmentPreviewUrl(
  attachment: PendencyAttachmentDraft,
): string {
  return isPendingAttachment(attachment) ? attachment.dataUrl : attachment.url;
}

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

/** Valores do formulário/modal (anexos podem estar pendentes de upload). */
export type PendencyFormValues = Omit<Pendency, "attachments"> & {
  attachments: PendencyAttachmentDraft[];
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
  audience?: PendencyAudience | null;
  professorResponsible?: string | null;
  dueDate?: string | null;
  recurrence?: PendencyRecurrence;
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
  "extensivo",
  "extensivo_performance",
  "internato",
  "medical_life_hacks_ps",
  "radio",
  "revalida",
  "usa",
  "clinicof",
  "concursus",
] as const;

export const PENDENCY_AREA_KEYS: readonly PendencyAreaKey[] = [
  "go",
  "ped",
  "prev",
  "cir",
  "cm",
] as const;

export const PENDENCY_AREA_LABELS: Record<PendencyAreaKey, string> = {
  go: "GO",
  ped: "PED",
  prev: "PREV",
  cir: "CIR",
  cm: "CM",
};

export const PENDENCY_AREA_FULL_LABELS: Record<PendencyAreaKey, string> = {
  go: "Ginecologia e Obstetrícia",
  ped: "Pediatria",
  prev: "Preventiva",
  cir: "Cirurgia",
  cm: "Clínica Médica",
};

export const PENDENCY_AREA_BUTTON_STYLES: Record<PendencyAreaKey, string> = {
  go: "bg-pink-500 text-white",
  ped: "bg-amber-400 text-gray-900",
  prev: "bg-emerald-600 text-white",
  cir: "bg-sky-500 text-white",
  cm: "bg-red-600 text-white",
};

export const PENDENCY_AREA_BUTTON_SELECTED_STYLES: Record<
  PendencyAreaKey,
  string
> = {
  go: "bg-pink-700 text-white",
  ped: "bg-amber-600 text-gray-900",
  prev: "bg-emerald-800 text-white",
  cir: "bg-sky-700 text-white",
  cm: "bg-red-800 text-white",
};

export const PENDENCY_AUDIENCES: readonly PendencyAudience[] = [
  "design",
  "medical_team",
] as const;

export const PENDENCY_AUDIENCE_LABELS: Record<PendencyAudience, string> = {
  design: "Design",
  medical_team: "Equipe Médica",
};

export const PENDENCY_RECURRENCES: readonly PendencyRecurrence[] = [
  "none",
  "weekly",
  "monthly",
] as const;

export const PENDENCY_RECURRENCE_LABELS: Record<PendencyRecurrence, string> = {
  none: "N/A",
  weekly: "Semanal",
  monthly: "Mensal",
};

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
  extensivo: "Extensivo",
  extensivo_performance: "Extensivo performance",
  internato: "Internato",
  medical_life_hacks_ps: "Medical Life Hacks - PS",
  radio: "Rádio",
  revalida: "Revalida",
  usa: "USA",
  clinicof: "Clinicof",
  concursus: "ConcurSUS",
};

/** Cores das barrinhas de meta no calendário (sincronizadas com a lista do chat). */
export const PENDENCY_PROJECT_BAR_HEX: Record<PendencyProjectKey, string> = {
  extensivo: "#dc2626",
  extensivo_performance: "#c026d3",
  internato: "#7c3aed",
  medical_life_hacks_ps: "#c084fc",
  radio: "#78716c",
  revalida: "#2563eb",
  usa: "#dc2626",
  clinicof: "#0891b2",
  concursus: "#ea580c",
};

export const PENDENCY_PROJECT_STYLES: Record<
  PendencyProjectKey,
  { badgeOnLight: string; badgeOnDark: string }
> = {
  extensivo: {
    badgeOnLight: "bg-violet-100 text-violet-700 border-violet-200",
    badgeOnDark: "bg-violet-500/25 text-violet-200 border-violet-400/40",
  },
  extensivo_performance: {
    badgeOnLight: "bg-purple-100 text-purple-700 border-purple-200",
    badgeOnDark: "bg-purple-500/25 text-purple-200 border-purple-400/40",
  },
  internato: {
    badgeOnLight: "bg-sky-100 text-sky-700 border-sky-200",
    badgeOnDark: "bg-sky-500/20 text-sky-200 border-sky-400/35",
  },
  medical_life_hacks_ps: {
    badgeOnLight: "bg-emerald-100 text-emerald-700 border-emerald-200",
    badgeOnDark: "bg-emerald-500/20 text-emerald-200 border-emerald-400/35",
  },
  radio: {
    badgeOnLight: "bg-amber-100 text-amber-700 border-amber-200",
    badgeOnDark: "bg-amber-500/20 text-amber-200 border-amber-400/35",
  },
  revalida: {
    badgeOnLight: "bg-rose-100 text-rose-700 border-rose-200",
    badgeOnDark: "bg-rose-500/20 text-rose-200 border-rose-400/35",
  },
  usa: {
    badgeOnLight: "bg-pink-100 text-pink-700 border-pink-200",
    badgeOnDark: "bg-pink-500/20 text-pink-200 border-pink-400/35",
  },
  clinicof: {
    badgeOnLight: "bg-cyan-100 text-cyan-700 border-cyan-200",
    badgeOnDark: "bg-cyan-500/20 text-cyan-200 border-cyan-400/35",
  },
  concursus: {
    badgeOnLight: "bg-orange-100 text-orange-700 border-orange-200",
    badgeOnDark: "bg-orange-500/20 text-orange-200 border-orange-400/35",
  },
};

export const DEFAULT_AREA_KEY = "default";

/** Área padrão para novos formulários do calendário. */
export const CALENDAR_DEFAULT_AREA_KEY: PendencyAreaKey = "cm";

export const DEFAULT_AREA_TITLE = "Clínica Médica";

export const DEFAULT_PROJECT_KEY: PendencyProjectKey = "extensivo";

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
  overrides?: Partial<PendencyFormValues>,
): PendencyFormValues {
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
    audience: null,
    professorResponsible: null,
    dueDate: null,
    recurrence: "none",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/** Rascunho do formulário de pendência no calendário. */
export type CalendarPendencyDraft = {
  area: PendencyAreaKey | null;
  audience: PendencyAudience | null;
  description: string;
  dueDate: string;
  recurrence: PendencyRecurrence;
  professorResponsible: string;
};

/**
 * Rascunho vazio para coluna do modal de pendência no calendário.
 */
export function createEmptyCalendarPendencyDraft(
  defaultAudience: PendencyAudience,
): CalendarPendencyDraft {
  return {
    area: null,
    audience: defaultAudience,
    description: "",
    dueDate: "",
    recurrence: "none",
    professorResponsible: "",
  };
}

/**
 * Remove tags HTML e retorna texto plano.
 */
export function stripHtmlToPlainText(input: string): string {
  return input
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

/**
 * Verifica se conteúdo HTML/rich text está vazio.
 */
export function isRichTextEmpty(html: string): boolean {
  return stripHtmlToPlainText(html).length === 0;
}

/**
 * Deriva título da pendência a partir do rascunho do calendário.
 */
export function titleFromCalendarDraft(draft: CalendarPendencyDraft): string {
  const plain = stripHtmlToPlainText(draft.description);
  const firstLine = plain.split("\n")[0]?.trim();
  if (firstLine) return firstLine.slice(0, 500);
  const areaLabel = draft.area ? PENDENCY_AREA_LABELS[draft.area] : "Pendência";
  const audienceLabel = draft.audience
    ? PENDENCY_AUDIENCE_LABELS[draft.audience]
    : "";
  return `${areaLabel}${audienceLabel ? ` — ${audienceLabel}` : ""}`.slice(0, 500);
}

/**
 * Texto curto para exibição no card do Kanban.
 */
export function getPendencyCardExcerpt(pendency: Pendency): string | null {
  const plain = stripHtmlToPlainText(pendency.descriptionMarkdown);
  if (plain) return plain.split("\n")[0] ?? null;
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
