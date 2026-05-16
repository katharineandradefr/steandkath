"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ModalDescriptionProps = {
  value: string;
  onChange: (value: string) => void;
};

/**
 * Descrição em Markdown com abas Editar / Pré-visualizar.
 */
export function ModalDescription({ value, onChange }: ModalDescriptionProps) {
  const [tab, setTab] = useState<"edit" | "preview">("edit");

  return (
    <section className="border-t border-sidebar-border pt-5">
      <div className="mb-3 flex items-center gap-2">
        <LinesIcon />
        <h3 className="text-sm font-semibold text-white">Descrição</h3>
      </div>
      <div className="mb-2 flex gap-1">
        <TabButton active={tab === "edit"} onClick={() => setTab("edit")}>
          Editar
        </TabButton>
        <TabButton active={tab === "preview"} onClick={() => setTab("preview")}>
          Pré-visualizar
        </TabButton>
      </div>
      {tab === "edit" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          placeholder="Detalhe a tarefa em Markdown…"
          className="w-full resize-y rounded-lg border border-white/10 bg-shell/50 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      ) : (
        <div className="prose prose-invert prose-sm max-w-none rounded-lg border border-white/10 bg-shell/40 px-3 py-2 text-white/90 [&_a]:text-brand-bright [&_ul]:list-disc [&_ul]:pl-5">
          {value.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-sm text-white/40 italic">Nada para exibir.</p>
          )}
        </div>
      )}
    </section>
  );
}

function TabButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium text-white"
          : "rounded-md px-2.5 py-1 text-xs text-white/50 transition hover:text-white/80"
      }
    >
      {children}
    </button>
  );
}

function LinesIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-white/50"
      aria-hidden
    >
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  );
}
