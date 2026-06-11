import { setRequestLocale } from 'next-intl/server';

export const dynamic = 'force-dynamic';

// Sprint 11 — Workouts Core (body map + templates + session logger)
export default async function WorkoutsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="p-4">
      <div className="rounded-xl border border-[#2a2a2a] bg-[#111111] p-4">
        <p className="text-sm text-[#888888]">Sprint 11 — Workouts coming soon</p>
      </div>
    </div>
  );
}
