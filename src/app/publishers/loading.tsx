export default function PublishersLoading() {
  return (
    <div className="p-8 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-4 w-72 animate-pulse rounded-xl bg-slate-200" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-xl bg-slate-200" />
      </div>

      {/* Brand profile selector skeleton */}
      <div className="h-16 w-full animate-pulse rounded-2xl bg-slate-200" />

      {/* Search bar + filters skeleton */}
      <div className="rounded-2xl border border-slate-200/60 bg-white p-6 space-y-4">
        <div className="h-5 w-40 animate-pulse rounded-xl bg-slate-200" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="h-10 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-10 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-10 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-10 animate-pulse rounded-xl bg-slate-200" />
        </div>
      </div>

      {/* Filter row skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-9 w-24 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-4 w-40 animate-pulse rounded-xl bg-slate-200" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-2xl border border-slate-200/60 bg-white overflow-hidden">
        {/* Table header */}
        <div className="flex gap-4 border-b border-slate-100 bg-slate-50 px-6 py-3">
          <div className="h-4 w-40 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-4 w-28 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-4 w-24 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-4 w-20 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-4 w-16 animate-pulse rounded-xl bg-slate-200" />
        </div>
        {/* Table rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-slate-50 px-6 py-4">
            <div className="h-5 w-44 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-5 w-32 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-5 w-24 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-5 w-20 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-5 w-16 animate-pulse rounded-xl bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
