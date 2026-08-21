export function SkeletonLine({ className = "" }) {
  return <div className={`skeleton h-4 rounded-lg bg-white/[0.06] animate-pulse ${className}`} />;
}

export function SkeletonRow() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-white/[0.06] gap-3">
      <div className="flex-1 sm:pr-4">
        <div className="flex items-center gap-3">
          {/* Avatar skeleton */}
          <div className="w-9 h-9 rounded-full bg-white/[0.06] animate-pulse flex-shrink-0" />
          <div className="flex-1">
            <SkeletonLine className="w-2/3 mb-2" />
            <SkeletonLine className="w-1/3 h-3" />
          </div>
        </div>
      </div>
      <div className="flex gap-2 ml-11 sm:ml-0">
        <div className="skeleton h-8 w-20 rounded-lg bg-white/[0.06] animate-pulse" />
        <div className="skeleton h-8 w-20 rounded-lg bg-white/[0.06] animate-pulse" />
      </div>
    </div>
  );
}

export function SkeletonList({ rows = 4 }) {
  return (
    <div className="divide-y divide-white/[0.06] border border-white/[0.06] rounded-xl overflow-hidden bg-white/[0.015]">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}

// Document item skeleton (for dashboard)
export function SkeletonDocumentRow() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-white/[0.06] gap-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* File icon skeleton */}
        <div className="w-10 h-10 rounded-xl bg-white/[0.06] animate-pulse flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <SkeletonLine className="w-3/4 mb-2" />
          <div className="flex items-center gap-2">
            <SkeletonLine className="w-16 h-3" />
            <div className="w-0.5 h-3 bg-white/[0.06] rounded-full" />
            <SkeletonLine className="w-20 h-3" />
          </div>
        </div>
      </div>
      <div className="flex gap-1.5 ml-12 sm:ml-0">
        <div className="skeleton h-8 w-8 rounded-lg bg-white/[0.06] animate-pulse" />
        <div className="skeleton h-8 w-8 rounded-lg bg-white/[0.06] animate-pulse" />
        <div className="skeleton h-8 w-8 rounded-lg bg-white/[0.06] animate-pulse" />
      </div>
    </div>
  );
}

// Stats card skeleton
export function SkeletonStatsCard() {
  return (
    <div className="relative bg-white/[0.03] rounded-xl p-4 border border-white/[0.06] overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/[0.06] animate-pulse" />
      <div className="flex items-center justify-between pl-2">
        <div>
          <SkeletonLine className="w-24 h-4 mb-2" />
          <SkeletonLine className="w-12 h-7" />
        </div>
        <div className="w-10 h-10 rounded-lg bg-white/[0.06] animate-pulse" />
      </div>
    </div>
  );
}

// Stats grid skeleton
export function SkeletonStatsGrid({ count = 3 }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-${count} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonStatsCard key={i} />
      ))}
    </div>
  );
}

// Upload area skeleton
export function SkeletonUploadArea() {
  return (
    <div className="relative border-2 border-dashed border-white/[0.08] rounded-xl p-5 sm:p-6 bg-white/[0.02]">
      <div className="text-center">
        <div className="inline-flex p-4 bg-white/[0.04] rounded-xl border border-white/[0.06] mb-3">
          <div className="w-7 h-7 bg-white/[0.06] rounded-lg animate-pulse" />
        </div>
        <SkeletonLine className="w-48 h-4 mx-auto mb-2" />
        <SkeletonLine className="w-64 h-3 mx-auto" />
      </div>
    </div>
  );
}

// Full page skeleton for dashboard/admin panel
export function SkeletonPage() {
  return (
    <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/40 p-5 sm:p-8 border border-white/[0.06]">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/[0.06] animate-pulse" />
          <div>
            <SkeletonLine className="w-48 h-7 mb-2" />
            <SkeletonLine className="w-32 h-4" />
          </div>
        </div>
        <div className="skeleton h-10 w-24 rounded-xl bg-white/[0.06] animate-pulse" />
      </div>

      {/* Stats skeleton */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonStatsCard key={i} />
        ))}
      </div>

      {/* List skeleton */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <SkeletonLine className="w-32 h-6" />
          <SkeletonLine className="w-20 h-6" />
        </div>
        <SkeletonList rows={3} />
      </div>
    </div>
  );
}