'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { X, Zap, RotateCcw } from 'lucide-react';
import { MuscleMap, type MuscleId, type BodyView } from './muscle-map';
import { cn } from '@/lib/utils/cn';

// ── All muscle IDs that can appear in either view ─────────────────────────────

const ALL_MUSCLE_IDS: MuscleId[] = [
  'chest', 'shoulders', 'biceps', 'triceps', 'forearms',
  'abs', 'quads', 'calves',
  'traps', 'lats', 'lower_back', 'glutes', 'hamstrings',
];

// ── Animation helper ──────────────────────────────────────────────────────────

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
  };
}

// ── View toggle tab ───────────────────────────────────────────────────────────

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
          layoutId="view-pill"
          className="absolute inset-0 rounded-xl bg-[#aaff00]"
          transition={{ type: 'spring', stiffness: 400, damping: 36 }}
        />
      )}
      <span className="relative">{label}</span>
    </button>
  );
}

// ── Selected muscle chip ──────────────────────────────────────────────────────

function MuscleChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
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
        className="flex h-4 w-4 items-center justify-center rounded-full bg-[rgba(170,255,0,0.15)] transition-colors hover:bg-[rgba(170,255,0,0.3)]"
      >
        <X size={9} color="#aaff00" strokeWidth={2.5} />
      </button>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function GeneratorClient() {
  const t = useTranslations('workouts');
  const [view, setView] = useState<BodyView>('front');
  const [selected, setSelected] = useState<Set<MuscleId>>(new Set());
  const [showToast, setShowToast] = useState(false);

  function toggleMuscle(id: MuscleId) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearAll() {
    setSelected(new Set());
  }

  function handleGenerate() {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2800);
  }

  const selectedList = ALL_MUSCLE_IDS.filter((id) => selected.has(id));

  return (
    <div className="flex flex-col pb-6">
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0)} className="px-5 pt-5">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#aaff00]/60">
          MundoFit
        </p>
        <h2 className="text-[22px] font-black text-[#f5f5f5]">{t('generator')}</h2>
        <p className="mt-1 text-[13px] text-[#555555]">{t('muscleMap.selectMuscles')}</p>
      </motion.div>

      {/* ── Front / Back toggle ───────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0.06)} className="mt-5 px-5">
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

      {/* ── Body map ─────────────────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0.1)} className="mt-6 flex justify-center px-5">
        <div className="w-full max-w-[220px]">
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
                onToggle={toggleMuscle}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Tap hint ─────────────────────────────────────────────────────────── */}
      <motion.p
        {...fadeUp(0.14)}
        className="mt-3 text-center text-[11px] text-[#3a3a3a]"
      >
        {t('muscleMap.tapHint')}
      </motion.p>

      {/* ── Selected chips ────────────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0.18)} className="mt-5 px-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#3a3a3a]">
            {t('muscleMap.selectMuscles')}
          </p>
          {selectedList.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#555555] transition-colors hover:text-[#aaff00]"
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
                {selectedList.map((id) => (
                  <MuscleChip
                    key={id}
                    label={t(`muscles.${id}`)}
                    onRemove={() => toggleMuscle(id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Generate CTA ─────────────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0.22)} className="mt-6 px-5">
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={handleGenerate}
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

      {/* ── Coming soon toast ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 rounded-2xl border border-[rgba(170,255,0,0.2)] bg-[#111111] px-5 py-3 shadow-xl"
          >
            <p className="whitespace-nowrap text-[13px] font-semibold text-[#aaff00]">
              {t('muscleMap.comingSoon')} ⚡
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
