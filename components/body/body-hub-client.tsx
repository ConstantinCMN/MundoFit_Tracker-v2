'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { MuscleMap, type MuscleId, type BodyView } from '@/components/workouts/muscle-map';
import { useRouter } from '@/lib/i18n/navigation';

function ViewTab({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex-1 rounded-xl py-2.5 text-[13px] font-bold transition-colors',
        active ? 'text-[#0a0a0a]' : 'text-[#555555]'
      )}
    >
      {active && (
        <motion.div
          layoutId="body-hub-view-pill"
          className="absolute inset-0 rounded-xl bg-[#aaff00]"
          transition={{ type: 'spring', stiffness: 400, damping: 36 }}
        />
      )}
      <span className="relative">{label}</span>
    </button>
  );
}

export function BodyHubClient() {
  const t  = useTranslations('workouts');
  const tb = useTranslations('body');
  const router = useRouter();
  const [view, setView] = useState<BodyView>('front');
  const [selected, setSelected] = useState<Set<MuscleId>>(new Set());

  const handleMuscleToggle = useCallback((id: MuscleId) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  function handleGenerate() {
    router.push(`/workouts/generator?muscles=${Array.from(selected).join(',')}`);
  }

  const hasSelection = selected.size > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col pb-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="px-5 pt-5"
      >
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#aaff00]/60">
          MundoFit
        </p>
        <h2 className="text-[22px] font-black text-[#f5f5f5]">{tb('title')}</h2>
        <p className="mt-1 text-[13px] text-[#555555]">{tb('subtitle')}</p>
      </motion.div>

      {/* Front / Back toggle */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mt-5 px-5"
      >
        <div className="flex gap-1 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-1">
          <ViewTab
            active={view === 'front'}
            label={t('bodyMap.front')}
            onClick={() => setView('front')}
          />
          <ViewTab
            active={view === 'back'}
            label={t('bodyMap.back')}
            onClick={() => setView('back')}
          />
        </div>
      </motion.div>

      {/* Body map — tapping toggles muscle selection */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mt-3 flex justify-center px-5"
      >
        <div className="w-full max-w-[345px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, x: view === 'front' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: view === 'front' ? 20 : -20 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
            >
              <MuscleMap
                view={view}
                selected={selected}
                onToggle={handleMuscleToggle}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Tap hint (empty) / Generate CTA (with selection) */}
      <AnimatePresence mode="wait">
        {!hasSelection ? (
          <motion.p
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="mt-3 text-center text-[11px] text-[#3a3a3a]"
          >
            {tb('tapHint')}
          </motion.p>
        ) : (
          <motion.div
            key="cta"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.22 }}
            className="mt-4 space-y-2 px-5"
          >
            <p className="text-center text-[11px] text-[#555555]">
              {tb('musclesSelected', { count: selected.size })}
            </p>
            <button
              type="button"
              onClick={handleGenerate}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#aaff00] py-4 text-[16px] font-black text-[#0a0a0a] shadow-[0_0_24px_rgba(170,255,0,0.2)]"
            >
              <Zap size={17} />
              {tb('generateWorkout')} ({selected.size})
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
