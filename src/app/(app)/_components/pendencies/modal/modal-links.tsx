"use client";

import { useState } from "react";

import type { PendencyLink } from "~/shared/pendency";

type ModalLinksProps = {
  links: PendencyLink[];
  onChange: (links: PendencyLink[]) => void;
};

/**
 * Links úteis associados à pendência.
 */
export function ModalLinks({ links, onChange }: ModalLinksProps) {
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
    } catch {
      window.alert("Informe uma URL válida (ex.: https://…)");
      return;
    }
    onChange([
      ...links,
      {
        id: crypto.randomUUID(),
        url: trimmed,
        label: label.trim() || undefined,
      },
    ]);
    setUrl("");
    setLabel("");
  };

  const remove = (id: string) => {
    onChange(links.filter((l) => l.id !== id));
  };

  return (
    <section className="border-t border-sidebar-border pt-5">
      <div className="mb-3 flex items-center gap-2">
        <LinkIcon />
        <h3 className="text-sm font-semibold text-white">Links</h3>
      </div>

      <form onSubmit={handleAdd} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-shell/50 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-brand/40 focus:outline-none"
        />
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Rótulo (opcional)"
          className="sm:w-40 rounded-lg border border-white/10 bg-shell/50 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-brand/40 focus:outline-none"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
        >
          Adicionar
        </button>
      </form>

      {links.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {links.map((link) => (
            <li
              key={link.id}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-shell/40 px-3 py-2"
            >
              <LinkIcon small />
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 truncate text-sm text-brand-bright hover:underline"
              >
                {link.label ?? link.url}
              </a>
              <button
                type="button"
                onClick={() => remove(link.id)}
                className="shrink-0 text-white/40 hover:text-white"
                aria-label="Remover link"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function LinkIcon({ small }: { small?: boolean }) {
  const size = small ? 14 : 16;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="shrink-0 text-white/50"
      aria-hidden
    >
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  );
}
