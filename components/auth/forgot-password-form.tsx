'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/auth';
import { resetPasswordAction } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function ForgotPasswordForm({ locale }: { locale: string }) {
  const t = useTranslations('auth.forgotPassword');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/${locale}/reset-password`;
      const result = await resetPasswordAction(data.email, redirectTo);
      if (!result.success) {
        setError('root', { message: result.error });
        return;
      }
      setSent(true);
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
      <div className="text-center">
        <div className="text-3xl font-bold tracking-tight">
          <span className="text-[#aaff00]">Mundo</span>
          <span className="text-[#f5f5f5]">Fit</span>
        </div>
      </div>

      <Card className="flex flex-col gap-5 p-xl">
        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 text-center py-2"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                <CheckCircle2 size={28} className="text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-text-primary">Link sent!</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Check your inbox for the password reset link.
                </p>
              </div>
              <Link
                href={`/${locale}/login`}
                className="text-sm font-semibold text-accent transition-colors hover:text-accent-dim"
              >
                {t('backToLogin')}
              </Link>
            </motion.div>
          ) : (
            <motion.div key="form" className="flex flex-col gap-5">
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

                <Button type="submit" isLoading={isLoading} fullWidth size="lg">
                  {t('submit')}
                </Button>
              </form>

              <div className="flex justify-center border-t border-border pt-4">
                <Link
                  href={`/${locale}/login`}
                  className="text-sm text-text-secondary transition-colors hover:text-accent"
                >
                  {t('backToLogin')}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
