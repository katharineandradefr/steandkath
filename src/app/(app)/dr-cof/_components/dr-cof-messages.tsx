"use client";

import { useEffect, useRef, useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

export type DrCofMessage = {
  id: string;
  text: string;
  role: "user" | "assistant";
  timestamp: string;
};

type Props = {
  messages: DrCofMessage[];
  isReplying: boolean;
};

/**
 * Área de mensagens do Dr. Cof.
 * - Usuário: balões à direita (branco)
 * - Dr. Cof: balões à esquerda (cinza claro) com botões de reação 👍👎
 */
export function DrCofMessages({ messages, isReplying }: Props) {
  const endRef = useRef<HTMLDivElement>(null);
  const [reactions, setReactions] = useState<Record<string, "up" | "down">>({});

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isReplying]);

  function handleReaction(id: string, reaction: "up" | "down") {
    setReactions((prev) => ({
      ...prev,
      [id]: prev[id] === reaction ? undefined! : reaction,
    }));
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex flex-col gap-5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "user" ? (
              /* Balão do usuário — direita, branco */
              <div className="max-w-[60%]">
                <div className="rounded-2xl rounded-tr-sm bg-white px-4 py-3 text-sm leading-relaxed text-gray-800 shadow-sm">
                  {msg.text}
                </div>
              </div>
            ) : (
              /* Balão do Dr. Cof — esquerda, cinza claro + reações */
              <div className="max-w-[60%]">
                <div className="rounded-2xl rounded-tl-sm bg-gray-200 px-4 py-3 text-sm leading-relaxed text-gray-800 shadow-sm">
                  {msg.text}
                </div>
                <div className="mt-1.5 flex items-center gap-2 pl-1">
                  <button
                    type="button"
                    onClick={() => handleReaction(msg.id, "up")}
                    className={`transition-colors ${
                      reactions[msg.id] === "up"
                        ? "text-[#5B0A0A]"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                    aria-label="Útil"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReaction(msg.id, "down")}
                    className={`transition-colors ${
                      reactions[msg.id] === "down"
                        ? "text-[#5B0A0A]"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                    aria-label="Não útil"
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Indicador de digitação */}
        {isReplying && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-gray-200 px-4 py-3">
              <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>
    </div>
  );
}
