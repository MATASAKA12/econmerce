export default function StoreLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] animate-pulse">
      {/* Navbar skeleton */}
      <div className="h-16 border-b border-white/5" />

      {/* Hero skeleton */}
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-8 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="h-6 w-48 bg-white/5 rounded-full mb-6" />
          <div className="h-14 w-full bg-white/5 rounded-lg mb-3" />
          <div className="h-14 w-4/5 bg-white/5 rounded-lg mb-3" />
          <div className="h-14 w-3/5 bg-white/5 rounded-lg mb-6" />
          <div className="h-12 w-40 bg-white/5 rounded-full" />
        </div>
        <div className="aspect-square bg-white/5 rounded-3xl" />
      </div>

      {/* Product grid skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="h-8 w-48 bg-white/5 rounded-lg mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] bg-white/5 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}