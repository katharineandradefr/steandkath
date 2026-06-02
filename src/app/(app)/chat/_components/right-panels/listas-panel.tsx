"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { CONVERSATIONS } from "../chat-data";

type Course = {
  id: string;
  name: string;
  bg: string;
  users: string[];
};

const COURSES: Course[] = [
  { id: "1", name: "EXTENSIVO", bg: "#dc2626", users: ["Amirah Saleh", "Felipe Daiko", "Henrique Lunarderlli"] },
  { id: "2", name: "INTERNATO", bg: "#7c3aed", users: ["Darizon Filho", "Stefani Silva"] },
  { id: "3", name: "CONCURSUS", bg: "#ea580c", users: ["Katharine Andrade", "Lucas Ferreira"] },
  { id: "4", name: "LIFE HACKS PS", bg: "#c084fc", users: ["Amirah Saleh"] },
  { id: "5", name: "REVALIDA", bg: "#2563eb", users: ["Felipe Daiko", "Henrique Lunarderlli"] },
  { id: "6", name: "HIIT", bg: "#a855f7", users: ["Darizon Filho"] },
  { id: "7", name: "ENAMED", bg: "#0d9488", users: ["Stefani Silva", "Katharine Andrade"] },
  { id: "8", name: "USA", bg: "#dc2626", users: ["Lucas Ferreira"] },
  { id: "9", name: "COFBET", bg: "#9f1239", users: ["Amirah Saleh", "Felipe Daiko"] },
  { id: "10", name: "RÁDIO", bg: "#78716c", users: ["Henrique Lunarderlli"] },
];

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

  function handleUserClick(userName: string) {
    const conv = CONVERSATIONS.find(
      (c) => c.name.toLowerCase() === userName.toLowerCase(),
    );
    if (conv) onSelectConversation(conv.id);
  }

  return (
    <div className="flex flex-col gap-2">
      {COURSES.map((course) => (
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
              {course.users.map((user) => (
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
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
