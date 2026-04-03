export function ProductSkeleton() {
  return (
    <div className="animate-pulse border border-gray-200 rounded-lg overflow-hidden">
      {/* Image skeleton */}
      <div className="aspect-square bg-gray-200" />

      {/* Content skeleton */}
      <div className="p-4 sm:p-5 space-y-3">
        {/* Category */}
        <div className="h-3 bg-gray-200 rounded w-1/4" />

        {/* Title */}
        <div className="h-5 bg-gray-200 rounded w-3/4" />

        {/* Rating */}
        <div className="h-4 bg-gray-200 rounded w-1/3" />

        {/* Description */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
        </div>

        {/* Features */}
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded w-16" />
          <div className="h-6 bg-gray-200 rounded w-20" />
        </div>

        {/* Price and button */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="h-8 bg-gray-200 rounded w-20" />
          <div className="h-10 bg-gray-200 rounded w-24" />
        </div>
      </div>
    </div>
  );
}
