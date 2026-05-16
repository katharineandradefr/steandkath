"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Pendências" },
  { href: "/explorar", label: "Explorar" },
  { href: "/aprendizado", label: "Aprendizado" },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-4 py-5">
        <Image
          src="/header-logo.svg"
          alt="Logo"
          width={40}
          height={40}
          className="h-10 w-10"
        />
        <span className="font-semibold tracking-tight text-white">
          <span className="text-brand-bright">Vibe</span> coding
        </span>
      </div>
      <nav className="flex flex-col gap-1 p-3" aria-label="Principal">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                isActive
                  ? "rounded-lg border border-brand/35 bg-brand/20 px-3 py-2 text-sm font-medium text-white shadow-[0_0_24px_-8px_var(--color-brand)]"
                  : "rounded-lg px-3 py-2 text-sm font-medium text-white/65 transition hover:bg-white/8 hover:text-white"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
