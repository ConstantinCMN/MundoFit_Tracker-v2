'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Plus, MoreHorizontal, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Link from 'next/link';
import type { Measurement } from '@/types';
import type { MeasurementField } from '@/lib/actions/measurements';
import { deleteMeasurement } from '@/lib/actions/measurements';
import {
  MEASUREMENT_FIELDS,
  DECREASE_IS_GOOD,
  fieldToDisplay,
  fieldUnit,
} from '@/lib/measurements/field-config';
import type { UnitSystem } from '@/types/database';
import { MeasurementChart } from './measurement-chart';
import { Toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils/cn';

type ToastState = { message: string; variant: 'success' | 'error' };

type Props = {
  entries: Measurement[];
  unitSystem: UnitSystem;
  locale: string;
};

function formatDate(dateStr: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function MeasurementsClient({ entries: initialEntries, unitSystem, locale }: Props) {
  const t = useTranslations('measurements');
  const [entries, setEntries] = useState<Measurement[]>(initialEntries);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, variant: 'success' | 'error') => {
    setToast({ message, variant });
  }, []);

  const latest = entries[0];
  const previous = entries[1];

  const fieldLabel = (field: MeasurementField): string => {
    const map: Record<MeasurementField, string> = {
      chest_cm: t('fields.chest'),
      waist_cm: t('fields.waist'),
      hips_cm: t('fields.hips'),
      left_arm_cm: t('fields.leftArm'),
      right_arm_cm: t('fields.rightArm'),
      left_thigh_cm: t('fields.leftThigh'),
      right_thigh_cm: t('fields.rightThigh'),
      left_calf_cm: t('fields.leftCalf'),
      right_calf_cm: t('fields.rightCalf'),
      neck_cm: t('fields.neck'),
      shoulders_cm: t('fields.shoulders'),
      body_fat_pct: t('fields.bodyFat'),
    };
    return map[field];
  };

  function deltaInfo(field: MeasurementField): {
    delta: number | null;
    isGood: boolean | null;
  } {
    if (!latest || !previous) return { delta: null, isGood: null };
    const cur = latest[field];
    const prev = previous[field];
    if (cur === null || prev === null) return { delta: null, isGood: null };
    const rawDelta = cur - prev;
    if (Math.abs(rawDelta) < 0.01) return { delta: 0, isGood: null };
    const displayDelta = fieldToDisplay(field, Math.abs(rawDelta), unitSystem);
    const isGood = DECREASE_IS_GOOD.has(field) ? rawDelta < 0 : rawDelta > 0;
    return { delta: rawDelta < 0 ? -displayDelta : displayDelta, isGood };
  }

  function entryPreview(entry: Measurement): string {
    return MEASUREMENT_FIELDS.filter(f => entry[f] !== null)
      .slice(0, 3)
      .map(f => {
        const val = fieldToDisplay(f, entry[f]!, unitSystem);
        const label = fieldLabel(f).split(' ')[0];
        return `${label} ${val}`;
      })
      .join(' · ');
  }

  async function handleDelete(id: string) {
    setConfirmingId(null);
    setRemovingIds(prev => new Set([...prev, id]));
    const prev = entries;
    setEntries(e => e.filter(x => x.id !== id));

    const { error } = await deleteMeasurement(id);
    if (error) {
      setEntries(prev);
      setRemovingIds(p => { const n = new Set(p); n.delete(id); return n; });
      showToast(t('deleteError'), 'error');
    } else {
      setRemovingIds(p => { const n = new Set(p); n.delete(id); return n; });
      showToast(t('deleted'), 'success');
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col pb-28"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex items-start justify-between px-5 pt-5"
      >
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#aaff00]/60">
            MundoFit
          </p>
          <h2 className="text-[22px] font-black text-[#f5f5f5]">{t('title')}</h2>
          <p className="mt-1 text-[13px] text-[#555555]">{t('subtitle')}</p>
        </div>
        <Link
          href="/measurements/new"
          className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl bg-[#aaff00] text-[#0a0a0a] shadow-[0_0_16px_rgba(170,255,0,0.2)]"
        >
          <Plus size={18} strokeWidth={2.5} />
        </Link>
      </motion.div>

      {entries.length === 0 ? (
        /* Empty state */
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mt-16 flex flex-col items-center px-8 text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] text-3xl">
            📏
          </div>
          <p className="text-[15px] font-semibold text-[#f5f5f5]">{t('noEntries')}</p>
          <p className="mt-1 text-[13px] text-[#555]">{t('firstEntry')}</p>
          <Link
            href="/measurements/new"
            className="mt-6 rounded-2xl bg-[#aaff00] px-6 py-3 text-[14px] font-black text-[#0a0a0a]"
          >
            {t('logNew')}
          </Link>
        </motion.div>
      ) : (
        <>
          {/* Latest entry summary */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, delay: 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mx-5 mt-5"
          >
            <div className="overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
              <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.04)] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#555]">
                  {t('latest')}
                </p>
                <p className="text-[12px] text-[#444]">{formatDate(latest.logged_at, locale)}</p>
              </div>
              <div className="grid grid-cols-2 gap-px bg-[rgba(255,255,255,0.04)]">
                {MEASUREMENT_FIELDS.filter(f => latest[f] !== null).map(field => {
                  const val = fieldToDisplay(field, latest[field]!, unitSystem);
                  const unit = fieldUnit(field, unitSystem);
                  const { delta, isGood } = deltaInfo(field);
                  return (
                    <div
                      key={field}
                      className="flex flex-col gap-0.5 bg-[#0e0e0e] px-4 py-3"
                    >
                      <p className="text-[11px] text-[#555]">{fieldLabel(field)}</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[17px] font-black text-[#f5f5f5]">{val}</span>
                        <span className="text-[11px] text-[#444]">{unit}</span>
                      </div>
                      {delta !== null && delta !== 0 && (
                        <div
                          className={cn(
                            'flex items-center gap-0.5 text-[11px] font-semibold',
                            isGood ? 'text-[#aaff00]' : 'text-[#ef4444]'
                          )}
                        >
                          {delta > 0 ? (
                            <TrendingUp size={11} />
                          ) : (
                            <TrendingDown size={11} />
                          )}
                          {Math.abs(delta)} {unit}
                        </div>
                      )}
                      {delta === 0 && (
                        <div className="flex items-center gap-0.5 text-[11px] text-[#333]">
                          <Minus size={11} />
                          0
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {latest.note && (
                <p className="border-t border-[rgba(255,255,255,0.04)] px-4 py-3 text-[12px] text-[#555] italic">
                  {latest.note}
                </p>
              )}
            </div>
          </motion.div>

          {/* Chart */}
          {entries.length >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <MeasurementChart entries={entries} unitSystem={unitSystem} locale={locale} />
            </motion.div>
          )}

          {/* History */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, delay: 0.14, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mt-6 px-5"
          >
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#555]">
              {t('history')}
            </p>
            <div className="flex flex-col gap-2">
              <AnimatePresence mode="popLayout">
                {entries
                  .filter(e => !removingIds.has(e.id))
                  .map(entry => (
                    <motion.div
                      key={entry.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.22 }}
                      className="relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]"
                    >
                      {confirmingId === entry.id ? (
                        /* Delete confirmation */
                        <div className="flex items-center justify-between px-4 py-4">
                          <p className="text-[13px] font-semibold text-[#f5f5f5]">
                            {t('deleteConfirm')}
                          </p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setConfirmingId(null)}
                              className="rounded-xl border border-[rgba(255,255,255,0.08)] px-3 py-1.5 text-[12px] font-bold text-[#888]"
                            >
                              {t('cancel')}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(entry.id)}
                              className="rounded-xl bg-red-500/20 px-3 py-1.5 text-[12px] font-bold text-red-400"
                            >
                              {t('deleteEntry')}
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Normal card */
                        <div className="flex items-start justify-between px-4 py-3.5">
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-[#f5f5f5]">
                              {formatDate(entry.logged_at, locale)}
                            </p>
                            <p className="mt-0.5 truncate text-[12px] text-[#444]">
                              {entryPreview(entry) || '—'}
                            </p>
                          </div>
                          <div className="relative ml-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenMenuId(prev => (prev === entry.id ? null : entry.id))
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-xl text-[#444] hover:text-[#888]"
                            >
                              <MoreHorizontal size={16} />
                            </button>
                            {openMenuId === entry.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setOpenMenuId(null)}
                                />
                                <div className="absolute right-0 top-9 z-20 min-w-[130px] overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#1a1a1a] shadow-xl">
                                  <Link
                                    href={`/measurements/${entry.id}/edit`}
                                    onClick={() => setOpenMenuId(null)}
                                    className="flex items-center px-4 py-3 text-[13px] font-semibold text-[#f5f5f5] hover:bg-[rgba(255,255,255,0.04)]"
                                  >
                                    {t('editEntry')}
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      setConfirmingId(entry.id);
                                    }}
                                    className="flex w-full items-center px-4 py-3 text-[13px] font-semibold text-red-400 hover:bg-[rgba(255,255,255,0.04)]"
                                  >
                                    {t('deleteEntry')}
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast
            key="measurement-toast"
            message={toast.message}
            variant={toast.variant}
            onDismiss={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
