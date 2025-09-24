export default function RankProgressionLoading() {
  return (
    <div className="container mx-auto p-6">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded-lg w-64 mb-2 animate-pulse"></div>
        <div className="h-5 bg-gray-200 rounded-lg w-96 animate-pulse"></div>
      </div>

      {/* Current Rank Card Skeleton */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-6 bg-white/20 rounded w-32 mb-2 animate-pulse"></div>
            <div className="h-12 bg-white/20 rounded w-24 mb-2 animate-pulse"></div>
            <div className="h-4 bg-white/20 rounded w-40 animate-pulse"></div>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Progress Chart Skeleton */}
      <div className="bg-white rounded-lg p-6 shadow-lg mb-8">
        <div className="h-6 bg-gray-200 rounded w-32 mb-6 animate-pulse"></div>
        <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
      </div>

      {/* Rank Requirements Grid Skeleton */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="ml-4">
                <div className="h-5 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
              <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
              <div className="space-y-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
