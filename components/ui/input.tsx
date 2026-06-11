'use client';

import { forwardRef, useState, useId, useEffect, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
  hint?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      className,
      type = 'text',
      value,
      defaultValue,
      onChange,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const id = useId();
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(
      value !== undefined
        ? String(value).length > 0
        : defaultValue !== undefined
          ? String(defaultValue).length > 0
          : false
    );
    const [showPwd, setShowPwd] = useState(false);

    // Keep hasValue in sync for controlled inputs
    useEffect(() => {
      if (value !== undefined) {
        setHasValue(String(value).length > 0);
      }
    }, [value]);

    const isPassword = type === 'password';
    const isActive = isFocused || hasValue;

    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        <div className="relative">
          <input
            id={id}
            ref={ref}
            type={isPassword ? (showPwd ? 'text' : 'password') : type}
            value={value}
            defaultValue={defaultValue}
            onChange={(e) => {
              setHasValue(e.target.value.length > 0);
              onChange?.(e);
            }}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              setHasValue(e.target.value.length > 0);
              onBlur?.(e);
            }}
            className={cn(
              'w-full rounded-xl bg-[#1a1a1a] border px-4 pb-2.5 pt-6',
              'text-[15px] text-[#f5f5f5] outline-none transition-all duration-150',
              'autofill:bg-[#1a1a1a]',
              error
                ? 'border-[#ff4444]'
                : isFocused
                  ? 'border-[rgba(170,255,0,0.5)] shadow-[0_0_0_3px_rgba(170,255,0,0.06)]'
                  : 'border-[#2a2a2a] hover:border-[#3a3a3a]',
              isPassword && 'pr-12'
            )}
            {...props}
          />
          <label
            htmlFor={id}
            className={cn(
              'absolute left-4 pointer-events-none transition-all duration-150',
              isActive ? 'top-2 text-[11px]' : 'top-1/2 -translate-y-1/2 text-[15px]',
              error
                ? isActive
                  ? 'text-[#ff4444]'
                  : 'text-[#888888]'
                : isFocused
                  ? 'text-[#aaff00]'
                  : 'text-[#888888]'
            )}
          >
            {label}
          </label>

          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#f5f5f5] transition-colors p-1"
              aria-label={showPwd ? 'Hide password' : 'Show password'}
            >
              {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>

        {(error || hint) && (
          <p className={cn('px-1 text-xs', error ? 'text-[#ff4444]' : 'text-[#666666]')}>
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
