import {
  Skeleton,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
  SkeletonText,
} from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div aria-busy="true" className="flex flex-col gap-section pb-section pt-section-top">
      <section aria-hidden="true" className="px-page">
        <div className="mb-page flex items-center gap-lg">
          <SkeletonAvatar size="lg" />
          <div className="min-w-0 flex-1">
            <SkeletonText lines={2} />
          </div>
        </div>
        <SkeletonCard lines={2} />
      </section>

      <section aria-hidden="true" className="px-page">
        <Skeleton className="mb-md h-skeleton-text w-skeleton-avatar-lg" />
        <SkeletonCard lines={3} showAvatar />
      </section>

      <section aria-hidden="true" className="px-page">
        <Skeleton className="mb-md h-skeleton-text w-skeleton-avatar-lg" />
        <div className="grid grid-cols-2 gap-md">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
        </div>
      </section>

      <section aria-hidden="true" className="px-page">
        <Skeleton className="mb-md h-skeleton-text w-skeleton-avatar-lg" />
        <SkeletonCard lines={3} />
      </section>

      <section aria-hidden="true" className="px-page">
        <Skeleton className="mb-md h-skeleton-text w-skeleton-avatar-lg" />
        <div className="grid grid-cols-2 gap-md">
          <SkeletonCard lines={2} showButton />
          <SkeletonCard lines={2} showButton />
        </div>
      </section>

      <section aria-hidden="true" className="px-page">
        <SkeletonButton />
      </section>
    </div>
  );
}
