export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-6xl mx-auto px-4 py-12 lg:py-16 animate-pulse">

        {/* Header skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <div className="h-3 w-20 bg-white/5 rounded-full mb-3" />
            <div className="h-9 w-64 bg-white/5 rounded-lg mb-2" />
            <div className="h-4 w-40 bg-white/5 rounded-full" />
          </div>
          <div className="h-10 w-28 bg-white/5 rounded-full" />
        </div>

        {/* Stat card skeletons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#111] border border-white/5 rounded-2xl p-5 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5" />
              <div>
                <div className="h-7 w-12 bg-white/5 rounded-md mb-2" />
                <div className="h-3 w-20 bg-white/5 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Total spent skeleton */}
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex-shrink-0" />
          <div>
            <div className="h-3 w-32 bg-white/5 rounded-full mb-2" />
            <div className="h-8 w-40 bg-white/5 rounded-lg mb-2" />
            <div className="h-3 w-48 bg-white/5 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}