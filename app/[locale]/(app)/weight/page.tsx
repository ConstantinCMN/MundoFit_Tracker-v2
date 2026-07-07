import { setRequestLocale } from 'next-intl/server';
import { Card } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

// Sprint 4 â€” Weight Tracking
export default async function WeightPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="p-4">
      <Card className="p-4">
        <p className="text-sm text-text-secondary">Sprint 4 â€” Weight Tracking coming soon</p>
      </Card>
    </div>
  );
}
