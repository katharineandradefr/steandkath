import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  CircleAlert,
  HelpCircle,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  UserCircle,
} from "lucide-react";

export type SidebarNavItemKind = "toggle" | "link" | "action";

export type SidebarNavItemConfig = {
  id: string;
  label: string;
  kind: SidebarNavItemKind;
  href?: string;
  icon?: LucideIcon;
  useLogo?: boolean;
  disabled?: boolean;
};

/**
 * Itens da sidebar na ordem do layout (Menu → … → Configurações).
 * Itens com disabled não são renderizados.
 */
export const SIDEBAR_NAV_ITEMS: SidebarNavItemConfig[] = [
  { id: "menu", label: "Menu", kind: "toggle", icon: Menu },
  { id: "perfil", label: "Perfil", kind: "link", href: "/perfil", icon: UserCircle },
  { id: "chat", label: "Chat", kind: "link", href: "/chat", icon: MessageSquare },
  {
    id: "pendencias",
    label: "Pendências",
    kind: "link",
    href: "/",
    icon: CircleAlert,
  },
  {
    id: "calendario",
    label: "Calendário",
    kind: "link",
    href: "/calendario",
    icon: CalendarDays,
  },
  { id: "dr-cof", label: "Dr. Cof", kind: "link", href: "/dr-cof", useLogo: true },
  {
    id: "faq",
    label: "Perguntas Freq.",
    kind: "link",
    href: "/faq",
    icon: HelpCircle,
  },
  { id: "sair", label: "Sair", kind: "action", icon: LogOut },
  {
    id: "configuracoes",
    label: "Configurações",
    kind: "link",
    href: "/configuracoes",
    icon: Settings,
  },
];

export const SIDEBAR_WIDTH_COLLAPSED_PX = 72;
export const SIDEBAR_WIDTH_EXPANDED_PX = 220;
