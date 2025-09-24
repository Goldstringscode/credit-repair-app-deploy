"use client"

import { CompetitiveDashboard } from "@/components/competitor-analysis/competitive-dashboard"

export default function CompetitiveAnalysisPage() {
  // In a real app, get affiliate ID from auth context
  const affiliateId = "aff_123"

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <CompetitiveDashboard affiliateId={affiliateId} />
      </div>
    </div>
  )
}
