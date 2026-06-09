"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { CONVERSATIONS } from "../chat-data";
import { api } from "~/trpc/react";

type Props = {
  /** Callback chamado quando o usuário clica no nome de um contato da lista */
  onSelectConversation: (conversationId: string) => void;
};

/**
 * Sub-painel: lista de cursos coloridos com usuários para envio em massa.
 * Clicar em um usuário abre o chat daquela pessoa.
 */
export function ListasPanel({ onSelectConversation }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { data: courses, isLoading } = api.course.list.useQuery({ activeOnly: true });

  function handleUserClick(userName: string) {
    const conv = CONVERSATIONS.find(
      (c) => c.name.toLowerCase() === userName.toLowerCase(),
    );
    if (conv) onSelectConversation(conv.id);
  }

  if (isLoading) {
    return (
      <p className="px-2 text-xs text-calendar-muted">Carregando cursos…</p>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <p className="px-2 text-xs text-calendar-muted">
        Nenhum curso ativo cadastrado.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {courses.map((course) => (
        <div key={course.id}>
          <button
            type="button"
            onClick={() =>
              setExpanded((prev) => (prev === course.id ? null : course.id))
            }
            className="flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-left text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: course.bg }}
          >
            {course.name}
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                expanded === course.id ? "rotate-180" : ""
              }`}
            />
          </button>

          <div
            className={`overflow-hidden transition-all duration-200 ${
              expanded === course.id ? "max-h-40" : "max-h-0"
            }`}
          >
            <div className="mt-1 flex flex-col gap-1 rounded-lg bg-white/85 p-2">
              {course.users.length === 0 ? (
                <p className="px-2 py-1 text-xs text-gray-500">
                  Nenhum usuário vinculado.
                </p>
              ) : (
                course.users.map((user) => (
                  <div
                    key={user}
                    className="flex items-center justify-between rounded px-2 py-1.5 transition-colors hover:bg-gray-100"
                  >
                    <button
                      type="button"
                      onClick={() => handleUserClick(user)}
                      className="text-xs font-medium text-[#5B0A0A] hover:underline"
                    >
                      {user}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUserClick(user)}
                      className="text-xs text-gray-500 hover:text-[#5B0A0A] hover:underline"
                    >
                      Enviar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
