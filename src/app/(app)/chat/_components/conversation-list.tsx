"use client";

import { useState } from "react";
import { ChevronDown, Search, Users } from "lucide-react";

import type { Conversation } from "./chat-types";

type Props = {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
};

type FilterTab = "todos" | "diretos" | "grupos";

function ConversationAvatar({ conv }: { conv: Conversation }) {
  return (
    <div className="relative shrink-0">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
        style={{ backgroundColor: conv.avatarColor }}
      >
        {conv.isGroup ? <Users className="h-5 w-5" /> : conv.initials}
      </div>
      {conv.online && !conv.isGroup && (
        <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-[#D9D9D9] bg-green-500" />
      )}
    </div>
  );
}

function ConversationItem({
  conv,
  isActive,
  onSelect,
}: {
  conv: Conversation;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-black/10 ${
          isActive ? "bg-black/15" : ""
        }`}
      >
        <ConversationAvatar conv={conv} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-800">{conv.name}</p>
          <p className="truncate text-xs text-gray-500">{conv.preview}</p>
        </div>
        {!!conv.unreadCount && (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
            {conv.unreadCount}
          </span>
        )}
      </button>
    </li>
  );
}

/**
 * Painel esquerdo: lista de conversas com busca, filtro de tipo e seção
 * "Em Atendimento" sempre no topo com opção de minimizar.
 */
export function ConversationList({ conversations, activeId, onSelect }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("todos");
  const [atendimentoCollapsed, setAtendimentoCollapsed] = useState(false);

  const TABS: { id: FilterTab; label: string }[] = [
    { id: "todos", label: "Todos" },
    { id: "diretos", label: "Diretos" },
    { id: "grupos", label: "Grupos" },
  ];

  const bySearch = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const byFilter = bySearch.filter((c) => {
    if (filter === "grupos") return c.isGroup;
    if (filter === "diretos") return !c.isGroup;
    return true;
  });

  const atendimento = byFilter.filter((c) => c.conversationStatus === "em-atendimento");
  const outros = byFilter.filter((c) => c.conversationStatus !== "em-atendimento");

  return (
    <aside className="flex w-72 shrink-0 flex-col bg-[#D9D9D9]">
      {/* Busca */}
      <div className="p-3 pb-1">
        <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2">
          <input
            type="text"
            placeholder="Buscar conversa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
          <Search className="h-4 w-4 shrink-0 text-[#5B0A0A]" />
        </div>
      </div>

      {/* Filtro de tabs */}
      <div className="flex gap-1 px-3 py-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
              filter === tab.id
                ? "bg-[#5B0A0A] text-white"
                : "bg-white/60 text-gray-600 hover:bg-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Lista com scroll */}
      <ul className="flex-1 overflow-y-auto">
        {/* Seção: Em Atendimento */}
        {atendimento.length > 0 && (
          <>
            <li>
              <button
                type="button"
                onClick={() => setAtendimentoCollapsed((p) => !p)}
                className="flex w-full items-center gap-2 bg-[#5B0A0A]/10 px-4 py-2 text-left"
              >
                <span className="flex-1 text-xs font-semibold uppercase tracking-wide text-[#5B0A0A]">
                  Em Atendimento
                </span>
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#5B0A0A] text-[10px] font-bold text-white">
                  {atendimento.length}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-[#5B0A0A] transition-transform duration-200 ${
                    atendimentoCollapsed ? "-rotate-90" : ""
                  }`}
                />
              </button>
            </li>
            {!atendimentoCollapsed &&
              atendimento.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  isActive={activeId === conv.id}
                  onSelect={() => onSelect(conv.id)}
                />
              ))}
          </>
        )}

        {/* Seção: demais conversas */}
        {outros.length > 0 && (
          <>
            {atendimento.length > 0 && (
              <li>
                <div className="px-4 py-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Outras
                  </span>
                </div>
              </li>
            )}
            {outros.map((conv) => (
              <ConversationItem
                key={conv.id}
                conv={conv}
                isActive={activeId === conv.id}
                onSelect={() => onSelect(conv.id)}
              />
            ))}
          </>
        )}

        {byFilter.length === 0 && (
          <li className="px-4 py-6 text-center text-xs text-gray-400">
            Nenhuma conversa encontrada.
          </li>
        )}
      </ul>
    </aside>
  );
}
