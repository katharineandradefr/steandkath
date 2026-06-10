"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useActiveUser } from "~/app/_components/active-user-provider";

/**
 * Banner pedindo salvar o cargo no Perfil antes de usar a plataforma.
 */
export function ProfileSetupBanner() {
  const pathname = usePathname();
  const { needsProfileSetup } = useActiveUser();

  if (!needsProfileSetup || pathname === "/perfil") return null;

  return (
    <div
      role="status"
      className="mb-4 rounded-xl border border-amber-300/40 bg-amber-500/15 px-4 py-3 text-sm text-amber-100"
    >
      Salve seu cargo no{" "}
      <Link
        href="/perfil"
        className="font-semibold underline underline-offset-2 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
      >
        Perfil
      </Link>{" "}
      para usar a plataforma com as permissões corretas.
    </div>
  );
}
