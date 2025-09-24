"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import { type UserSubscription, getUsageLimit, isUsageLimitReached } from "@/lib/subscription"

interface UsageTrackerProps {
  subscription: UserSubscription
}

export function UsageTracker({ subscription }: UsageTrackerProps) {
  const disputeLimit = getUsageLimit(subscription, "disputeLetters")
  const chatLimit = getUsageLimit(subscription, "aiChat")

  const disputeUsage = subscription.usage.disputeLetters
  const chatUsage = subscription.usage.aiChat

  const disputePercentage = disputeLimit === "unlimited" ? 0 : (disputeUsage / disputeLimit) * 100
  const chatPercentage = chatLimit === "unlimited" ? 0 : (chatUsage / chatLimit) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Usage This Month</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Dispute Letters</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm">
                {disputeUsage} / {disputeLimit === "unlimited" ? "∞" : disputeLimit}
              </span>
              {isUsageLimitReached(subscription, "disputeLetters") && (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
          {disputeLimit !== "unlimited" && (
            <Progress
              value={disputePercentage}
              className={`h-2 ${disputePercentage > 80 ? "bg-red-100" : "bg-blue-100"}`}
            />
          )}
          {disputeLimit === "unlimited" && (
            <Badge variant="secondary" className="text-xs">
              Unlimited
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">AI Chat Messages</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm">
                {chatUsage} / {chatLimit === "unlimited" ? "∞" : chatLimit}
              </span>
              {isUsageLimitReached(subscription, "aiChat") && <AlertTriangle className="h-4 w-4 text-red-500" />}
            </div>
          </div>
          {chatLimit !== "unlimited" && (
            <Progress value={chatPercentage} className={`h-2 ${chatPercentage > 80 ? "bg-red-100" : "bg-green-100"}`} />
          )}
          {chatLimit === "unlimited" && (
            <Badge variant="secondary" className="text-xs">
              Unlimited
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Certified Mail</span>
            <span className="text-sm">{subscription.usage.certifiedMail} sent</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
