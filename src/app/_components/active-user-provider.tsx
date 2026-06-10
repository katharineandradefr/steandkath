"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  can,
  DEFAULT_PERMISSION_MATRIX,
  normalizePermissionMatrix,
  type PermissionKey,
  type PermissionMatrix,
} from "~/shared/permissions";
import { PROFILE_SETUP_KEY, type User, type UserRole } from "~/shared/user";
import { api } from "~/trpc/react";

type ActiveUserContextValue = {
  user: User | null;
  role: UserRole | null;
  matrix: PermissionMatrix;
  isLoading: boolean;
  needsProfileSetup: boolean;
  can: (key: PermissionKey) => boolean;
  markProfileSetupComplete: () => void;
};

const ActiveUserContext = createContext<ActiveUserContextValue | null>(null);

function readProfileSetupComplete(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PROFILE_SETUP_KEY) === "1";
}

type Props = {
  children: React.ReactNode;
};

/**
 * Provê usuário ativo, papel e matriz de permissões para a UI.
 */
export function ActiveUserProvider({ children }: Props) {
  const [profileSetupComplete, setProfileSetupComplete] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const { data: user, isLoading: userLoading } = api.user.getFirst.useQuery();
  const { data: permissionsData, isLoading: matrixLoading } =
    api.settings.getPermissions.useQuery();

  useEffect(() => {
    setProfileSetupComplete(readProfileSetupComplete());
    setHydrated(true);
  }, []);

  const matrix = useMemo(
    () =>
      permissionsData?.matrix
        ? normalizePermissionMatrix(permissionsData.matrix)
        : DEFAULT_PERMISSION_MATRIX,
    [permissionsData?.matrix],
  );

  const role = user?.role ?? null;

  const checkCan = useCallback(
    (key: PermissionKey) => can(role, key, matrix),
    [role, matrix],
  );

  const markProfileSetupComplete = useCallback(() => {
    localStorage.setItem(PROFILE_SETUP_KEY, "1");
    setProfileSetupComplete(true);
  }, []);

  const needsProfileSetup =
    hydrated && !profileSetupComplete && !userLoading && Boolean(user);

  const value = useMemo(
    () => ({
      user: user ?? null,
      role,
      matrix,
      isLoading: userLoading || matrixLoading,
      needsProfileSetup,
      can: checkCan,
      markProfileSetupComplete,
    }),
    [
      user,
      role,
      matrix,
      userLoading,
      matrixLoading,
      needsProfileSetup,
      checkCan,
      markProfileSetupComplete,
    ],
  );

  return (
    <ActiveUserContext.Provider value={value}>
      {children}
    </ActiveUserContext.Provider>
  );
}

/**
 * Acesso ao usuário ativo e permissões.
 */
export function useActiveUser(): ActiveUserContextValue {
  const context = useContext(ActiveUserContext);
  if (!context) {
    throw new Error(
      "useActiveUser deve ser usado dentro de ActiveUserProvider.",
    );
  }
  return context;
}

/**
 * Atalho para verificar permissões na UI.
 */
export function usePermissions() {
  const { can: checkCan, role, matrix, isLoading } = useActiveUser();
  return { can: checkCan, role, matrix, isLoading };
}
