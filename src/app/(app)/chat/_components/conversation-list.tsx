"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import type { Conversation } from "./chat-types";

type Props = {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
};

function ConversationAvatar({ conv }: { conv: Conversation }) {
  return (
    <div className="relative shrink-0">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
        style={{ backgroundColor: conv.avatarColor }}
      >
        {conv.initials}
      </div>
      {conv.online && (
        <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-[#D9D9D9] bg-green-500" />
      )}
    </div>
  );
}

/**
 * Painel esquerdo: lista de conversas com busca e badge de notificação.
 */
export function ConversationList({ conversations, activeId, onSelect }: Props) {
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <aside className="flex w-72 shrink-0 flex-col bg-[#D9D9D9]">
      <div className="p-3">
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

      <ul className="flex-1 overflow-y-auto">
        {filtered.map((conv) => (
          <li key={conv.id}>
            <button
              type="button"
              onClick={() => onSelect(conv.id)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-black/10 ${
                activeId === conv.id ? "bg-black/15" : ""
              }`}
            >
              <ConversationAvatar conv={conv} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-800">
                  {conv.name}
                </p>
                <p className="truncate text-xs text-gray-500">{conv.preview}</p>
              </div>
              {!!conv.unreadCount && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                  {conv.unreadCount}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
