export function RestaurantCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="h-56 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-3/4 rounded bg-gray-200" />
        <div className="flex items-center gap-2">
          <div className="h-4 w-12 rounded bg-gray-200" />
          <div className="h-4 w-20 rounded bg-gray-200" />
        </div>
        <div className="h-4 w-1/2 rounded bg-gray-200" />
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-full bg-gray-200" />
          <div className="h-6 w-14 rounded-full bg-gray-200" />
          <div className="h-6 w-12 rounded-full bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export function RestaurantCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <RestaurantCardSkeleton key={i} />
      ))}
    </div>
  );
}
