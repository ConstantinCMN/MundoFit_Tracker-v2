import { Skeleton, SkeletonButton, SkeletonCard, SkeletonText } from '@/components/ui/skeleton';

export default function AuthLoading() {
  return (
    <div aria-busy="true" className="w-full">
      <SkeletonCard lines={2} />
      <div aria-hidden="true" className="mt-lg space-y-md rounded-card border border-skeleton-border bg-skeleton-soft p-lg">
        <Skeleton className="mx-auto h-skeleton-text w-skeleton-avatar-lg" />
        <SkeletonText lines={2} />
        <div className="space-y-sm">
          <Skeleton className="h-input" />
          <Skeleton className="h-input" />
        </div>
        <SkeletonButton />
      </div>
    </div>
  );
}
