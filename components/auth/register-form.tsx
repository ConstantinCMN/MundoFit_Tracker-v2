'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { AlertCircle, Mail } from 'lucide-react';
import { useRouter } from '@/lib/i18n/navigation';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';
import { signUpAction } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function RegisterForm({ locale }: { locale: string }) {
  const t = useTranslations('auth.register');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmEmailSent, setConfirmEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const result = await signUpAction(data.email, data.password, locale);
      if (!result.success) {
        setError('root', { message: result.error });
        return;
      }
      if (result.data.confirmEmail) {
        setConfirmEmailSent(true);
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

      {/* Confirm email state */}
      <AnimatePresence>
        {confirmEmailSent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 text-center"
          >
            <Card className="flex flex-col items-center gap-4 border-accent/30 bg-accent/5 p-xl text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                <Mail size={26} className="text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-text-primary">Check your email</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  We sent a confirmation link. Click it to activate your account and start your journey.
                </p>
              </div>
              <Link
                href={`/${locale}/login`}
                className="text-sm font-semibold text-accent transition-colors hover:text-accent-dim"
              >
                {t('loginLink')}
              </Link>
            </Card>
          </motion.div>
        ) : (
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
                  autoComplete="new-password"
                  errorMessage={errors.password?.message}
                  helperText={t('passwordHint')}
                  passwordVisibilityLabels={{
                    show: tCommon('showPassword'),
                    hide: tCommon('hidePassword'),
                  }}
                  {...register('password')}
                />
                <Input
                  label={t('confirmPassword')}
                  type="password"
                  autoComplete="new-password"
                  errorMessage={errors.confirmPassword?.message}
                  passwordVisibilityLabels={{
                    show: tCommon('showPassword'),
                    hide: tCommon('hidePassword'),
                  }}
                  {...register('confirmPassword')}
                />

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
                <span className="text-sm text-text-secondary">{t('hasAccount')}</span>
                <Link
                  href={`/${locale}/login`}
                  className="text-sm font-semibold text-accent transition-colors hover:text-accent-dim"
                >
                  {t('loginLink')}
                </Link>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
