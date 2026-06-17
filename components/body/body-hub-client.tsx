'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';
import { MuscleMap, type MuscleId, type BodyView } from '@/components/workouts/muscle-map';
import { useRouter } from '@/lib/i18n/navigation';

// Stable empty set — avoids re-triggering MuscleMap's style effect on every render
const EMPTY_SELECTION = new Set<MuscleId>();

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

  function handleMuscleSelect(id: MuscleId) {
    router.push(`/body/${id}`);
  }

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

      {/* Body map — tapping navigates to /body/[muscle] */}
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
                selected={EMPTY_SELECTION}
                onToggle={handleMuscleSelect}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Tap hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.38, delay: 0.14 }}
        className="mt-3 text-center text-[11px] text-[#3a3a3a]"
      >
        {tb('tapHint')}
      </motion.p>
    </motion.div>
  );
}
