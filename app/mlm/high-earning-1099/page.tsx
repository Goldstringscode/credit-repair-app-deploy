"use client"

import { HighEarning1099NEC } from "@/components/mlm/high-earning-1099-nec"

export default function HighEarning1099Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">High-Earning 1099-NEC Showcase</h1>
        <p className="text-gray-600">
          Explore a realistic example of a top-performing MLM participant earning $75,000+ annually in the credit repair
          industry. This detailed breakdown shows the earning potential and tax implications for Diamond Executive level
          performers.
        </p>
      </div>
      <HighEarning1099NEC />
    </div>
  )
}
