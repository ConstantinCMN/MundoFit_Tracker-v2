'use client';

import { type ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  const base =
    'relative inline-flex items-center justify-center font-semibold rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#aaff00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] disabled:opacity-40 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-[#aaff00] text-[#0a0a0a] hover:bg-[#99ee00] active:bg-[#88dd00]',
    secondary:
      'bg-transparent border border-[#2a2a2a] text-[#f5f5f5] hover:bg-[#1a1a1a] hover:border-[#3a3a3a]',
    danger:
      'bg-[rgba(255,68,68,0.1)] border border-[rgba(255,68,68,0.4)] text-[#ff4444] hover:bg-[rgba(255,68,68,0.18)]',
    ghost: 'bg-transparent text-[#888888] hover:text-[#f5f5f5] hover:bg-[#1a1a1a]',
  };

  const sizes = {
    sm: 'h-9 px-4 text-sm gap-1.5',
    md: 'h-12 px-5 text-[15px] gap-2',
    lg: 'h-14 px-6 text-base gap-2',
  };

  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      transition={{ duration: 0.1 }}
      type={type}
      disabled={isDisabled}
      className={cn(base, variants[variant], sizes[size], className)}
      {...(props as object)}
    >
      {isLoading ? <Loader2 size={18} className="animate-spin" /> : children}
    </motion.button>
  );
}
