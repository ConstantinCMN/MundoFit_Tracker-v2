'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { X, Zap, RotateCcw } from 'lucide-react';
import { useRouter } from '@/lib/i18n/navigation';
import { MuscleMap, type MuscleId, type BodyView } from './muscle-map';
import { useMuscleSelection } from './muscle-selection-context';
import { cn } from '@/lib/utils/cn';

const ALL_MUSCLE_IDS: MuscleId[] = [
  'chest', 'shoulders', 'biceps', 'triceps', 'forearms',
  'abs', 'quads', 'calves',
  'traps', 'lats', 'lower_back', 'glutes', 'hamstrings',
];

function ViewTab({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
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
          layoutId="anatomy-view-pill"
          className="absolute inset-0 rounded-xl bg-[#aaff00]"
          transition={{ type: 'spring', stiffness: 400, damping: 36 }}
        />
      )}
      <span className="relative">{label}</span>
    </button>
  );
}

function MuscleChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.15 }}
      className="flex items-center gap-1.5 rounded-full border border-[rgba(170,255,0,0.3)] bg-[rgba(170,255,0,0.08)] py-1.5 pl-3 pr-2"
    >
      <span className="text-[12px] font-semibold text-[#aaff00]">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="flex h-4 w-4 items-center justify-center rounded-full bg-[rgba(170,255,0,0.15)]"
        aria-label={`Remove ${label}`}
      >
        <X size={9} color="#aaff00" strokeWidth={2.5} />
      </button>
    </motion.div>
  );
}

export function AnatomyClient() {
  const t  = useTranslations('workouts');
  const tm = useTranslations('workouts.muscles');
  const router = useRouter();

  const { selected, toggleMuscle, clearAll } = useMuscleSelection();
  const [view, setView] = useState<BodyView>('front');

  const muscleLabel = (id: string) => {
    try { return tm(id as Parameters<typeof tm>[0]); } catch { return id; }
  };

  const selectedList = ALL_MUSCLE_IDS.filter(id => selected.has(id));

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
        <h2 className="text-[22px] font-black text-[#f5f5f5]">{t('anatomyMap.title')}</h2>
        <p className="mt-1 text-[13px] text-[#555555]">{t('anatomyMap.subtitle')}</p>
      </motion.div>

      {/* Front / Back toggle */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mt-5 px-5"
      >
        <div className="flex gap-1 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-1">
          <ViewTab active={view === 'front'} label={t('bodyMap.front')} onClick={() => setView('front')} />
          <ViewTab active={view === 'back'}  label={t('bodyMap.back')}  onClick={() => setView('back')}  />
        </div>
      </motion.div>

      {/* Body map */}
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
              <MuscleMap view={view} selected={selected} onToggle={toggleMuscle} />
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
        {t('muscleMap.tapHint')}
      </motion.p>

      {/* Selected chips */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mt-5 px-5"
      >
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#3a3a3a]">
            {t('muscleMap.selectMuscles')}
          </p>
          {selectedList.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#555555] hover:text-[#aaff00]"
            >
              <RotateCcw size={10} />
              {t('muscleMap.clearAll')}
            </button>
          )}
        </div>

        <div className="min-h-[40px] rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-3 py-2">
          {selectedList.length === 0 ? (
            <p className="py-1 text-center text-[12px] text-[#333333]">
              {t('muscleMap.noneSelected')}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {selectedList.map(id => (
                  <MuscleChip
                    key={id}
                    label={muscleLabel(id)}
                    onRemove={() => toggleMuscle(id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      {/* Generate CTA */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mt-6 px-5"
      >
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/workouts/generator')}
          disabled={selectedList.length === 0}
          className={cn(
            'flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 text-[16px] font-black transition-all',
            selectedList.length > 0
              ? 'bg-[#aaff00] text-[#0a0a0a] shadow-[0_0_24px_rgba(170,255,0,0.25)]'
              : 'border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] text-[#333333]'
          )}
        >
          <Zap
            size={18}
            className={selectedList.length > 0 ? 'text-[#0a0a0a]' : 'text-[#333333]'}
          />
          {t('muscleMap.generate')}
          {selectedList.length > 0 && (
            <span className="ml-1 rounded-full bg-[rgba(0,0,0,0.15)] px-2 py-0.5 text-[11px] font-black">
              {selectedList.length}
            </span>
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
