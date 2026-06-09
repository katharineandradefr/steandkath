export type Course = {
  id: string;
  name: string;
  bg: string;
  users: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

/** Cursos iniciais espelhando a lista do chat. */
export const DEFAULT_COURSES: Omit<Course, "createdAt" | "updatedAt">[] = [
  {
    id: "1",
    name: "EXTENSIVO",
    bg: "#dc2626",
    users: ["Amirah Saleh", "Felipe Daiko", "Henrique Lunarderlli"],
    active: true,
  },
  {
    id: "2",
    name: "INTERNATO",
    bg: "#7c3aed",
    users: ["Darizon Filho", "Stefani Silva"],
    active: true,
  },
  {
    id: "3",
    name: "CONCURSUS",
    bg: "#ea580c",
    users: ["Katharine Andrade", "Lucas Ferreira"],
    active: true,
  },
  {
    id: "4",
    name: "LIFE HACKS PS",
    bg: "#c084fc",
    users: ["Amirah Saleh"],
    active: true,
  },
  {
    id: "5",
    name: "REVALIDA",
    bg: "#2563eb",
    users: ["Felipe Daiko", "Henrique Lunarderlli"],
    active: true,
  },
  {
    id: "6",
    name: "HIIT",
    bg: "#a855f7",
    users: ["Darizon Filho"],
    active: true,
  },
  {
    id: "7",
    name: "ENAMED",
    bg: "#0d9488",
    users: ["Stefani Silva", "Katharine Andrade"],
    active: true,
  },
  {
    id: "8",
    name: "USA",
    bg: "#dc2626",
    users: ["Lucas Ferreira"],
    active: true,
  },
  {
    id: "9",
    name: "COFBET",
    bg: "#9f1239",
    users: ["Amirah Saleh", "Felipe Daiko"],
    active: true,
  },
  {
    id: "10",
    name: "RÁDIO",
    bg: "#78716c",
    users: ["Henrique Lunarderlli"],
    active: true,
  },
];
