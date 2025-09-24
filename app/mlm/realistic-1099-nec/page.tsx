"use client"

import { Realistic1099NECGenerator } from "@/components/mlm/realistic-1099-nec-generator"

export default function Realistic1099NECPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Realistic 1099-NEC Generator</h1>
        <p className="text-gray-600">
          Generate professional, realistic 1099-NEC forms with detailed income breakdowns, tax calculations, and
          business insights for MLM credit repair earnings.
        </p>
      </div>
      <Realistic1099NECGenerator />
    </div>
  )
}
