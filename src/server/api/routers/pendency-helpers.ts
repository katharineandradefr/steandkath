import type { PendencyDoc } from "~/server/db/models/pendency";
import { storage } from "~/server/storage";
import type {
  Pendency,
  PendencyAttachment,
  PendencyAttachmentDraft,
} from "~/shared/pendency";
import { isPendingAttachment } from "~/shared/pendency";

const MAX_ATTACHMENTS = 8;

type PendingAttachmentInput = {
  id: string;
  fileName: string;
  dataUrl: string;
  size: number;
  mimeType: string;
  pending: true;
};

type SavedAttachmentInput = {
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

/**
 * Extrai o excerto legado da primeira linha do markdown.
 */
export function excerptFromMarkdown(input: string): string | null {
  const stripped = input
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  const line = stripped.split("\n")[0]?.trim() ?? "";
  return line.length > 0 ? line : null;
}

/**
 * Converte documento Mongoose para o tipo de domínio Pendency.
 */
export function docToPendency(doc: PendencyDoc): Pendency {
  return {
    id: doc.id,
    areaKey: doc.areaKey,
    title: doc.title,
    description: doc.description ?? null,
    descriptionMarkdown: doc.descriptionMarkdown,
    projectKey: doc.projectKey,
    status: doc.status,
    urgency: doc.urgency,
    position: doc.position,
    attachments: doc.attachments.map((a) => ({
      id: a.id,
      fileName: a.fileName,
      url: a.url,
      publicId: a.publicId,
      provider: a.provider,
      mimeType: a.mimeType,
      size: a.size,
      width: a.width ?? undefined,
      height: a.height ?? undefined,
      createdAt: a.createdAt,
    })),
    links: doc.links.map((l) => ({
      id: l.id,
      url: l.url,
      label: l.label ?? undefined,
    })),
    checklist: doc.checklist.map((c) => ({
      id: c.id,
      text: c.text,
      checked: c.checked,
    })),
    audience: doc.audience ?? null,
    professorResponsible: doc.professorResponsible ?? null,
    directResponsibleId: doc.directResponsibleId ?? null,
    dueDate: doc.dueDate ? doc.dueDate.toISOString() : null,
    recurrence: doc.recurrence ?? "none",
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

/**
 * Processa anexos do payload: faz upload dos pendentes e preserva os existentes.
 */
export async function resolveAttachments(
  drafts: PendencyAttachmentDraft[],
): Promise<PendencyAttachment[]> {
  if (drafts.length > MAX_ATTACHMENTS) {
    throw new Error(`Máximo de ${MAX_ATTACHMENTS} anexos por pendência.`);
  }

  const resolved: PendencyAttachment[] = [];

  for (const draft of drafts) {
    if (isPendingAttachment(draft)) {
      const uploaded = await storage.upload({
        dataUrl: draft.dataUrl,
        fileName: draft.fileName,
      });
      resolved.push({
        id: draft.id,
        fileName: uploaded.fileName,
        url: uploaded.secureUrl,
        publicId: uploaded.publicId,
        provider: uploaded.provider,
        mimeType: uploaded.mimeType,
        size: uploaded.size,
        width: uploaded.width,
        height: uploaded.height,
        createdAt: new Date().toISOString(),
      });
      continue;
    }

    resolved.push({
      id: draft.id,
      fileName: draft.fileName,
      url: draft.url,
      publicId: draft.publicId,
      provider: draft.provider,
      mimeType: draft.mimeType,
      size: draft.size,
      width: draft.width,
      height: draft.height,
      createdAt: draft.createdAt,
    });
  }

  return resolved;
}

/**
 * Remove do storage os anexos que saíram do array final.
 */
export async function deleteRemovedAttachments(
  previous: PendencyAttachment[],
  next: PendencyAttachment[],
): Promise<void> {
  const nextPublicIds = new Set(next.map((a) => a.publicId));
  const toDelete = previous.filter((a) => !nextPublicIds.has(a.publicId));

  await Promise.all(
    toDelete.map((a) => storage.delete(a.publicId).catch(() => undefined)),
  );
}

/**
 * Remove todos os anexos de uma pendência do storage.
 */
export async function deleteAllAttachments(
  attachments: PendencyAttachment[],
): Promise<void> {
  await Promise.all(
    attachments.map((a) => storage.delete(a.publicId).catch(() => undefined)),
  );
}

export type { PendingAttachmentInput, SavedAttachmentInput };
