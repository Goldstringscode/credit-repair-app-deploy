import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"
import jwt from "jsonwebtoken"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// GET - Fetch user's payment methods
export async function GET(request: NextRequest) {
  try {
    // Get user from JWT token
    const authToken = request.cookies.get("auth-token")?.value

    if (!authToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    let userId: string
    try {
      const decoded = jwt.verify(authToken, process.env.JWT_SECRET!) as any
      userId = decoded.userId
    } catch (error) {
      return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 })
    }

    // Get user's Stripe customer ID
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.stripe_customer_id) {
      return NextResponse.json({ paymentMethods: [] })
    }

    // Fetch payment methods from Stripe
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripe_customer_id,
      type: 'card',
    })

    // Also fetch bank accounts
    const bankAccounts = await stripe.customers.listSources(
      user.stripe_customer_id,
      { object: 'bank_account' }
    )

    // Format payment methods for frontend
    const formattedMethods = [
      ...paymentMethods.data.map(pm => ({
        id: pm.id,
        type: 'card',
        card: {
          brand: pm.card?.brand || 'unknown',
          last4: pm.card?.last4 || '',
          expMonth: pm.card?.exp_month || 0,
          expYear: pm.card?.exp_year || 0,
        },
        isDefault: false, // Will be set based on default payment method
        isExpired: false, // Will be calculated
        isMLMApproved: true,
        payoutEligible: true,
        created: pm.created,
      })),
      ...bankAccounts.data.map(ba => ({
        id: ba.id,
        type: 'bank',
        bank: {
          bankName: (ba as any).bank_name || 'Unknown Bank',
          last4: ba.last4 || '',
          accountType: ba.account_holder_type || 'individual',
        },
        isDefault: false,
        isExpired: false,
        isMLMApproved: true,
        payoutEligible: true,
        created: ba.created,
      }))
    ]

    // Get default payment method
    const customer = await stripe.customers.retrieve(user.stripe_customer_id)
    const defaultPaymentMethod = (customer as any).invoice_settings?.default_payment_method

    // Mark default payment method
    formattedMethods.forEach(method => {
      if (method.id === defaultPaymentMethod) {
        method.isDefault = true
      }
    })

    return NextResponse.json({ paymentMethods: formattedMethods })
  } catch (error) {
    console.error("Error fetching payment methods:", error)
    return NextResponse.json({ error: "Failed to fetch payment methods" }, { status: 500 })
  }
}

// POST - Add new payment method
export async function POST(request: NextRequest) {
  try {
    // Get user from JWT token
    const authToken = request.cookies.get("auth-token")?.value

    if (!authToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    let userId: string
    try {
      const decoded = jwt.verify(authToken, process.env.JWT_SECRET!) as any
      userId = decoded.userId
    } catch (error) {
      return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 })
    }

    const { type, card, bank, paypal, isDefault } = await request.json()

    // Get user's Stripe customer ID
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("stripe_customer_id, email")
      .eq("id", userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let customerId = user.stripe_customer_id

    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: userId,
          userType: 'mlm',
        },
      })
      customerId = customer.id

      // Update user with Stripe customer ID
      await supabase
        .from("users")
        .update({ stripe_customer_id: customerId })
        .eq("id", userId)
    }

    let paymentMethod

    if (type === 'card') {
      // In production, you would use Stripe Elements to create payment method
      // For now, we'll simulate it
      paymentMethod = {
        id: `pm_${Date.now()}`,
        type: 'card',
        card: card,
        isDefault: isDefault,
        isExpired: false,
        isMLMApproved: true,
        payoutEligible: true,
      }
    } else if (type === 'bank') {
      // Create bank account token (simplified for demo)
      paymentMethod = {
        id: `ba_${Date.now()}`,
        type: 'bank',
        bank: bank,
        isDefault: isDefault,
        isExpired: false,
        isMLMApproved: true,
        payoutEligible: true,
      }
    } else if (type === 'paypal') {
      paymentMethod = {
        id: `pp_${Date.now()}`,
        type: 'paypal',
        paypal: paypal,
        isDefault: isDefault,
        isExpired: false,
        isMLMApproved: true,
        payoutEligible: true,
      }
    } else {
      return NextResponse.json({ error: "Invalid payment method type" }, { status: 400 })
    }

    // Store payment method in database
    const { error: dbError } = await supabase
      .from("mlm_payment_methods")
      .insert({
        user_id: userId,
        stripe_payment_method_id: paymentMethod.id,
        type: type,
        card_details: card || null,
        bank_details: bank || null,
        paypal_details: paypal || null,
        is_default: isDefault,
        is_mlm_approved: true,
        payout_eligible: true,
      })

    if (dbError) {
      console.error("Error storing payment method:", dbError)
      return NextResponse.json({ error: "Failed to store payment method" }, { status: 500 })
    }

    // Set as default if requested
    if (isDefault) {
      await supabase
        .from("mlm_payment_methods")
        .update({ is_default: false })
        .eq("user_id", userId)
        .neq("stripe_payment_method_id", paymentMethod.id)

      await supabase
        .from("mlm_payment_methods")
        .update({ is_default: true })
        .eq("user_id", userId)
        .eq("stripe_payment_method_id", paymentMethod.id)
    }

    return NextResponse.json({ 
      success: true, 
      paymentMethod,
      message: "Payment method added successfully" 
    })
  } catch (error) {
    console.error("Error adding payment method:", error)
    return NextResponse.json({ error: "Failed to add payment method" }, { status: 500 })
  }
}

// PUT - Update payment method
export async function PUT(request: NextRequest) {
  try {
    // Get user from JWT token
    const authToken = request.cookies.get("auth-token")?.value

    if (!authToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    let userId: string
    try {
      const decoded = jwt.verify(authToken, process.env.JWT_SECRET!) as any
      userId = decoded.userId
    } catch (error) {
      return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 })
    }

    const { paymentMethodId, isDefault } = await request.json()

    if (!paymentMethodId) {
      return NextResponse.json({ error: "Payment method ID required" }, { status: 400 })
    }

    // Update payment method in database
    const { error: updateError } = await supabase
      .from("mlm_payment_methods")
      .update({ 
        is_default: isDefault,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId)
      .eq("stripe_payment_method_id", paymentMethodId)

    if (updateError) {
      console.error("Error updating payment method:", updateError)
      return NextResponse.json({ error: "Failed to update payment method" }, { status: 500 })
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await supabase
        .from("mlm_payment_methods")
        .update({ is_default: false })
        .eq("user_id", userId)
        .neq("stripe_payment_method_id", paymentMethodId)
    }

    return NextResponse.json({ 
      success: true, 
      message: "Payment method updated successfully" 
    })
  } catch (error) {
    console.error("Error updating payment method:", error)
    return NextResponse.json({ error: "Failed to update payment method" }, { status: 500 })
  }
}

// DELETE - Remove payment method
export async function DELETE(request: NextRequest) {
  try {
    // Get user from JWT token
    const authToken = request.cookies.get("auth-token")?.value

    if (!authToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    let userId: string
    try {
      const decoded = jwt.verify(authToken, process.env.JWT_SECRET!) as any
      userId = decoded.userId
    } catch (error) {
      return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const paymentMethodId = searchParams.get('id')

    if (!paymentMethodId) {
      return NextResponse.json({ error: "Payment method ID required" }, { status: 400 })
    }

    // Delete payment method from database
    const { error: deleteError } = await supabase
      .from("mlm_payment_methods")
      .delete()
      .eq("user_id", userId)
      .eq("stripe_payment_method_id", paymentMethodId)

    if (deleteError) {
      console.error("Error deleting payment method:", deleteError)
      return NextResponse.json({ error: "Failed to delete payment method" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Payment method deleted successfully" 
    })
  } catch (error) {
    console.error("Error deleting payment method:", error)
    return NextResponse.json({ error: "Failed to delete payment method" }, { status: 500 })
  }
}