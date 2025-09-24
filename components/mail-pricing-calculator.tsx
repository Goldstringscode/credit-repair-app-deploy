"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Calculator, DollarSign } from "lucide-react"

interface PricingOptions {
  certifiedMail: boolean
  returnReceipt: boolean
  restrictedDelivery: boolean
  priority: boolean
  adultSignature: boolean
  pages: number
  weight: number
}

export function MailPricingCalculator() {
  const [options, setOptions] = useState<PricingOptions>({
    certifiedMail: true,
    returnReceipt: false,
    restrictedDelivery: false,
    priority: false,
    adultSignature: false,
    pages: 1,
    weight: 1,
  })

  const calculateCost = () => {
    let total = 0.68 // Base First-Class postage

    // Add weight-based postage (additional ounces)
    if (options.weight > 1) {
      total += (options.weight - 1) * 0.24
    }

    // Service fees
    if (options.certifiedMail) total += 3.75
    if (options.returnReceipt) total += 3.05
    if (options.restrictedDelivery) total += 5.45
    if (options.priority) {
      total = total - 0.68 + 8.95 // Replace First-Class with Priority
    }
    if (options.adultSignature) total += 5.45

    return total
  }

  const serviceDetails = [
    {
      name: "First-Class Postage",
      price: options.priority ? 0 : 0.68,
      description: "Standard mail delivery",
      included: !options.priority,
    },
    {
      name: "Priority Mail",
      price: options.priority ? 8.95 : 0,
      description: "1-3 business day delivery",
      included: options.priority,
    },
    {
      name: "Additional Weight",
      price: options.weight > 1 ? (options.weight - 1) * 0.24 : 0,
      description: `${options.weight} oz total`,
      included: options.weight > 1,
    },
    {
      name: "Certified Mail",
      price: options.certifiedMail ? 3.75 : 0,
      description: "Proof of mailing with tracking",
      included: options.certifiedMail,
    },
    {
      name: "Return Receipt",
      price: options.returnReceipt ? 3.05 : 0,
      description: "Proof of delivery signature",
      included: options.returnReceipt,
    },
    {
      name: "Restricted Delivery",
      price: options.restrictedDelivery ? 5.45 : 0,
      description: "Delivery only to addressee",
      included: options.restrictedDelivery,
    },
    {
      name: "Adult Signature",
      price: options.adultSignature ? 5.45 : 0,
      description: "Signature from person 21+",
      included: options.adultSignature,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calculator className="h-5 w-5" />
          <span>Pricing Calculator</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Service Options */}
        <div className="space-y-3">
          {[
            { key: "certifiedMail", label: "Certified Mail", price: 3.75 },
            { key: "returnReceipt", label: "Return Receipt", price: 3.05 },
            { key: "restrictedDelivery", label: "Restricted Delivery", price: 5.45 },
            { key: "priority", label: "Priority Mail", price: 8.95 },
            { key: "adultSignature", label: "Adult Signature", price: 5.45 },
          ].map((service) => (
            <div key={service.key} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={service.key}
                  checked={options[service.key as keyof PricingOptions] as boolean}
                  onChange={(e) => setOptions({ ...options, [service.key]: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor={service.key} className="text-sm">
                  {service.label}
                </Label>
              </div>
              <span className="text-sm font-medium text-green-600">${service.price.toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Cost Breakdown */}
        <div className="space-y-2 pt-4 border-t">
          <h4 className="font-medium text-sm">Cost Breakdown:</h4>
          {serviceDetails
            .filter((service) => service.included)
            .map((service, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600">{service.name}</span>
                <span>${service.price.toFixed(2)}</span>
              </div>
            ))}
        </div>

        {/* Total */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg border">
          <div className="flex items-center justify-between">
            <span className="font-semibold flex items-center space-x-1">
              <DollarSign className="h-4 w-4" />
              <span>Total Cost:</span>
            </span>
            <span className="text-xl font-bold text-green-600">${calculateCost().toFixed(2)}</span>
          </div>
        </div>

        {/* Delivery Time Estimate */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>📦 Processing: Same day (orders by 3 PM EST)</p>
          <p>🚚 Delivery: {options.priority ? "1-3 business days" : "2-5 business days"}</p>
          <p>📧 Tracking updates sent via email</p>
        </div>
      </CardContent>
    </Card>
  )
}
