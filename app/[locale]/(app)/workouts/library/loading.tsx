import { Skeleton, SkeletonCard, SkeletonText } from '@/components/ui/skeleton';

export default function ExerciseLibraryLoading() {
  return (
    <div aria-busy="true" className="flex flex-col pb-section pt-section-top">
      <section aria-hidden="true" className="px-page">
        <SkeletonText lines={3} />
      </section>

      <section aria-hidden="true" className="mt-lg px-page">
        <Skeleton className="h-input" />
      </section>

      <section aria-hidden="true" className="mt-md px-page">
        <div className="flex gap-sm overflow-hidden">
          <Skeleton className="h-button-sm w-skeleton-avatar-lg rounded-pill" />
          <Skeleton className="h-button-sm w-skeleton-avatar-lg rounded-pill" />
          <Skeleton className="h-button-sm w-skeleton-avatar-lg rounded-pill" />
        </div>
      </section>

      <section aria-hidden="true" className="mt-sm px-page">
        <div className="flex gap-sm overflow-hidden">
          <Skeleton className="h-button-sm w-skeleton-avatar-lg rounded-pill" />
          <Skeleton className="h-button-sm w-skeleton-avatar-lg rounded-pill" />
          <Skeleton className="h-button-sm w-skeleton-avatar-lg rounded-pill" />
          <Skeleton className="h-button-sm w-skeleton-avatar-lg rounded-pill" />
        </div>
      </section>

      <section aria-hidden="true" className="mt-lg space-y-sm px-page">
        <SkeletonCard lines={2} showAvatar />
        <SkeletonCard lines={2} showAvatar />
        <SkeletonCard lines={2} showAvatar />
        <SkeletonCard lines={2} showAvatar />
      </section>
    </div>
  );
}
