'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import { signOutAction } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';

export function SignOutButton({ locale }: { locale: string }) {
  const t = useTranslations('profile.actions');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOutAction();
    router.push('/login');
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      isLoading={isLoading}
      onClick={handleSignOut}
    >
      {t('signOut')}
    </Button>
  );
}
