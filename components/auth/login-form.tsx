'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { AlertCircle, Check } from 'lucide-react';
import { useRouter } from '@/lib/i18n/navigation';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { signInAction } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/cn';

const STORAGE_KEY = 'mundofit_remembered_email';

export function LoginForm({ locale }: { locale: string }) {
  const t = useTranslations('auth.login');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setValue('email', saved, { shouldValidate: false });
      setRememberEmail(true);
    }
  }, [setValue]);

  const onSubmit = async (data: LoginFormData) => {
    if (rememberEmail) {
      localStorage.setItem(STORAGE_KEY, data.email);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }

    setIsLoading(true);
    try {
      const result = await signInAction(data.email, data.password);
      if (!result.success) {
        setError('root', { message: result.error });
        return;
      }
      // Navigate based on onboarding status
      if (result.data.onboardingCompleted) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col gap-6 w-full"
    >
      {/* Brand */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05, duration: 0.35 }}
        className="text-center"
      >
        <div className="text-3xl font-bold tracking-tight">
          <span className="text-[#aaff00]">Mundo</span>
          <span className="text-[#f5f5f5]">Fit</span>
        </div>
        <p className="mt-1 text-xs text-[#666666] tracking-widest uppercase">
          Track · Train · Transform
        </p>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
        className="flex flex-col gap-5"
      >
        <Card className="flex flex-col gap-5 p-xl">
          <div>
            <h1 className="text-xl font-bold text-text-primary">{t('title')}</h1>
            <p className="mt-1 text-sm text-text-secondary">{t('subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label={t('email')}
              type="email"
              autoComplete="email"
              errorMessage={errors.email?.message}
              {...register('email')}
            />
            <Input
              label={t('password')}
              type="password"
              autoComplete="current-password"
              errorMessage={errors.password?.message}
              passwordVisibilityLabels={{
                show: tCommon('showPassword'),
                hide: tCommon('hidePassword'),
              }}
              {...register('password')}
            />

            <div className="flex items-center justify-between -mt-1">
              <button
                type="button"
                onClick={() => setRememberEmail((v) => !v)}
                className="flex items-center gap-2"
              >
                <div
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded-sm border transition-colors',
                    rememberEmail
                      ? 'border-accent bg-accent'
                      : 'border-border bg-transparent'
                  )}
                >
                  {rememberEmail && <Check size={10} color="#0a0a0a" strokeWidth={3} />}
                </div>
                <span className="text-sm text-text-secondary">{t('rememberEmail')}</span>
              </button>
              <Link
                href={`/${locale}/forgot-password`}
                className="text-sm text-text-muted transition-colors hover:text-accent"
              >
                {t('forgotPassword')}
              </Link>
            </div>

            <AnimatePresence>
              {errors.root && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-2.5 rounded-xl border border-danger/25 bg-danger/10 px-4 py-3"
                >
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-danger" />
                  <p className="text-[13px] text-danger">{errors.root.message}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" isLoading={isLoading} fullWidth className="mt-1" size="lg">
              {t('submit')}
            </Button>
          </form>

          <div className="flex items-center justify-center gap-1.5 border-t border-border pt-4">
            <span className="text-sm text-text-secondary">{t('noAccount')}</span>
            <Link
              href={`/${locale}/register`}
              className="text-sm font-semibold text-accent transition-colors hover:text-accent-dim"
            >
              {t('registerLink')}
            </Link>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
