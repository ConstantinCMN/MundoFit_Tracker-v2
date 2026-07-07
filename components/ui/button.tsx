import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingLabel?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const baseStyles =
  'relative inline-flex select-none items-center justify-center rounded-card font-bold transition-button duration-fast ease-standard focus:outline-none focus-visible:shadow-button-focus disabled:cursor-not-allowed disabled:opacity-disabled active:scale-button-pressed motion-reduce:transition-none motion-reduce:active:transform-none';

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-button-primary font-black text-button-primary-foreground hover:bg-button-primary-hover active:bg-button-primary-active',
  secondary:
    'border border-button-secondary-border bg-button-secondary text-button-secondary-foreground hover:bg-button-secondary-hover active:bg-button-secondary-active',
  outline:
    'border border-button-outline-border bg-button-outline font-black text-button-outline-foreground hover:bg-button-outline-hover active:bg-button-outline-active',
  ghost:
    'bg-button-ghost text-button-ghost-foreground hover:bg-button-ghost-hover hover:text-button-ghost-foreground-hover active:bg-button-ghost-active',
  danger:
    'border border-button-danger-border bg-button-danger font-black text-button-danger-foreground hover:bg-button-danger-hover active:bg-button-danger-active',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-button-sm gap-button-gap-sm px-button-padding-sm text-sm',
  md: 'h-button-md gap-button-gap-md px-button-padding-md text-base',
  lg: 'h-button-lg gap-button-gap-lg px-button-padding-lg text-base',
};

const iconStyles: Record<ButtonSize, string> = {
  sm: 'size-button-icon-sm [&>svg]:size-full',
  md: 'size-button-icon-md [&>svg]:size-full',
  lg: 'size-button-icon-lg [&>svg]:size-full',
};

const contentGapStyles: Record<ButtonSize, string> = {
  sm: 'gap-button-gap-sm',
  md: 'gap-button-gap-md',
  lg: 'gap-button-gap-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    loadingLabel,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className,
    children,
    disabled,
    type = 'button',
    'aria-label': ariaLabel,
    ...props
  },
  ref
) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      aria-label={isLoading && loadingLabel ? loadingLabel : ariaLabel}
      data-loading={isLoading || undefined}
      data-variant={variant}
      data-size={size}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {isLoading && (
        <Loader2 aria-hidden="true" className={cn('absolute animate-button-spinner', iconStyles[size])} />
      )}
      <span
        className={cn(
          'inline-flex items-center justify-center',
          contentGapStyles[size],
          isLoading && 'opacity-hidden'
        )}
      >
        {leftIcon && (
          <span
            aria-hidden="true"
            className={cn('inline-flex shrink-0 items-center justify-center', iconStyles[size])}
          >
            {leftIcon}
          </span>
        )}
        <span>{children}</span>
        {rightIcon && (
          <span
            aria-hidden="true"
            className={cn('inline-flex shrink-0 items-center justify-center', iconStyles[size])}
          >
            {rightIcon}
          </span>
        )}
      </span>
    </button>
  );
});
