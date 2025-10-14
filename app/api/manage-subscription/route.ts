import { type NextRequest, NextResponse } from "next/server"
import { getStripeClient } from "@/lib/stripe-client"

export async function POST(request: NextRequest) {
  try {
    const { action, subscriptionId, customerId, newPriceId } = await request.json()

    const stripe = getStripeClient()
    switch (action) {
      case "cancel":
        const cancelledSubscription = await stripe.subscriptions.cancel(subscriptionId)
        return NextResponse.json({
          success: true,
          subscription: cancelledSubscription,
        })

      case "update":
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
          items: [
            {
              id: subscription.items.data[0].id,
              price: newPriceId,
            },
          ],
          proration_behavior: "create_prorations",
        })
        return NextResponse.json({
          success: true,
          subscription: updatedSubscription,
        })

      case "reactivate":
        const reactivatedSubscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: false,
        })
        return NextResponse.json({
          success: true,
          subscription: reactivatedSubscription,
        })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Subscription management error:", error)
    return NextResponse.json({ error: "Failed to manage subscription" }, { status: 500 })
  }
}
