'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { Measurement } from '@/types';
import type { MeasurementField } from '@/lib/actions/measurements';
import {
  MEASUREMENT_FIELDS,
  fieldToDisplay,
  fieldUnit,
} from '@/lib/measurements/field-config';
import type { UnitSystem } from '@/types/database';
import { cn } from '@/lib/utils/cn';

type Period = '7d' | '30d' | '90d' | 'all';

const PERIODS: Period[] = ['7d', '30d', '90d', 'all'];

function filterByPeriod(entries: Measurement[], period: Period): Measurement[] {
  if (period === 'all') return entries;
  const days = { '7d': 7, '30d': 30, '90d': 90 }[period];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return entries.filter(e => new Date(e.logged_at) >= cutoff);
}

function formatDateShort(dateStr: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(
    new Date(dateStr)
  );
}

type Props = {
  entries: Measurement[];
  unitSystem: UnitSystem;
  locale: string;
  defaultField?: MeasurementField;
};

export function MeasurementChart({ entries, unitSystem, locale, defaultField }: Props) {
  const t = useTranslations('measurements');
  const [period, setPeriod] = useState<Period>('30d');
  const [selectedField, setSelectedField] = useState<MeasurementField>(
    defaultField ?? 'chest_cm'
  );

  const filteredEntries = useMemo(() => filterByPeriod(entries, period), [entries, period]);

  const availableFields = useMemo(
    () => MEASUREMENT_FIELDS.filter(f => filteredEntries.some(e => e[f] !== null)),
    [filteredEntries]
  );

  const activeField =
    availableFields.includes(selectedField) ? selectedField : (availableFields[0] ?? selectedField);

  const chartData = useMemo(() => {
    return filteredEntries
      .filter(e => e[activeField] !== null)
      .map(e => ({
        date: e.logged_at,
        value: fieldToDisplay(activeField, e[activeField]!, unitSystem),
      }))
      .reverse();
  }, [filteredEntries, activeField, unitSystem]);

  const unit = fieldUnit(activeField, unitSystem);

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  }) => {
    if (!active || !payload?.length || !label) return null;
    return (
      <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#141414] px-3 py-2 shadow-lg">
        <p className="text-[11px] text-[#555]">{formatDateShort(label, locale)}</p>
        <p className="text-[15px] font-black text-[#aaff00]">
          {payload[0].value} {unit}
        </p>
      </div>
    );
  };

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

  return (
    <div className="mx-5 mt-5 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#555]">
        {t('trend')}
      </p>

      {/* Field chips */}
      {availableFields.length > 0 && (
        <div className="no-scrollbar -mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1">
          {availableFields.map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setSelectedField(f)}
              className={cn(
                'flex-shrink-0 rounded-full px-3 py-1 text-[11px] font-bold transition-all',
                activeField === f
                  ? 'bg-[#aaff00] text-[#0a0a0a]'
                  : 'border border-[rgba(255,255,255,0.08)] text-[#555] hover:text-[#888]'
              )}
            >
              {fieldLabel(f)}
            </button>
          ))}
        </div>
      )}

      {/* Period tabs */}
      <div className="mb-4 flex gap-1">
        {PERIODS.map(p => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={cn(
              'flex-1 rounded-lg py-1.5 text-[11px] font-bold transition-all',
              period === p
                ? 'bg-[rgba(170,255,0,0.12)] text-[#aaff00]'
                : 'text-[#444] hover:text-[#666]'
            )}
          >
            {t(`period.${p}` as Parameters<typeof t>[0])}
          </button>
        ))}
      </div>

      {/* Chart */}
      {chartData.length < 2 ? (
        <p className="py-8 text-center text-[12px] text-[#444]">
          {chartData.length === 0 ? t('noDataPeriod') : t('needMoreData')}
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="date"
              tickFormatter={d => formatDateShort(d as string, locale)}
              tick={{ fill: '#444', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fill: '#444', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `${v as number}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#aaff00"
              strokeWidth={2}
              dot={{ r: 3, fill: '#aaff00', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#aaff00', strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
