'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Dumbbell, ArrowRight } from 'lucide-react';
import { useRouter } from '@/lib/i18n/navigation';
import { fadeUp } from '@/components/dashboard/ui/animations';
import { SectionHeader } from '@/components/dashboard/ui/section-header';
import { DashboardCard } from '@/components/dashboard/ui/dashboard-card';

export function RecentWorkoutSection() {
  const t      = useTranslations('dashboard');
  const router = useRouter();

  return (
    <motion.section {...fadeUp(0.20)} className="px-5">
      <SectionHeader label={t('recentWorkout.title')} />
      <DashboardCard className="px-4 py-3">
        <div className="flex flex-col items-center gap-2">

          {/* Icon with soft glow */}
          <div className="relative">
            <div className="absolute -inset-2 rounded-xl bg-[#c084fc] opacity-[0.05] blur-xl" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)]">
              <Dumbbell size={18} color="#444444" strokeWidth={1.5} />
            </div>
          </div>

          {/* Copy */}
          <div className="text-center">
            <p className="text-[14px] font-bold text-[#555555]">
              {t('recentWorkout.empty')}
            </p>
            <p className="mx-auto mt-1 max-w-[220px] text-[12px] leading-relaxed text-[#3a3a3a]">
              {t('recentWorkout.emptyHint')}
            </p>
          </div>

          {/* CTA */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/body')}
            className="flex items-center gap-2 rounded-xl border border-[rgba(170,255,0,0.2)] bg-[rgba(170,255,0,0.05)] px-5 py-2 text-[12px] font-bold text-[#aaff00] transition-colors active:bg-[rgba(170,255,0,0.08)]"
          >
            {t('recentWorkout.startCta')}
            <ArrowRight size={13} color="#aaff00" />
          </motion.button>

        </div>
      </DashboardCard>
    </motion.section>
  );
}
