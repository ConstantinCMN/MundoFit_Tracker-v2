'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { MuscleId } from './muscle-map';

type MuscleSelectionContextValue = {
  selected: Set<MuscleId>;
  toggleMuscle: (id: MuscleId) => void;
  clearAll: () => void;
};

const MuscleSelectionContext = createContext<MuscleSelectionContextValue | null>(null);

export function MuscleSelectionProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Set<MuscleId>>(new Set());

  const toggleMuscle = useCallback((id: MuscleId) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => setSelected(new Set()), []);

  return (
    <MuscleSelectionContext.Provider value={{ selected, toggleMuscle, clearAll }}>
      {children}
    </MuscleSelectionContext.Provider>
  );
}

export function useMuscleSelection(): MuscleSelectionContextValue {
  const ctx = useContext(MuscleSelectionContext);
  if (!ctx) {
    return {
      selected: new Set<MuscleId>(),
      toggleMuscle: () => {},
      clearAll: () => {},
    };
  }
  return ctx;
}
