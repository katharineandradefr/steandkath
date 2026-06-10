"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { BrandLoadingOverlay } from "~/app/_components/brand-loading-overlay";

const MIN_DURATION_MS = 1000;
const EXIT_FADE_MS = 200;
const SAFETY_TIMEOUT_MS = 8000;

type PendencyNavigationContextValue = {
  isNavigating: boolean;
  startNavigationToPendency: (pendencyId: string) => void;
  completeNavigation: () => void;
};

const PendencyNavigationContext =
  createContext<PendencyNavigationContextValue | null>(null);

type Props = {
  children: React.ReactNode;
};

/**
 * Coordena a transição chat → pendências: overlay global persiste até o modal abrir.
 */
export function PendencyNavigationProvider({ children }: Props) {
  const router = useRouter();
  const [showOverlay, setShowOverlay] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const startedAtRef = useRef(0);
  const exitTimerRef = useRef<number | null>(null);

  const clearExitTimer = useCallback(() => {
    if (exitTimerRef.current !== null) {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
  }, []);

  const hideOverlay = useCallback(() => {
    clearExitTimer();
    setIsExiting(true);
    exitTimerRef.current = window.setTimeout(() => {
      setShowOverlay(false);
      setIsExiting(false);
      setIsNavigating(false);
      exitTimerRef.current = null;
    }, EXIT_FADE_MS);
  }, [clearExitTimer]);

  const startNavigationToPendency = useCallback(
    (pendencyId: string) => {
      clearExitTimer();
      startedAtRef.current = Date.now();
      setIsExiting(false);
      setIsNavigating(true);
      setShowOverlay(true);

      window.setTimeout(() => {
        router.push(`/?pendencia=${pendencyId}`);
      }, MIN_DURATION_MS);
    },
    [clearExitTimer, router],
  );

  const completeNavigation = useCallback(() => {
    if (!isNavigating) return;

    const elapsed = Date.now() - startedAtRef.current;
    const remaining = Math.max(0, MIN_DURATION_MS - elapsed);

    window.setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          hideOverlay();
        });
      });
    }, remaining);
  }, [hideOverlay, isNavigating]);

  useEffect(() => {
    if (!isNavigating) return;

    const safetyTimer = window.setTimeout(() => {
      hideOverlay();
    }, SAFETY_TIMEOUT_MS);

    return () => window.clearTimeout(safetyTimer);
  }, [hideOverlay, isNavigating]);

  useEffect(() => () => clearExitTimer(), [clearExitTimer]);

  return (
    <PendencyNavigationContext.Provider
      value={{
        isNavigating,
        startNavigationToPendency,
        completeNavigation,
      }}
    >
      {children}
      {showOverlay && (
        <BrandLoadingOverlay
          durationMs={MIN_DURATION_MS}
          exiting={isExiting}
        />
      )}
    </PendencyNavigationContext.Provider>
  );
}

/** Hook para iniciar ou concluir a transição para uma pendência. */
export function usePendencyNavigation(): PendencyNavigationContextValue {
  const context = useContext(PendencyNavigationContext);
  if (!context) {
    throw new Error(
      "usePendencyNavigation deve ser usado dentro de PendencyNavigationProvider.",
    );
  }
  return context;
}
