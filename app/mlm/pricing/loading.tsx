export default function PricingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header Skeleton */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section Skeleton */}
        <div className="text-center mb-16">
          <div className="h-16 bg-gray-200 rounded w-96 mx-auto mb-6 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-full max-w-3xl mx-auto mb-8 animate-pulse"></div>

          {/* Billing Toggle Skeleton */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
            <div className="w-12 h-6 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded-full w-24 animate-pulse"></div>
          </div>

          {/* Success Stats Skeleton */}
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-16">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-gray-200 rounded w-20 mx-auto mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-24 mx-auto animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mx-auto mb-8">
          {["Pricing Plans", "Commission Structure", "Rank System", "Earning Examples"].map((tab, i) => (
            <div key={i} className="px-4 py-2 bg-gray-200 rounded-md animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-20"></div>
            </div>
          ))}
        </div>

        {/* Pricing Cards Skeleton */}
        <div className="grid lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`relative bg-white rounded-lg p-6 shadow-lg ${i === 1 ? "scale-105 border-2 border-purple-500" : "border border-gray-200"}`}
            >
              {i === 1 && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="h-8 bg-gray-200 rounded-full w-24 animate-pulse"></div>
                </div>
              )}

              <div className="text-center pb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-32 mx-auto mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-6 animate-pulse"></div>

                <div className="mt-6">
                  <div className="flex items-baseline justify-center">
                    <div className="h-12 bg-gray-200 rounded w-20 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-16 ml-2 animate-pulse"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-24 mx-auto mt-1 animate-pulse"></div>
                </div>
              </div>

              {/* Commission Breakdown Skeleton */}
              <div className="space-y-3 mb-6">
                <div className="h-5 bg-gray-200 rounded w-32 mx-auto mb-3 animate-pulse"></div>
                <div className="grid grid-cols-2 gap-2">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="flex justify-between p-2 bg-gray-50 rounded">
                      <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-8 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse mt-0.5"></div>
                    <div className="h-4 bg-gray-200 rounded flex-1 animate-pulse"></div>
                  </div>
                ))}
              </div>

              <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
