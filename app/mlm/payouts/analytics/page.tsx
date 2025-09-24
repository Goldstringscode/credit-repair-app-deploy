"use client"

import { PayoutAnalyticsDashboard } from "@/components/mlm/payout-analytics-dashboard"

export default function PayoutAnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PayoutAnalyticsDashboard userId="user_123" />
    </div>
  )
}
