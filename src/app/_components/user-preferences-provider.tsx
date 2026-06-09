"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { applyUserPreferencesToDocument } from "~/shared/apply-user-preferences";
import {
  DEFAULT_USER_PREFERENCES,
  PREFERENCES_STORAGE_KEY,
  type UserPreferences,
} from "~/shared/user-preferences";
import { api } from "~/trpc/react";

type PreferencesContextValue = {
  preferences: UserPreferences;
  isLoading: boolean;
  isSaving: boolean;
  updatePreferences: (patch: Partial<UserPreferences>) => void;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function loadStoredPreferences(): Partial<UserPreferences> | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<UserPreferences>;
  } catch {
    return null;
  }
}

function saveStoredPreferences(preferences: UserPreferences): void {
  localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
}

type Props = {
  children: React.ReactNode;
};

/**
 * Provê preferências do usuário e aplica tema/tamanho de fonte globalmente.
 */
export function UserPreferencesProvider({ children }: Props) {
  const [preferences, setPreferences] = useState<UserPreferences>({
    ...DEFAULT_USER_PREFERENCES,
    userId: "",
  });

  const { data, isLoading } = api.settings.getGeneralPreferences.useQuery();
  const utils = api.useUtils();

  const updateMutation = api.settings.updateGeneralPreferences.useMutation({
    onSuccess: async (saved) => {
      setPreferences(saved);
      saveStoredPreferences(saved);
      applyUserPreferencesToDocument(saved);
      await utils.settings.invalidate();
    },
  });

  useEffect(() => {
    const stored = loadStoredPreferences();
    if (stored) {
      const merged = { ...DEFAULT_USER_PREFERENCES, userId: "", ...stored };
      setPreferences(merged);
      applyUserPreferencesToDocument(merged);
    } else {
      applyUserPreferencesToDocument(DEFAULT_USER_PREFERENCES);
    }
  }, []);

  useEffect(() => {
    if (!data) return;
    setPreferences(data);
    saveStoredPreferences(data);
    applyUserPreferencesToDocument(data);
  }, [data]);

  const updatePreferences = useCallback(
    (patch: Partial<UserPreferences>) => {
      setPreferences((current) => {
        const next = { ...current, ...patch };
        saveStoredPreferences(next);
        applyUserPreferencesToDocument(next);
        return next;
      });

      updateMutation.mutate({
        fontSize: patch.fontSize,
        messageSound: patch.messageSound,
        colorMode: patch.colorMode,
        messageNotifications: patch.messageNotifications,
        emailNotifications: patch.emailNotifications,
      });
    },
    [updateMutation],
  );

  const value = useMemo(
    () => ({
      preferences,
      isLoading,
      isSaving: updateMutation.isPending,
      updatePreferences,
    }),
    [preferences, isLoading, updateMutation.isPending, updatePreferences],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

/**
 * Acesso às preferências do usuário logado.
 */
export function useUserPreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error(
      "useUserPreferences deve ser usado dentro de UserPreferencesProvider.",
    );
  }
  return context;
}
