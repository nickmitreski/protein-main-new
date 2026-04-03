interface SkeletonLoaderProps {
  variant?: 'product' | 'card' | 'text' | 'circle';
  count?: number;
  className?: string;
}

export function SkeletonLoader({ variant = 'product', count = 1, className = '' }: SkeletonLoaderProps) {
  const skeletons = Array.from({ length: count });

  if (variant === 'product') {
    return (
      <>
        {skeletons.map((_, i) => (
          <div key={i} className={`animate-pulse ${className}`}>
            <div className="aspect-square bg-gray-200 rounded-t-lg mb-4" />
            <div className="p-4 space-y-3">
              <div className="h-3 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-5/6" />
              <div className="flex justify-between items-center mt-4">
                <div className="h-6 bg-gray-200 rounded w-1/3" />
                <div className="h-10 bg-gray-200 rounded w-20" />
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }

  if (variant === 'card') {
    return (
      <>
        {skeletons.map((_, i) => (
          <div key={i} className={`animate-pulse border border-gray-200 rounded-lg p-6 ${className}`}>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
            <div className="h-3 bg-gray-200 rounded w-full mb-2" />
            <div className="h-3 bg-gray-200 rounded w-3/4" />
          </div>
        ))}
      </>
    );
  }

  if (variant === 'circle') {
    return (
      <>
        {skeletons.map((_, i) => (
          <div key={i} className={`animate-pulse ${className}`}>
            <div className="w-12 h-12 bg-gray-200 rounded-full" />
          </div>
        ))}
      </>
    );
  }

  // text variant
  return (
    <>
      {skeletons.map((_, i) => (
        <div key={i} className={`animate-pulse ${className}`}>
          <div className="h-4 bg-gray-200 rounded w-full" />
        </div>
      ))}
    </>
  );
}
