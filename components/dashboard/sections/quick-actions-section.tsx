'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Dumbbell, Zap, Ruler, History } from 'lucide-react';
import { useRouter } from '@/lib/i18n/navigation';
import { fadeUp } from '@/components/dashboard/ui/animations';
import { SectionHeader } from '@/components/dashboard/ui/section-header';

export function QuickActionsSection() {
  const t      = useTranslations('dashboard');
  const router = useRouter();

  const actions = [
    {
      label: t('actions.bodyHub'),
      desc:  t('actions.bodyHubDesc'),
      Icon:  Dumbbell,
      color: '#c084fc',
      path:  '/body',
    },
    {
      label: t('actions.generator'),
      desc:  t('actions.generatorDesc'),
      Icon:  Zap,
      color: '#aaff00',
      path:  '/workouts/generator',
    },
    {
      label: t('actions.measurements'),
      desc:  t('actions.measurementsDesc'),
      Icon:  Ruler,
      color: '#60a5fa',
      path:  '/measurements',
    },
    {
      label: t('actions.workoutHistory'),
      desc:  t('actions.workoutHistoryDesc'),
      Icon:  History,
      color: '#fb923c',
      path:  '/workouts/history',
    },
  ];

  return (
    <motion.section {...fadeUp(0.25)} className="px-5">
      <SectionHeader label={t('actions.title')} />
      <div className="grid grid-cols-2 gap-3">
        {actions.map(({ label, desc, Icon, color, path }) => (
          <motion.button
            key={path}
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push(path)}
            className="flex flex-col gap-3 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-4 text-left backdrop-blur-sm transition-colors active:bg-[rgba(255,255,255,0.05)]"
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ background: `${color}1e` }}
            >
              <Icon size={20} color={color} />
            </div>
            <div>
              <p className="text-[13px] font-bold leading-tight text-[#cccccc]">
                {label}
              </p>
              <p className="mt-1 text-[11px] leading-snug text-[#555555]">
                {desc}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.section>
  );
}
