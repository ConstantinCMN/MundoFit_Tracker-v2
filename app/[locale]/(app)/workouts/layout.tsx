import type { ReactNode } from 'react';
import { MuscleSelectionProvider } from '@/components/workouts/muscle-selection-context';

export default function WorkoutsLayout({ children }: { children: ReactNode }) {
  return <MuscleSelectionProvider>{children}</MuscleSelectionProvider>;
}
