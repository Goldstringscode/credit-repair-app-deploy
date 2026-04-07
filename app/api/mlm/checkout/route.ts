import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getCurrentUser } from "@/lib/auth"
import { getSupabaseClient } from "@/lib/supabase-client"
import { sendWelcomeEmail } from "@/lib/email-service-server"

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY environment variable is required")
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" })
}

// MLM tier pricing in cents
const MLM_TIER_PRICES: Record<string, { monthly: number; annual: number }> = {
  starter: { monthly: 9700, annual: 97000 },
  professional: { monthly: 19700, annual: 197000 },
  enterprise: { monthly: 39700, annual: 397000 },
}

// Commission rates and max levels per tier
const MLM_TIER_CONFIG: Record<string, { commissionRate: number; maxLevels: number }> = {
  starter: { commissionRate: 0.25, maxLevels: 3 },
  professional: { commissionRate: 0.3, maxLevels: 7 },
  enterprise: { commissionRate: 0.35, maxLevels: -1 },
}

export async function POST(request: NextRequest) {
  try {
    // 1. Require authentication
    const authResult = await getCurrentUser(request)
    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const user = authResult.user
    const { paymentIntentId, tierId, billing, sponsorCode, firstName, lastName, phone } = await request.json()

    if (!paymentIntentId || !tierId || !billing || !firstName || !lastName) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // 2. Validate the Stripe Payment Intent
    const stripe = getStripe()
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json({ success: false, error: "Payment not completed" }, { status: 400 })
    }

    const supabase = getSupabaseClient()

    // 3. Generate referral code
    const referralCode = `${firstName.toUpperCase().slice(0, 3)}${user.id.slice(-5).toUpperCase()}`

    // 4. Resolve sponsor if provided
    let sponsorUserId: string | null = null
    if (sponsorCode) {
      const { data: sponsorMember } = await supabase
        .from("mlm_members")
        .select("user_id")
        .eq("referral_code", sponsorCode)
        .maybeSingle()
      if (sponsorMember) {
        sponsorUserId = sponsorMember.user_id
      }
    }

    // 5. Get tier config
    const tierConfig = MLM_TIER_CONFIG[tierId] ?? { commissionRate: 0.25, maxLevels: 3 }
    const tierPrices = MLM_TIER_PRICES[tierId]
    if (!tierPrices) {
      return NextResponse.json({ success: false, error: "Invalid tier ID" }, { status: 400 })
    }

    // 6. Create Stripe Subscription for recurring billing.
    // The first period was already charged via the Payment Intent, so use trial_end
    // to set the next billing date and avoid a double charge.
    const customerId = paymentIntent.customer as string
    const unitAmount = billing === "annual" ? tierPrices.annual : tierPrices.monthly
    const interval = billing === "annual" ? "year" : "month"

    const nextBillingDate = new Date()
    if (billing === "annual") {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1)
    } else {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)
    }

    let stripeSubscriptionId: string | null = null
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `MLM ${tierId.charAt(0).toUpperCase() + tierId.slice(1)} Plan`,
                metadata: { tierId, billing },
              },
              unit_amount: unitAmount,
              recurring: { interval },
            },
          },
        ],
        // Skip first period billing — already paid via the Payment Intent
        trial_end: Math.floor(nextBillingDate.getTime() / 1000),
        metadata: { userId: user.id, tierId, billing },
      })
      stripeSubscriptionId = subscription.id
    } catch (subError) {
      console.error("Stripe subscription creation error:", subError)
      // Non-fatal: continue without subscription
    }

    const { data: mlmMember, error: upsertError } = await supabase
      .from("mlm_members")
      .upsert(
        {
          user_id: user.id,
          tier_id: tierId,
          billing_cycle: billing,
          stripe_customer_id: customerId,
          stripe_subscription_id: stripeSubscriptionId,
          sponsor_code: sponsorCode || null,
          sponsor_user_id: sponsorUserId,
          status: "active",
          commission_rate: tierConfig.commissionRate,
          max_levels: tierConfig.maxLevels,
          referral_code: referralCode,
          joined_at: new Date().toISOString(),
          next_billing_date: nextBillingDate.toISOString(),
        },
        { onConflict: "user_id", ignoreDuplicates: false }
      )
      .select("id, referral_code, tier_id, status")
      .maybeSingle()

    if (upsertError) {
      console.error("mlm_members upsert error:", upsertError)
      return NextResponse.json(
        { success: false, error: `Database error: ${upsertError.message}` },
        { status: 500 }
      )
    }

    // 8. Save referral_code back to public.users
    await supabase.from("users").update({ referral_code: referralCode }).eq("id", user.id)

    // 9. Create genealogy record if sponsor found
    if (sponsorUserId) {
      await supabase.from("mlm_genealogy").upsert(
        {
          sponsor_user_id: sponsorUserId,
          member_user_id: user.id,
          level: 1,
          joined_at: new Date().toISOString(),
        },
        { onConflict: "sponsor_user_id,member_user_id", ignoreDuplicates: true }
      )
    }

    // 10. Send welcome email (non-fatal)
    try {
      await sendWelcomeEmail({
        to: user.email,
        name: `${firstName} ${lastName}`,
        teamCode: referralCode,
        dashboardLink: `${process.env.NEXT_PUBLIC_APP_URL || ""}/mlm/dashboard`,
      })
    } catch (emailError) {
      console.error("Welcome email error:", emailError)
    }

    return NextResponse.json({
      success: true,
      mlmUser: {
        id: mlmMember?.id ?? user.id,
        referralCode,
        tierId,
        status: "active",
      },
    })
  } catch (error) {
    console.error("MLM checkout error:", error)
    return NextResponse.json({ success: false, error: "Checkout failed" }, { status: 500 })
  }
}
