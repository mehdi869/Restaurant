export function Skeleton({ className = '' }) {
  return (
    <div
      className={`rounded-lg bg-gradient-to-r from-charcoal-800 via-charcoal-700 to-charcoal-800 bg-[length:200%_100%] animate-[skeleton-loading_1.5s_ease-in-out_infinite] ${className}`}
    />
  )
}

export function MenuCardSkeleton() {
  return (
    <div className="rounded-2xl bg-charcoal-900 border border-charcoal-800 overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
