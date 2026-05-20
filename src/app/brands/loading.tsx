export default function BrandsLoading() {
  return (
    <div className="p-8 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-4 w-72 animate-pulse rounded-xl bg-slate-200" />
        </div>
        <div className="h-10 w-28 animate-pulse rounded-xl bg-slate-200" />
      </div>

      {/* Brand cards grid skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm space-y-4"
          >
            {/* Card header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200" />
                <div className="space-y-1.5">
                  <div className="h-5 w-32 animate-pulse rounded-xl bg-slate-200" />
                  <div className="h-3 w-24 animate-pulse rounded-xl bg-slate-200" />
                </div>
              </div>
              <div className="h-6 w-20 animate-pulse rounded-xl bg-slate-200" />
            </div>
            {/* Category badge */}
            <div className="h-6 w-28 animate-pulse rounded-xl bg-slate-200" />
            {/* Competitors line */}
            <div className="h-4 w-56 animate-pulse rounded-xl bg-slate-200" />
            {/* Action buttons */}
            <div className="flex gap-2 pt-1">
              <div className="h-9 w-28 animate-pulse rounded-xl bg-slate-200" />
              <div className="h-9 w-28 animate-pulse rounded-xl bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
