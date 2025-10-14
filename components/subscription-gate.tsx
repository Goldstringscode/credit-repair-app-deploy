"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, Crown, Zap } from "lucide-react"
import Link from "next/link"
import { subscriptionTiers, type UserSubscription } from "@/lib/subscription"

interface SubscriptionGateProps {
  requiredTier: keyof typeof subscriptionTiers
  currentSubscription: UserSubscription
  feature: string
  children: React.ReactNode
}

export function SubscriptionGate({ requiredTier, currentSubscription, feature, children }: SubscriptionGateProps) {
  const tierHierarchy: Record<string, number> = { basic: 1, professional: 2, premium: 3 }
  const currentTierLevel = tierHierarchy[currentSubscription.tier]
  const requiredTierLevel = tierHierarchy[requiredTier]

  const hasAccess = currentTierLevel >= requiredTierLevel

  if (hasAccess) {
    return <>{children}</>
  }

  const requiredTierInfo = subscriptionTiers[requiredTier]
  const getIcon = (tier: string) => {
    switch (tier) {
      case "professional":
        return <Crown className="h-6 w-6" />
      case "premium":
        return <Zap className="h-6 w-6" />
      default:
        return <Lock className="h-6 w-6" />
    }
  }

  return (
    <Card className="border-2 border-dashed border-gray-300">
      <CardContent className="p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-gray-100 rounded-full p-3">{getIcon(requiredTier)}</div>
        </div>

        <h3 className="text-xl font-semibold mb-2">Upgrade Required</h3>
        <p className="text-gray-600 mb-4">
          {feature} is available with the {requiredTierInfo.name} plan and above.
        </p>

        <Badge variant="outline" className="mb-4">
          {requiredTierInfo.name} - ${requiredTierInfo.price}/month
        </Badge>

        <div className="space-y-2">
          <Link href="/pricing">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">Upgrade to {requiredTierInfo.name}</Button>
          </Link>
          <Link href="/dashboard/billing">
            <Button variant="outline" className="w-full bg-transparent">
              Manage Subscription
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
