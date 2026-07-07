import { setRequestLocale } from 'next-intl/server';
import { Card } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

// Sprint 8 â€” Calories Calculator (TDEE + macro targets)
export default async function CaloriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="p-4">
      <Card className="p-4">
        <p className="text-sm text-text-secondary">Sprint 8 â€” Calories Calculator coming soon</p>
      </Card>
    </div>
  );
}
