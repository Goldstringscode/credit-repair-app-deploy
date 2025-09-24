"use client"

import { TaxReportingDashboard } from "@/components/mlm/tax-reporting-dashboard"

export default function TaxReportingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <TaxReportingDashboard userId="user_123" />
    </div>
  )
}
