export type FontSize = "small" | "medium" | "large" | "extra_large";

export type MessageSound = "none" | "soft" | "default" | "alert";

export type ColorMode = "light" | "dark";

export type UserPreferences = {
  userId: string;
  fontSize: FontSize;
  messageSound: MessageSound;
  colorMode: ColorMode;
  messageNotifications: boolean;
  emailNotifications: boolean;
};

export const FONT_SIZE_OPTIONS: {
  value: FontSize;
  label: string;
  description: string;
}[] = [
  { value: "small", label: "Pequena", description: "Texto mais compacto" },
  { value: "medium", label: "Média", description: "Tamanho padrão do sistema" },
  { value: "large", label: "Grande", description: "Mais confortável para leitura" },
  {
    value: "extra_large",
    label: "Extra grande",
    description: "Máxima legibilidade",
  },
];

export const MESSAGE_SOUND_OPTIONS: {
  value: MessageSound;
  label: string;
  description: string;
}[] = [
  { value: "none", label: "Nenhum", description: "Sem som ao receber mensagens" },
  { value: "soft", label: "Suave", description: "Tom discreto e curto" },
  { value: "default", label: "Padrão", description: "Som equilibrado" },
  { value: "alert", label: "Alerta", description: "Tom mais alto e perceptível" },
];

export const COLOR_MODE_OPTIONS: {
  value: ColorMode;
  label: string;
  description: string;
}[] = [
  {
    value: "light",
    label: "Light mode",
    description: "Cores claras padrão do sistema",
  },
  {
    value: "dark",
    label: "Dark mode",
    description: "Fundo escuro com detalhes em vermelho escuro",
  },
];

export const DEFAULT_USER_PREFERENCES: Omit<UserPreferences, "userId"> = {
  fontSize: "medium",
  messageSound: "default",
  colorMode: "light",
  messageNotifications: false,
  emailNotifications: false,
};

export const PREFERENCES_STORAGE_KEY = "steandkath-user-preferences";
