import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export type SkeletonShape = 'rectangular' | 'rounded' | 'circular';
export type SkeletonAnimation = 'shimmer' | 'none';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  shape?: SkeletonShape;
  animation?: SkeletonAnimation;
  decorative?: boolean;
}

const shapeStyles: Record<SkeletonShape, string> = {
  rectangular: 'rounded-none',
  rounded:     'rounded-card',
  circular:    'rounded-full',
};

const shimmerStyles =
  'after:absolute after:inset-0 after:bg-skeleton-shimmer-gradient after:bg-skeleton-shimmer-size after:animate-skeleton-shimmer motion-reduce:after:hidden';

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  {
    shape = 'rounded',
    animation = 'shimmer',
    decorative = true,
    className,
    'aria-hidden': ariaHidden,
    ...props
  },
  ref
) {
  return (
    <div
      ref={ref}
      aria-hidden={decorative ? true : ariaHidden}
      className={cn(
        'relative block w-full overflow-hidden border border-skeleton-border bg-skeleton',
        shapeStyles[shape],
        animation === 'shimmer' && shimmerStyles,
        className
      )}
      {...props}
    />
  );
});

Skeleton.displayName = 'Skeleton';

export interface SkeletonTextProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  lines?: 1 | 2 | 3 | 4;
  size?: 'sm' | 'md';
  animation?: SkeletonAnimation;
  decorative?: boolean;
}

export function SkeletonText({
  lines = 1,
  size = 'md',
  animation,
  decorative = true,
  className,
  'aria-hidden': ariaHidden,
  ...props
}: SkeletonTextProps) {
  const lineClassName = size === 'sm' ? 'h-skeleton-text-sm' : 'h-skeleton-text';

  return (
    <div
      aria-hidden={decorative ? true : ariaHidden}
      className={cn('flex w-full flex-col gap-sm', className)}
      {...props}
    >
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          aria-hidden="true"
          animation={animation}
          className={lineClassName}
          decorative
        />
      ))}
    </div>
  );
}

export interface SkeletonAvatarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  size?: 'sm' | 'md' | 'lg';
  animation?: SkeletonAnimation;
  decorative?: boolean;
}

const avatarSizeStyles: Record<NonNullable<SkeletonAvatarProps['size']>, string> = {
  sm: 'h-skeleton-avatar-sm w-skeleton-avatar-sm',
  md: 'h-skeleton-avatar-md w-skeleton-avatar-md',
  lg: 'h-skeleton-avatar-lg w-skeleton-avatar-lg',
};

export function SkeletonAvatar({
  size = 'md',
  animation,
  decorative = true,
  className,
  ...props
}: SkeletonAvatarProps) {
  return (
    <Skeleton
      shape="circular"
      animation={animation}
      decorative={decorative}
      className={cn('shrink-0', avatarSizeStyles[size], className)}
      {...props}
    />
  );
}

export interface SkeletonButtonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  animation?: SkeletonAnimation;
  decorative?: boolean;
}

export function SkeletonButton({
  animation,
  decorative = true,
  className,
  ...props
}: SkeletonButtonProps) {
  return (
    <Skeleton
      shape="rounded"
      animation={animation}
      decorative={decorative}
      className={cn('h-skeleton-button', className)}
      {...props}
    />
  );
}

export interface SkeletonCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  lines?: 1 | 2 | 3 | 4;
  showAvatar?: boolean;
  showButton?: boolean;
  animation?: SkeletonAnimation;
  decorative?: boolean;
}

export function SkeletonCard({
  lines = 3,
  showAvatar = false,
  showButton = false,
  animation,
  decorative = true,
  className,
  'aria-hidden': ariaHidden,
  ...props
}: SkeletonCardProps) {
  return (
    <div
      aria-hidden={decorative ? true : ariaHidden}
      className={cn(
        'min-h-skeleton-card rounded-card border border-skeleton-border bg-skeleton-soft p-lg',
        className
      )}
      {...props}
    >
      <div className="flex gap-md">
        {showAvatar && <SkeletonAvatar animation={animation} />}
        <div className="flex min-w-0 flex-1 flex-col gap-md">
          <SkeletonText lines={lines} animation={animation} />
          {showButton && <SkeletonButton animation={animation} />}
        </div>
      </div>
    </div>
  );
}
