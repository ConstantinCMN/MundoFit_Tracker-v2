import { cn } from '@/lib/utils/cn';

type SkeletonCardProps = {
  height?: number | string;
  className?: string;
};

export function SkeletonCard({ height = 80, className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-2xl border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)]',
        className
      )}
      style={{ height }}
    />
  );
}
