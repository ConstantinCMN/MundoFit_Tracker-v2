'use client';

import type { Profile } from '@/types';
import type { ScheduleDayWithWorkout } from '@/lib/actions/schedules';
import type { WeightEntry } from '@/components/dashboard/types';
import { HeroSection }          from '@/components/dashboard/sections/hero-section';
import { TodaySection }         from '@/components/dashboard/sections/today-section';
import { QuickStatsSection }    from '@/components/dashboard/sections/quick-stats-section';
import { ProgressSection }      from '@/components/dashboard/sections/progress-section';
import { RecentWorkoutSection } from '@/components/dashboard/sections/recent-workout-section';
import { QuickActionsSection }  from '@/components/dashboard/sections/quick-actions-section';

type DashboardClientProps = {
  profile: Profile;
  hour: number;
  dateStr: string;
  weightLogs: WeightEntry[];
  todayDay: ScheduleDayWithWorkout | null;
};

export function DashboardClient({
  profile,
  hour,
  dateStr,
  weightLogs,
  todayDay,
}: DashboardClientProps) {
  return (
    <div className="space-y-7 pb-24">
      <HeroSection    profile={profile} hour={hour} dateStr={dateStr} />
      <TodaySection   todayDay={todayDay} />
      <QuickStatsSection profile={profile} />
      <ProgressSection   profile={profile} weightLogs={weightLogs} />
      <RecentWorkoutSection />
      <QuickActionsSection />
    </div>
  );
}
