'use client';

import { useState, useEffect } from 'react';
import { useWorkoutSession } from './workout-session-provider';

export function ElapsedTimer() {
  const { startedAt } = useWorkoutSession();
  const [elapsed, setElapsed] = useState(() =>
    startedAt ? Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000) : 0
  );

  useEffect(() => {
    if (!startedAt) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;

  return (
    <p className="w-11 flex-none text-right font-mono text-[13px] text-[#555555]">
      {startedAt
        ? `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
        : '--:--'}
    </p>
  );
}
