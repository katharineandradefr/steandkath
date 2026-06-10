"use client";

import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

import { SidebarNavItem } from "~/app/_components/sidebar/sidebar-nav-item";
import { SIDEBAR_NAV_ITEMS } from "~/app/_components/sidebar/sidebar-nav";

type AppSidebarProps = {
  expanded: boolean;
  onToggle: () => void;
  onMouseLeave?: () => void;
};

/**
 * Sidebar fixa à esquerda: colapsada (ícones) ou expandida (ícones + labels).
 */
export function AppSidebar({ expanded, onToggle, onMouseLeave }: AppSidebarProps) {
  const pathname = usePathname();

  const visibleItems = SIDEBAR_NAV_ITEMS.filter((item) => !item.disabled);

  const isItemActive = (href: string | undefined) => {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleSignOut = () => {
    void signOut({ callbackUrl: "/" });
  };

  return (
    <aside
      className="sidebar-panel fixed inset-y-0 left-0 z-40 flex flex-col rounded-tr-2xl rounded-br-2xl bg-sidebar-panel py-4 shadow-lg"
      aria-label="Navegação principal"
      onMouseLeave={onMouseLeave}
    >
      <nav className="flex flex-1 flex-col gap-1 px-2">
        {visibleItems.map((item) => {
          if (item.kind === "toggle") {
            return (
              <SidebarNavItem
                key={item.id}
                label={item.label}
                expanded={expanded}
                icon={item.icon}
                showChevronWhenExpanded
                onClick={onToggle}
                ariaLabel={expanded ? "Fechar menu" : "Abrir menu"}
                ariaExpanded={expanded}
              />
            );
          }

          if (item.kind === "action" && item.id === "sair") {
            return (
              <SidebarNavItem
                key={item.id}
                label={item.label}
                expanded={expanded}
                icon={item.icon}
                onClick={handleSignOut}
              />
            );
          }

          if (item.kind === "link" && item.href) {
            return (
              <SidebarNavItem
                key={item.id}
                label={item.label}
                expanded={expanded}
                href={item.href}
                icon={item.icon}
                useLogo={item.useLogo}
                isActive={isItemActive(item.href)}
              />
            );
          }

          return null;
        })}
      </nav>
    </aside>
  );
}
