import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function GET() {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY

    if (!stripeSecretKey) {
      return NextResponse.json({
        success: false,
        optional: true,
        message: "Stripe not configured (optional)",
        details: "Add STRIPE_SECRET_KEY to enable payment processing"
      })
    }

    if (!stripeSecretKey.startsWith("sk_")) {
      return NextResponse.json({
        success: false,
        message: "Invalid Stripe secret key format",
        details: "Stripe secret keys should start with 'sk_'"
      })
    }

    const stripe = new Stripe(stripeSecretKey)

    // Test the API key by retrieving account information
    try {
      const account = await stripe.accounts.retrieve()
      
      return NextResponse.json({
        success: true,
        message: "Stripe connected successfully",
        details: `Connected to Stripe account: ${account.display_name || account.id}`
      })

    } catch (stripeError: any) {
      if (stripeError.code === "api_key_invalid") {
        return NextResponse.json({
          success: false,
          message: "Invalid Stripe API key",
          details: "The Stripe secret key is not valid"
        })
      }

      return NextResponse.json({
        success: false,
        message: "Stripe API error",
        details: stripeError.message || "Unknown Stripe error"
      })
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Stripe test failed",
      details: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
