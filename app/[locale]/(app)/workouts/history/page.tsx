import { setRequestLocale } from 'next-intl/server';

export const dynamic = 'force-dynamic';

// Sprint 11 — Workout History
export default async function WorkoutHistoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="p-4">
      <div className="rounded-xl border border-[#2a2a2a] bg-[#111111] p-4">
        <p className="text-sm text-[#888888]">Sprint 11 — Workout History coming soon</p>
      </div>
    </div>
  );
}
