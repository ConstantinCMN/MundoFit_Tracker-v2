'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import type { Measurement } from '@/types';
import type { MeasurementField, MeasurementInput } from '@/lib/actions/measurements';
import { logMeasurement, updateMeasurement } from '@/lib/actions/measurements';
import {
  MEASUREMENT_FIELDS,
  FIELD_GROUPS,
  fieldToDisplay,
  displayToField,
  fieldUnit,
} from '@/lib/measurements/field-config';
import type { UnitSystem } from '@/types/database';
import { cn } from '@/lib/utils/cn';

type FormValues = Record<MeasurementField, string>;

function todayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

function buildInitialValues(
  entry: Measurement | undefined,
  unitSystem: UnitSystem
): FormValues {
  return Object.fromEntries(
    MEASUREMENT_FIELDS.map(f => {
      if (!entry || entry[f] === null || entry[f] === undefined) return [f, ''];
      const raw = entry[f] as number;
      const display = fieldToDisplay(f, raw, unitSystem);
      return [f, String(display)];
    })
  ) as FormValues;
}

type Props = {
  locale: string;
  unitSystem: UnitSystem;
  initialValues?: Measurement;
  entryId?: string;
};

export function LogFormClient({ locale, unitSystem, initialValues, entryId }: Props) {
  const t = useTranslations('measurements');
  const router = useRouter();
  const isEdit = Boolean(entryId);

  const [date, setDate] = useState(
    initialValues
      ? initialValues.logged_at.split('T')[0]
      : todayDateString()
  );
  const [values, setValues] = useState<FormValues>(() =>
    buildInitialValues(initialValues, unitSystem)
  );
  const [note, setNote] = useState(initialValues?.note ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setValue(field: MeasurementField, raw: string) {
    // Allow digits, one decimal separator, leading minus not needed
    const cleaned = raw.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    setValues(prev => ({ ...prev, [field]: cleaned }));
  }

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

  async function handleSubmit() {
    const hasAny = MEASUREMENT_FIELDS.some(f => values[f] !== '');
    if (!hasAny) {
      setError(t('noneSelected'));
      return;
    }

    setSubmitting(true);
    setError(null);

    const input: MeasurementInput = {
      logged_at: `${date}T12:00:00.000Z`,
      note: note.trim() || null,
    };

    for (const f of MEASUREMENT_FIELDS) {
      if (values[f] === '') {
        input[f] = null;
      } else {
        const parsed = parseFloat(values[f]);
        if (!isNaN(parsed) && parsed > 0) {
          input[f] = displayToField(f, parsed, unitSystem);
        } else {
          input[f] = null;
        }
      }
    }

    const result = isEdit
      ? await updateMeasurement(entryId!, input)
      : await logMeasurement(input);

    if (result.error) {
      setError(t('saveError'));
      setSubmitting(false);
      return;
    }

    router.push('/measurements');
    router.refresh();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col pb-32"
    >
      {/* Page heading */}
      <div className="px-5 pt-5">
        <h2 className="text-[22px] font-black text-[#f5f5f5]">
          {isEdit ? t('editEntry') : t('logNew')}
        </h2>
        <p className="mt-1 text-[13px] text-[#555]">{t('subtitle')}</p>
      </div>

      {/* Date */}
      <div className="mt-5 px-5">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#555]">
          {t('date')}
        </p>
        <input
          type="date"
          value={date}
          max={todayDateString()}
          onChange={e => setDate(e.target.value)}
          className="w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-[15px] font-semibold text-[#f5f5f5] outline-none focus:border-[rgba(170,255,0,0.4)] [color-scheme:dark]"
        />
      </div>

      {/* Field groups */}
      {FIELD_GROUPS.map(group => (
        <div key={group.key} className="mt-6 px-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#555]">
            {t(group.sectionKey as Parameters<typeof t>[0])}
          </p>
          <div className="overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
            {group.fields.map(({ field }, idx) => (
              <div
                key={field}
                className={cn(
                  'flex items-center gap-3 px-4 py-3.5',
                  idx < group.fields.length - 1 && 'border-b border-[rgba(255,255,255,0.04)]'
                )}
              >
                <span className="min-w-[110px] text-[13px] text-[#888]">
                  {fieldLabel(field)}
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={values[field]}
                  onChange={e => setValue(field, e.target.value)}
                  placeholder="—"
                  className="flex-1 bg-transparent text-right text-[15px] font-semibold text-[#f5f5f5] outline-none placeholder:text-[#333]"
                />
                <span className="w-7 text-right text-[12px] text-[#444]">
                  {fieldUnit(field, unitSystem)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Body fat — optional */}
      <div className="mt-6 px-5">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#555]">
          {t('sections.optional')}
        </p>
        <div className="overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <span className="min-w-[110px] text-[13px] text-[#888]">
              {fieldLabel('body_fat_pct')}
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={values['body_fat_pct']}
              onChange={e => setValue('body_fat_pct', e.target.value)}
              placeholder="—"
              className="flex-1 bg-transparent text-right text-[15px] font-semibold text-[#f5f5f5] outline-none placeholder:text-[#333]"
            />
            <span className="w-7 text-right text-[12px] text-[#444]">%</span>
          </div>
        </div>
        <p className="mt-1.5 px-1 text-[11px] text-[#444]">{t('bodyFatHint')}</p>
      </div>

      {/* Note */}
      <div className="mt-6 px-5">
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder={t('notePlaceholder')}
          rows={3}
          className="w-full resize-none rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-4 py-3 text-[13px] text-[#f5f5f5] outline-none placeholder:text-[#333] focus:border-[rgba(170,255,0,0.3)]"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="mt-3 px-5 text-center text-[13px] text-red-400">{error}</p>
      )}

      {/* Sticky save button */}
      <div className="fixed bottom-[72px] left-0 right-0 z-10 px-5 pb-3 pt-2">
        <div className="mx-auto max-w-md">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={submitting}
            className={cn(
              'w-full rounded-2xl py-4 text-[16px] font-black shadow-[0_0_24px_rgba(170,255,0,0.18)] transition-opacity',
              submitting
                ? 'bg-[#aaff00]/40 text-[#0a0a0a]/40'
                : 'bg-[#aaff00] text-[#0a0a0a]'
            )}
          >
            {submitting
              ? t('saving')
              : isEdit
              ? t('saveEdit')
              : t('saveNew')}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
