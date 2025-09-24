"use client"

import { PayoutDashboard } from "@/components/mlm/payout-dashboard"

export default function PayoutsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Commission Payouts</h1>
        <p className="text-gray-600">Manage your earnings and payout preferences</p>
      </div>

      <PayoutDashboard userId="user_123" />
    </div>
  )
}
