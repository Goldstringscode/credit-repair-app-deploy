import { type NextRequest, NextResponse } from "next/server"
import { getStripeClient } from "@/lib/stripe-client"

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, customerInfo, planId, priceId } = await request.json()

    // Retrieve the payment intent to get the customer and payment method
    const stripe = getStripeClient()
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (!paymentIntent.customer || !paymentIntent.payment_method) {
      throw new Error("Invalid payment intent")
    }

    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentIntent.payment_method as string, {
      customer: paymentIntent.customer as string,
    })

    // Set as default payment method
    await stripe.customers.update(paymentIntent.customer as string, {
      invoice_settings: {
        default_payment_method: paymentIntent.payment_method as string,
      },
    })

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: paymentIntent.customer as string,
      items: [{ price: priceId }],
      default_payment_method: paymentIntent.payment_method as string,
      metadata: {
        planId: planId,
        paymentIntentId: paymentIntentId,
      },
    })

    // Here you would typically save the subscription to your database
    // await saveSubscriptionToDatabase({
    //   userId: userId, // You'd get this from authentication
    //   stripeCustomerId: paymentIntent.customer,
    //   stripeSubscriptionId: subscription.id,
    //   planId: planId,
    //   status: subscription.status,
    // })

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      customerId: paymentIntent.customer,
    })
  } catch (error) {
    console.error("Error creating subscription:", error)
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 })
  }
}
