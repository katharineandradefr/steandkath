"use client";

import { useState } from "react";
import { Volume2 } from "lucide-react";

import { ToggleSwitch } from "~/app/(app)/configuracoes/_components/toggle-switch";
import { useUserPreferences } from "~/app/_components/user-preferences-provider";
import { playMessageSound } from "~/shared/message-sound";
import { requestMessageNotificationPermission } from "~/shared/message-notifications";
import {
  COLOR_MODE_OPTIONS,
  FONT_SIZE_OPTIONS,
  MESSAGE_SOUND_OPTIONS,
  type ColorMode,
  type FontSize,
  type MessageSound,
} from "~/shared/user-preferences";

/**
 * Preferências pessoais: fonte, som, tema e notificações.
 */
export function GeneralSettingsPanel() {
  const { preferences, isSaving, updatePreferences } = useUserPreferences();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFontSize = (fontSize: FontSize) => {
    setFeedback("Tamanho da letra atualizado.");
    setError(null);
    updatePreferences({ fontSize });
  };

  const handleSound = (messageSound: MessageSound) => {
    setFeedback("Som das mensagens atualizado.");
    setError(null);
    updatePreferences({ messageSound });
    playMessageSound(messageSound);
  };

  const handleColorMode = (colorMode: ColorMode) => {
    setFeedback(
      colorMode === "dark"
        ? "Dark mode ativado em todas as telas."
        : "Light mode restaurado.",
    );
    setError(null);
    updatePreferences({ colorMode });
  };

  const handleMessageNotifications = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestMessageNotificationPermission();
      if (!granted) {
        setError(
          "Permissão de notificação negada pelo navegador. Verifique as configurações do site.",
        );
        setFeedback(null);
        return;
      }
    }

    setFeedback(
      enabled
        ? "Notificações de novas mensagens ativadas."
        : "Notificações de novas mensagens desativadas.",
    );
    setError(null);
    updatePreferences({ messageNotifications: enabled });
  };

  const handleEmailNotifications = (enabled: boolean) => {
    setFeedback(
      enabled
        ? "Notificações por e-mail ativadas."
        : "Notificações por e-mail desativadas.",
    );
    setError(null);
    updatePreferences({ emailNotifications: enabled });
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-lg font-semibold text-calendar-bordeaux">
          Configurações gerais
        </h2>
        <p className="text-sm text-calendar-muted">
          Personalize a aparência e os alertas do sistema para o seu uso.
        </p>
      </div>

      {feedback && (
        <p role="status" className="text-sm text-emerald-700">
          {feedback}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      {isSaving && (
        <p className="text-sm text-calendar-muted">Salvando preferências…</p>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-calendar-bordeaux">
          Tamanho das letras
        </h3>
        <p className="mt-1 text-sm text-calendar-muted">
          Define o tamanho do texto exibido em todas as telas.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {FONT_SIZE_OPTIONS.map((option) => {
            const selected = preferences.fontSize === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleFontSize(option.value)}
                className={`rounded-2xl border px-4 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal ${
                  selected
                    ? "border-calendar-cardinal bg-calendar-cardinal/10"
                    : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <span className="block text-sm font-semibold text-calendar-bordeaux">
                  {option.label}
                </span>
                <span className="mt-1 block text-xs text-calendar-muted">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-calendar-bordeaux" />
          <h3 className="text-sm font-semibold text-calendar-bordeaux">
            Som das mensagens
          </h3>
        </div>
        <p className="mt-1 text-sm text-calendar-muted">
          Escolha o som ao receber uma nova mensagem no chat.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {MESSAGE_SOUND_OPTIONS.map((option) => {
            const selected = preferences.messageSound === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSound(option.value)}
                className={`rounded-2xl border px-4 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal ${
                  selected
                    ? "border-calendar-cardinal bg-calendar-cardinal/10"
                    : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <span className="block text-sm font-semibold text-calendar-bordeaux">
                  {option.label}
                </span>
                <span className="mt-1 block text-xs text-calendar-muted">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-calendar-bordeaux">
          Modo de cores
        </h3>
        <p className="mt-1 text-sm text-calendar-muted">
          Light mode é o padrão. Dark mode altera as cores de todas as telas.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {COLOR_MODE_OPTIONS.map((option) => {
            const selected = preferences.colorMode === option.value;
            const isDark = option.value === "dark";

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleColorMode(option.value)}
                className={`overflow-hidden rounded-2xl border text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal ${
                  selected
                    ? "border-calendar-cardinal ring-2 ring-calendar-cardinal/30"
                    : "border-gray-200"
                }`}
              >
                <div
                  className={`px-4 py-3 ${
                    isDark
                      ? "bg-black text-white"
                      : "bg-gray-100 text-calendar-bordeaux"
                  }`}
                >
                  <span className="block text-sm font-semibold">
                    {option.label}
                  </span>
                  <span
                    className={`mt-2 inline-block rounded-full px-3 py-1 text-xs ${
                      isDark
                        ? "bg-[#3d2424] text-white"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    Exemplo de mensagem
                  </span>
                </div>
                <p className="px-4 py-2 text-xs text-calendar-muted">
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-calendar-bordeaux">
          Notificações
        </h3>

        <div className="mt-4 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-calendar-bordeaux">
                Notificações de novas mensagens
              </p>
              <p className="text-xs text-calendar-muted">
                Alerta no navegador quando chegar mensagem com a aba em segundo
                plano.
              </p>
            </div>
            <ToggleSwitch
              checked={preferences.messageNotifications}
              onChange={handleMessageNotifications}
              label="Notificações de novas mensagens"
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-calendar-bordeaux">
                Notificações por e-mail
              </p>
              <p className="text-xs text-calendar-muted">
                Receber avisos de novas mensagens no e-mail cadastrado.
              </p>
            </div>
            <ToggleSwitch
              checked={preferences.emailNotifications}
              onChange={handleEmailNotifications}
              label="Notificações por e-mail"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
