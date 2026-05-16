import type { Pendency } from "~/shared/pendency";
import { DEFAULT_AREA_KEY } from "~/shared/pendency";

const now = new Date().toISOString();

const emptyExtras = {
  descriptionMarkdown: "",
  projectKey: "extensivo_27" as const,
  attachments: [] as Pendency["attachments"],
  links: [] as Pendency["links"],
  checklist: [] as Pendency["checklist"],
};

/**
 * Dados iniciais para o protótipo UI (sem persistência).
 */
export const MOCK_PENDENCIES: Pendency[] = [
  {
    id: "p1",
    areaKey: DEFAULT_AREA_KEY,
    title: "Revisar ficha de Clínica Médica — módulo 3",
    description: "Conferir alinhamento com o PDF enviado pelo coordenador.",
    descriptionMarkdown:
      "Conferir alinhamento com o PDF enviado pelo coordenador.\n\n- Validar diagramas\n- Confirmar nomenclatura",
    projectKey: "internato",
    status: "pending",
    urgency: "high",
    position: 0,
    attachments: [],
    links: [
      {
        id: "l1",
        url: "https://example.com/ficha-modulo-3",
        label: "PDF do coordenador",
      },
    ],
    checklist: [
      { id: "c1", text: "Ler material base", checked: true },
      { id: "c2", text: "Anotar divergências", checked: false },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "p2",
    areaKey: DEFAULT_AREA_KEY,
    title: "Criar resumo da aula de semiologia",
    ...emptyExtras,
    projectKey: "extensivo_27",
    status: "pending",
    urgency: "medium",
    position: 1,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "p3",
    areaKey: DEFAULT_AREA_KEY,
    title: "Ajustar capa do material impresso",
    ...emptyExtras,
    projectKey: "usa_fichas",
    status: "pending",
    urgency: "low",
    position: 2,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "p4",
    areaKey: DEFAULT_AREA_KEY,
    title: "Revisão de slides — aula 12",
    description: "Luis deve validar antes de enviar ao design.",
    descriptionMarkdown: "Luis deve validar antes de enviar ao design.",
    projectKey: "internato",
    status: "in_review",
    urgency: "high",
    position: 0,
    attachments: [],
    links: [],
    checklist: [
      { id: "c3", text: "Revisar ortografia", checked: true },
      { id: "c4", text: "Validar imagens", checked: true },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "p5",
    areaKey: DEFAULT_AREA_KEY,
    title: "Corrigir diagrama do fluxo de atendimento",
    ...emptyExtras,
    projectKey: "extensivo_27",
    status: "in_review",
    urgency: "medium",
    position: 1,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "p6",
    areaKey: DEFAULT_AREA_KEY,
    title: "Padronizar ícones das fichas",
    ...emptyExtras,
    status: "fixed",
    urgency: "low",
    position: 0,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "p7",
    areaKey: DEFAULT_AREA_KEY,
    title: "Exportar versão final do caderno de questões",
    ...emptyExtras,
    projectKey: "usa_fichas",
    status: "fixed",
    urgency: "medium",
    position: 1,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "p8",
    areaKey: DEFAULT_AREA_KEY,
    title: "Atualizar paleta de cores do módulo introdutório",
    ...emptyExtras,
    status: "fixed",
    urgency: "high",
    position: 2,
    createdAt: now,
    updatedAt: now,
  },
];
