export default function TrainingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header Skeleton */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Overview Skeleton */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="h-8 bg-white/20 rounded w-48 mb-2 animate-pulse"></div>
                <div className="h-5 bg-white/20 rounded w-64 mb-6 animate-pulse"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="h-8 bg-white/20 rounded w-12 mb-1 animate-pulse"></div>
                    <div className="h-4 bg-white/20 rounded w-20 animate-pulse"></div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="h-8 bg-white/20 rounded w-8 mb-1 animate-pulse"></div>
                    <div className="h-4 bg-white/20 rounded w-24 animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="h-12 bg-white/20 rounded w-16 mb-1 animate-pulse"></div>
                    <div className="h-4 bg-white/20 rounded w-24 animate-pulse"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-6 bg-white/20 rounded w-20 mb-1 animate-pulse"></div>
                    <div className="h-4 bg-white/20 rounded w-16 animate-pulse"></div>
                  </div>
                </div>
                <div className="h-3 bg-white/20 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mb-8">
          {["Training Modules", "Live Training", "Certifications", "Resources"].map((tab, i) => (
            <div key={i} className="px-4 py-2 bg-gray-200 rounded-md animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-20"></div>
            </div>
          ))}
        </div>

        {/* Search and Filter Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>

        {/* Recommended Path Skeleton */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse mr-2"></div>
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-4 overflow-x-auto">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-2 flex-shrink-0">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                {i < 3 && <div className="w-4 h-0.5 bg-gray-200 animate-pulse"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Training Modules Grid Skeleton */}
        <div className="grid lg:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-3 animate-pulse"></div>
                  <div className="flex items-center space-x-4 mb-3">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center space-x-4">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-8 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="h-3 bg-gray-200 rounded w-20 mb-1 animate-pulse"></div>
                  <div className="flex flex-wrap gap-1">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="h-3 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div>
                  <div className="flex flex-wrap gap-1">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>

                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
