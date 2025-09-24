import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function CommissionCalculatorLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <Skeleton className="h-10 w-80 mx-auto mb-4" />
          <Skeleton className="h-5 w-96 mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calculator Form */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Sales */}
              <div>
                <Skeleton className="h-5 w-32 mb-3" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-48 mt-2" />
              </div>

              {/* Team Sales */}
              <div>
                <Skeleton className="h-5 w-28 mb-3" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-52 mt-2" />
              </div>

              {/* Rank Selection */}
              <div>
                <Skeleton className="h-5 w-24 mb-3" />
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="p-3 border rounded-lg">
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Bonus Qualifiers */}
              <div>
                <Skeleton className="h-5 w-36 mb-3" />
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculate Button */}
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>

          {/* Results Panel */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <Skeleton className="h-7 w-40" />
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Total Commission */}
              <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <Skeleton className="h-6 w-32 mx-auto mb-2" />
                <Skeleton className="h-12 w-40 mx-auto mb-2" />
                <Skeleton className="h-4 w-48 mx-auto" />
              </div>

              {/* Commission Breakdown */}
              <div className="space-y-4">
                <Skeleton className="h-6 w-44" />
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-5 w-20" />
                  </div>
                ))}
              </div>

              {/* Rank Progress */}
              <div className="space-y-3">
                <Skeleton className="h-6 w-36" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Commission Structure */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <Skeleton className="h-7 w-48" />
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="space-y-3">
                {/* Table Header */}
                <div className="grid grid-cols-5 gap-4 pb-3 border-b">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>

                {/* Table Rows */}
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="grid grid-cols-5 gap-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Scenarios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                  <Skeleton className="h-6 w-32 mx-auto" />
                  <Skeleton className="h-4 w-48 mx-auto" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4 mx-auto" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4 mx-auto" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
