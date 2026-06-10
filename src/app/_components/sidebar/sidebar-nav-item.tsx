"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, type LucideIcon } from "lucide-react";

type SidebarNavItemProps = {
  label: string;
  expanded: boolean;
  isActive?: boolean;
  icon?: LucideIcon;
  useLogo?: boolean;
  showChevronWhenExpanded?: boolean;
  href?: string;
  onClick?: () => void;
  ariaLabel?: string;
  ariaExpanded?: boolean;
};

const itemBaseClass =
  "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sidebar-icon transition-[color,background-color] duration-200 ease-out hover:bg-sidebar-item-hover hover:text-sidebar-icon-hover active:text-sidebar-icon focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-icon-active";

const itemActiveClass =
  "bg-sidebar-item-hover/40 text-sidebar-icon-active hover:text-sidebar-icon-active";

/**
 * Um item da sidebar (link ou botão) com estados hover, active e colapso.
 */
export function SidebarNavItem({
  label,
  expanded,
  isActive = false,
  icon: Icon,
  useLogo = false,
  showChevronWhenExpanded = false,
  href,
  onClick,
  ariaLabel,
  ariaExpanded,
}: SidebarNavItemProps) {
  const layoutClass = expanded ? "justify-start gap-3 px-3" : "justify-center gap-0 px-2";
  const className = `${itemBaseClass} ${layoutClass}${isActive ? ` ${itemActiveClass}` : ""}`;

  const iconSlot = useLogo ? (
    <Image
      src="/dr-cof-sidebar.svg"
      alt=""
      width={28}
      height={28}
      className="h-7 w-7 shrink-0"
      aria-hidden
    />
  ) : Icon ? (
    <Icon className="h-6 w-6 shrink-0" strokeWidth={2} aria-hidden />
  ) : null;

  const labelSlot = (
    <span
      className={`truncate text-sm font-medium overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-300 ease-in-out ${
        expanded
          ? "max-w-36 opacity-100 delay-75"
          : "pointer-events-none max-w-0 opacity-0 delay-0"
      }`}
    >
      {label}
    </span>
  );

  const chevron =
    showChevronWhenExpanded && expanded ? (
      <ChevronLeft className="ml-auto h-4 w-4 shrink-0 opacity-80" aria-hidden />
    ) : null;

  const content = (
    <>
      {iconSlot}
      {labelSlot}
      {chevron}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className} aria-current={isActive ? "page" : undefined}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      aria-label={ariaLabel ?? label}
      aria-expanded={ariaExpanded}
    >
      {content}
    </button>
  );
}
