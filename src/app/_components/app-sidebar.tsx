"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Início" },
  { href: "/explorar", label: "Explorar" },
  { href: "/aprendizado", label: "Aprendizado" },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-white/10 bg-[#1a0f35]">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-5">
        <Image
          src="/header-logo.svg"
          alt="Logo"
          width={40}
          height={40}
          className="h-10 w-10"
        />
        <span className="font-semibold text-white">Vibe coding</span>
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
                  ? "rounded-lg bg-white/15 px-3 py-2 text-sm font-medium text-white"
                  : "rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
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
