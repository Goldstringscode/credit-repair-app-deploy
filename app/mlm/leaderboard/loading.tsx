export default function LeaderboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded-lg w-64 mb-2 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded-lg w-96 animate-pulse"></div>
        </div>

        {/* Filters Skeleton */}
        <div className="mb-8 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
            ))}
          </div>
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>

        {/* Tabs Skeleton */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
          {["Points", "Earnings", "Team Size", "Sales"].map((tab, i) => (
            <div key={i} className="px-4 py-2 bg-gray-200 rounded-md animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-16"></div>
            </div>
          ))}
        </div>

        {/* Top 3 Podium Skeleton */}
        <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-lg p-6 mb-8">
          <div className="h-8 bg-white/20 rounded w-48 mx-auto mb-6 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 2nd Place */}
            <div className="order-1 md:order-1 text-center">
              <div className="relative mb-4">
                <div className="w-20 h-24 bg-white/20 rounded-t-lg mx-auto animate-pulse"></div>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white/20 rounded-full animate-pulse"></div>
              </div>
              <div className="h-5 bg-white/20 rounded w-24 mx-auto mb-1 animate-pulse"></div>
              <div className="h-4 bg-white/20 rounded w-20 mx-auto mb-2 animate-pulse"></div>
              <div className="h-6 bg-white/20 rounded-full w-16 mx-auto animate-pulse"></div>
            </div>

            {/* 1st Place */}
            <div className="order-2 md:order-2 text-center">
              <div className="relative mb-4">
                <div className="w-20 h-32 bg-white/20 rounded-t-lg mx-auto animate-pulse"></div>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-white/20 rounded-full animate-pulse"></div>
              </div>
              <div className="h-6 bg-white/20 rounded w-28 mx-auto mb-1 animate-pulse"></div>
              <div className="h-4 bg-white/20 rounded w-24 mx-auto mb-2 animate-pulse"></div>
              <div className="h-8 bg-white/20 rounded-full w-20 mx-auto animate-pulse"></div>
            </div>

            {/* 3rd Place */}
            <div className="order-3 md:order-3 text-center">
              <div className="relative mb-4">
                <div className="w-20 h-20 bg-white/20 rounded-t-lg mx-auto animate-pulse"></div>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white/20 rounded-full animate-pulse"></div>
              </div>
              <div className="h-5 bg-white/20 rounded w-24 mx-auto mb-1 animate-pulse"></div>
              <div className="h-4 bg-white/20 rounded w-20 mx-auto mb-2 animate-pulse"></div>
              <div className="h-6 bg-white/20 rounded-full w-16 mx-auto animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Rest of Leaderboard Skeleton */}
        <div className="bg-white rounded-lg p-6 shadow-lg mb-8">
          <div className="h-6 bg-gray-200 rounded w-32 mb-6 animate-pulse"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                      <div className="h-5 bg-gray-200 rounded-full w-12 animate-pulse"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-20 mb-1 animate-pulse"></div>
                    <div className="flex flex-wrap gap-1">
                      {[...Array(2)].map((_, j) => (
                        <div key={j} className="h-4 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-5 bg-gray-200 rounded w-16 mb-1 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-12 mb-1 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Insights Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-5 bg-white/20 rounded w-20 mb-2 animate-pulse"></div>
                  <div className="h-8 bg-white/20 rounded w-12 mb-1 animate-pulse"></div>
                  <div className="h-4 bg-white/20 rounded w-24 animate-pulse"></div>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
