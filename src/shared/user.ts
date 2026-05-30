import type { PendencyAreaKey, PendencyProjectKey } from "~/shared/pendency";

export type UserRole =
  | "designer_1"
  | "designer"
  | "coordinator"
  | "sub_coordinator";

export const USER_ROLES: readonly UserRole[] = [
  "designer_1",
  "designer",
  "sub_coordinator",
  "coordinator",
] as const;

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  designer_1: "Designer 1",
  designer: "Designer",
  sub_coordinator: "Subcordenador",
  coordinator: "Cordenador Responsável",
};

export type User = {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone?: string | null;
  projects: PendencyProjectKey[];
  area?: PendencyAreaKey | null;
  photoBase64?: string | null;
  createdAt: string;
  updatedAt: string;
};
