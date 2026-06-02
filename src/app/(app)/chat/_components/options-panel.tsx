"use client";

import { useState } from "react";
import { List, BookmarkCheck, Monitor, History, ChevronLeft, Users } from "lucide-react";

import type { SubPanel, StatusValue } from "./chat-types";
import type { SavedMessage } from "./chat-layout";
import { CONVERSATIONS } from "./chat-data";
import { StatusDropdown } from "./status-dropdown";
import { ComputadoresPanel } from "./right-panels/computadores-panel";
import { ListasPanel } from "./right-panels/listas-panel";
import { MensagensSalvasPanel } from "./right-panels/mensagens-salvas-panel";
import { HistoricoPanel } from "./right-panels/historico-panel";

type Props = {
  open: boolean;
  activeSubPanel: SubPanel;
  savedMessages: SavedMessage[];
  onSubPanelChange: (panel: SubPanel) => void;
  onSelectConversation: (id: string) => void;
  onCreateGroup: (name: string, memberIds: string[]) => void;
};

const ACTION_BUTTONS = [
  { id: "listas" as const, label: "Listas", icon: List },
  { id: "mensagens-salvas" as const, label: "Mensagens Favoritas", icon: BookmarkCheck },
  { id: "computadores" as const, label: "Computadores", icon: Monitor },
  { id: "historico" as const, label: "Histórico", icon: History },
];

type GroupModalProps = {
  onClose: () => void;
  onCreateGroup: (name: string, memberIds: string[]) => void;
};

/** Modal simples de criação de grupo */
function CreateGroupModal({ onClose, onCreateGroup }: GroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function handleCreate() {
    if (!groupName.trim() || selected.length < 2) return;
    onCreateGroup(groupName.trim(), selected);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex w-80 flex-col gap-4 rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-base font-semibold text-gray-800">Criar grupo</h2>

        <input
          type="text"
          placeholder="Nome do grupo"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#5B0A0A]"
          autoFocus
        />

        <div>
          <p className="mb-2 text-xs font-medium text-gray-500">
            Selecionar participantes (mín. 2)
          </p>
          <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
            {CONVERSATIONS.filter((c) => !c.isGroup).map((conv) => (
              <button
                key={conv.id}
                type="button"
                onClick={() => toggle(conv.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  selected.includes(conv.id)
                    ? "bg-[#5B0A0A] text-white"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: conv.avatarColor }}
                >
                  {conv.initials}
                </div>
                {conv.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!groupName.trim() || selected.length < 2}
            onClick={handleCreate}
            className="flex-1 rounded-lg bg-[#5B0A0A] py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Criar grupo
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Painel direito de opções: status, nome do atendente, sub-painéis e criar grupo.
 * Abre/fecha com animação slide-in via largura.
 */
export function OptionsPanel({
  open,
  activeSubPanel,
  savedMessages,
  onSubPanelChange,
  onSelectConversation,
  onCreateGroup,
}: Props) {
  const [status, setStatus] = useState<StatusValue>("em-atendimento");
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  return (
    <>
      <aside
        className={`flex shrink-0 flex-col overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "w-72" : "w-0"
        }`}
        style={{ backgroundColor: "rgba(255, 0, 24, 0.5)" }}
      >
        <div className="flex w-72 flex-1 flex-col gap-4 overflow-y-auto p-4">
          {/* Status dropdown */}
          <StatusDropdown value={status} onChange={setStatus} />

          {/* Nome — visível apenas em "Em Atendimento" */}
          <div
            className={`overflow-hidden transition-all duration-200 ${
              status === "em-atendimento"
                ? "max-h-10 opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <p className="text-sm font-medium text-white">Stefani Silva</p>
          </div>

          {/* Sub-painel ativo ou lista de botões */}
          {activeSubPanel ? (
            <div className="flex flex-1 flex-col gap-3">
              <button
                type="button"
                onClick={() => onSubPanelChange(null)}
                className="flex items-center gap-1 self-start text-xs text-white/80 transition-colors hover:text-white"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Voltar
              </button>

              {activeSubPanel === "computadores" && <ComputadoresPanel />}
              {activeSubPanel === "listas" && (
                <ListasPanel onSelectConversation={onSelectConversation} />
              )}
              {activeSubPanel === "mensagens-salvas" && (
                <MensagensSalvasPanel messages={savedMessages} />
              )}
              {activeSubPanel === "historico" && <HistoricoPanel />}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {ACTION_BUTTONS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSubPanelChange(id)}
                  className="flex items-center gap-3 rounded-lg bg-white/90 px-4 py-3 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:bg-white"
                >
                  <Icon className="h-4 w-4 text-[#5B0A0A]" />
                  {label}
                </button>
              ))}

              {/* Criar grupo — no final da lista */}
              <button
                type="button"
                onClick={() => setShowCreateGroup(true)}
                className="flex items-center gap-3 rounded-lg border border-white/40 bg-white/20 px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-white/30"
              >
                <Users className="h-4 w-4" />
                Criar grupo
              </button>
            </div>
          )}
        </div>
      </aside>

      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onCreateGroup={onCreateGroup}
        />
      )}
    </>
  );
}
