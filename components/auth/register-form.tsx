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
import { Input } from '@/components/ui/input';

export function RegisterForm({ locale }: { locale: string }) {
  const t = useTranslations('auth.register');
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
            className="rounded-2xl border border-[rgba(170,255,0,0.3)] bg-[rgba(170,255,0,0.06)] p-6 flex flex-col items-center gap-4 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-[rgba(170,255,0,0.12)] flex items-center justify-center">
              <Mail size={26} className="text-[#aaff00]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#f5f5f5]">Check your email</h2>
              <p className="mt-1 text-sm text-[#888888]">
                We sent a confirmation link. Click it to activate your account and start your journey.
              </p>
            </div>
            <Link
              href={`/${locale}/login`}
              className="text-sm font-semibold text-[#aaff00] hover:text-[#99ee00] transition-colors"
            >
              {t('loginLink')}
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="rounded-2xl border border-[#2a2a2a] bg-[#111111] p-6 flex flex-col gap-5"
          >
            <div>
              <h1 className="text-xl font-bold text-[#f5f5f5]">{t('title')}</h1>
              <p className="mt-1 text-sm text-[#888888]">{t('subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input
                label={t('email')}
                type="email"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label={t('password')}
                type="password"
                autoComplete="new-password"
                error={errors.password?.message}
                hint="Minimum 8 characters"
                {...register('password')}
              />
              <Input
                label={t('confirmPassword')}
                type="password"
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <AnimatePresence>
                {errors.root && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-2.5 rounded-xl bg-[rgba(255,68,68,0.08)] border border-[rgba(255,68,68,0.25)] px-4 py-3"
                  >
                    <AlertCircle size={15} className="text-[#ff4444] flex-shrink-0 mt-0.5" />
                    <p className="text-[13px] text-[#ff4444]">{errors.root.message}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button type="submit" isLoading={isLoading} className="w-full mt-1" size="lg">
                {t('submit')}
              </Button>
            </form>

            <div className="flex items-center justify-center gap-1.5 border-t border-[#1a1a1a] pt-4">
              <span className="text-sm text-[#888888]">{t('hasAccount')}</span>
              <Link
                href={`/${locale}/login`}
                className="text-sm font-semibold text-[#aaff00] hover:text-[#99ee00] transition-colors"
              >
                {t('loginLink')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
