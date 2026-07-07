import { setRequestLocale } from 'next-intl/server';
import { Card } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

// Sprint 7 â€” Goals
export default async function GoalsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="p-4">
      <Card className="p-4">
        <p className="text-sm text-text-secondary">Sprint 7 â€” Goals coming soon</p>
      </Card>
    </div>
  );
}
