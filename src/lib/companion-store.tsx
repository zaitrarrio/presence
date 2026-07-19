/**
 * Holds the user's companion — name, avatar, voice, language, persona — and
 * persists it across launches. This is the object handed to POST /session.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_COMPANION } from './vidu/catalog';
import type { CompanionConfig } from './vidu/types';

const STORAGE_KEY = 'presence.companion.v1';

interface CompanionContextValue {
  companion: CompanionConfig;
  ready: boolean;
  update: (patch: Partial<CompanionConfig>) => void;
}

const CompanionContext = createContext<CompanionContextValue | null>(null);

export function CompanionProvider({ children }: { children: ReactNode }) {
  const [companion, setCompanion] = useState<CompanionConfig>(DEFAULT_COMPANION);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (alive && raw) setCompanion({ ...DEFAULT_COMPANION, ...JSON.parse(raw) });
      })
      .catch(() => undefined)
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo<CompanionContextValue>(
    () => ({
      companion,
      ready,
      update: (patch) =>
        setCompanion((prev) => {
          const next = { ...prev, ...patch };
          AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
          return next;
        }),
    }),
    [companion, ready],
  );

  return <CompanionContext.Provider value={value}>{children}</CompanionContext.Provider>;
}

export function useCompanion(): CompanionContextValue {
  const ctx = useContext(CompanionContext);
  if (!ctx) throw new Error('useCompanion must be used within CompanionProvider');
  return ctx;
}
