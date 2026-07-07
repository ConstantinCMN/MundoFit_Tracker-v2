import {
  forwardRef,
  type ForwardedRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'interactive';

type CardBaseProps = {
  variant?: CardVariant;
  loading?: boolean;
  children?: ReactNode;
  className?: string;
};

type StaticCardProps = CardBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
    variant?: Exclude<CardVariant, 'interactive'>;
  };

type InteractiveCardProps = CardBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type'> & {
    variant: 'interactive';
    type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  };

export type CardProps = StaticCardProps | InteractiveCardProps;

const baseStyles =
  'relative w-full overflow-hidden rounded-card border transition-button duration-fast ease-standard motion-reduce:transition-none';

const variantStyles: Record<CardVariant, string> = {
  default: 'border-border bg-bg-surface shadow-card',
  elevated: 'border-border bg-bg-elevated shadow-card',
  outlined: 'border-divider bg-bg-surface shadow-none',
  interactive:
    'cursor-pointer border-border bg-bg-surface shadow-card hover:bg-bg-elevated hover:shadow-card focus:outline-none focus-visible:shadow-button-focus disabled:cursor-not-allowed disabled:opacity-disabled',
};

function LoadingOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
    >
      <Loader2 aria-hidden="true" className="size-5 animate-button-spinner text-accent" />
    </div>
  );
}

export const Card = forwardRef<HTMLDivElement | HTMLButtonElement, CardProps>(function Card(
  { variant = 'default', loading = false, className, children, ...props },
  ref
) {
  const isInteractive = variant === 'interactive';
  const rootClassName = cn(baseStyles, variantStyles[variant], className);

  if (isInteractive) {
    const {
      type = 'button',
      disabled,
      onClick,
      ...buttonProps
    } = props as Omit<InteractiveCardProps, 'variant' | 'loading' | 'className' | 'children'>;

    return (
      <button
        ref={ref as ForwardedRef<HTMLButtonElement>}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        data-loading={loading || undefined}
        data-variant={variant}
        className={rootClassName}
        onClick={onClick}
        {...buttonProps}
      >
        {children}
        {loading && <LoadingOverlay />}
      </button>
    );
  }

  const divProps = props as Omit<StaticCardProps, 'variant' | 'loading' | 'className' | 'children'>;

  return (
    <div
      ref={ref as ForwardedRef<HTMLDivElement>}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
      data-variant={variant}
      className={rootClassName}
      {...divProps}
    >
      {children}
      {loading && <LoadingOverlay />}
    </div>
  );
});

Card.displayName = 'Card';

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1.5 px-lg pt-lg', className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-lg font-black leading-tight tracking-tight text-text-primary', className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm leading-relaxed text-text-secondary', className)} {...props} />
  );
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-lg py-lg', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center gap-sm px-lg pb-lg pt-0', className)} {...props} />;
}
