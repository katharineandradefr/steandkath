"use client";

import { useState } from "react";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type EditorTheme = "light" | "dark";

type DescriptionRichEditorProps = {
  onChange: (html: string) => void;
  initialValue?: string;
  placeholder?: string;
  theme?: EditorTheme;
};

const HTML_TAG_PATTERN = /<[a-z][\s\S]*>/i;

/**
 * Escapa caracteres especiais para inserir texto legado como HTML seguro.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Converte conteúdo legado (markdown/texto) ou HTML TipTap para o editor.
 */
function toEditorContent(initialValue?: string): string {
  const trimmed = initialValue?.trim() ?? "";
  if (!trimmed) return "";
  if (HTML_TAG_PATTERN.test(trimmed)) return trimmed;
  const escaped = escapeHtml(trimmed).replace(/\n/g, "<br>");
  return `<p>${escaped}</p>`;
}

function getEditorContentClass(theme: EditorTheme): string {
  const base =
    "min-h-[120px] w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none " +
    "[&_.tiptap]:min-h-[100px] [&_.tiptap]:outline-none " +
    "[&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-5 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-5 " +
    "[&_.tiptap_h1]:text-xl [&_.tiptap_h1]:font-bold [&_.tiptap_h1]:mt-2 [&_.tiptap_h1]:mb-1 " +
    "[&_.tiptap_h2]:text-base [&_.tiptap_h2]:font-bold [&_.tiptap_h2]:mt-2 [&_.tiptap_h2]:mb-1 " +
    "[&_.tiptap_p.is-editor-empty:first-child]:before:pointer-events-none [&_.tiptap_p.is-editor-empty:first-child]:before:float-left [&_.tiptap_p.is-editor-empty:first-child]:before:h-0 [&_.tiptap_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]";

  if (theme === "dark") {
    return (
      base +
      " border-white/10 bg-shell/50 text-white " +
      "focus-within:border-brand/40 focus-within:ring-2 focus-within:ring-brand/20 " +
      "[&_.tiptap_p.is-editor-empty:first-child]:before:text-white/35"
    );
  }

  return (
    base +
    " border-gray-200 bg-gray-100 text-gray-900 " +
    "focus-within:border-calendar-cardinal focus-within:ring-1 focus-within:ring-calendar-cardinal " +
    "[&_.tiptap_p.is-editor-empty:first-child]:before:text-gray-400"
  );
}

function getLoadingClass(theme: EditorTheme): string {
  if (theme === "dark") {
    return "min-h-[120px] rounded-xl border border-white/10 bg-shell/50 px-3 py-2.5 text-sm text-white/35";
  }
  return "min-h-[120px] rounded-xl border border-gray-200 bg-gray-100 px-3 py-2.5 text-sm text-gray-400";
}

function getTooltipClass(theme: EditorTheme): string {
  if (theme === "dark") {
    return "absolute bottom-full left-0 mb-1 rounded-md border border-white/10 bg-shell/80 px-2 py-1 text-xs text-white/60 shadow-sm";
  }
  return "absolute bottom-full left-0 mb-1 rounded-md border border-gray-200 bg-gray-100 px-2 py-1 text-xs text-gray-600 shadow-sm";
}

/**
 * Editor rico WYSIWYG para descrição de pendência (TipTap).
 */
export function DescriptionRichEditor({
  onChange,
  initialValue = "",
  placeholder = "Detalhe a tarefa…",
  theme = "light",
}: DescriptionRichEditorProps) {
  const [, setToolbarTick] = useState(0);
  const editorContentClass = getEditorContentClass(theme);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: toEditorContent(initialValue),
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    onSelectionUpdate: () => {
      setToolbarTick((t) => t + 1);
    },
    onTransaction: () => {
      setToolbarTick((t) => t + 1);
    },
  });

  if (!editor) {
    return <div className={getLoadingClass(theme)}>Carregando editor…</div>;
  }

  return (
    <div>
      <EditorContent editor={editor} className={editorContentClass} />
      <div className="relative mt-2">
        <div className={getTooltipClass(theme)} role="tooltip">
          Clique para formatar o texto
        </div>
        <div className="flex gap-2">
          <ToolbarButton
            label="Lista"
            display="•"
            theme={theme}
            isActive={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
          <ToolbarButton
            label="Lista numerada"
            display="1."
            theme={theme}
            isActive={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />
          <ToolbarButton
            label="Título 1"
            display="T1"
            theme={theme}
            isActive={editor.isActive("heading", { level: 1 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          />
          <ToolbarButton
            label="Título 2"
            display="T2"
            theme={theme}
            isActive={editor.isActive("heading", { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          />
        </div>
      </div>
    </div>
  );
}

type ToolbarButtonProps = {
  label: string;
  display: string;
  theme: EditorTheme;
  isActive: boolean;
  onClick: () => void;
};

function ToolbarButton({
  label,
  display,
  theme,
  isActive,
  onClick,
}: ToolbarButtonProps) {
  const lightClasses = isActive
    ? "border-calendar-cardinal bg-gray-200 shadow-inner ring-1 ring-calendar-cardinal/40 text-calendar-cardinal"
    : "border-calendar-cardinal/30 bg-white text-calendar-cardinal hover:bg-gray-50";

  const darkClasses = isActive
    ? "border-brand bg-white/10 shadow-inner ring-1 ring-brand/40 text-brand-bright"
    : "border-white/20 bg-shell/40 text-brand-bright hover:bg-white/5";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={isActive}
      className={`flex h-7 w-7 items-center justify-center rounded border text-[10px] font-bold transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 ${
        theme === "dark"
          ? `${darkClasses} focus-visible:outline-brand`
          : `${lightClasses} focus-visible:outline-calendar-cardinal`
      }`}
    >
      {display}
    </button>
  );
}
