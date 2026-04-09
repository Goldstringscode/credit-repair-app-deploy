import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabase-client"
import jwt from "jsonwebtoken"

function getVerifiedUserId(request: NextRequest): string {
  const authToken = request.cookies.get("auth-token")?.value
  if (!authToken) {
    throw { message: "Authentication required", status: 401 }
  }
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    throw { message: "Server configuration error", status: 500 }
  }
  const decoded = jwt.verify(authToken, jwtSecret) as any
  if (!decoded.userId) {
    throw { message: "Invalid token payload", status: 401 }
  }
  return decoded.userId as string
}

const DEFAULT_PAYOUT_SETTINGS = {
  minimumPayoutAmount: 50.00,
  payoutSchedule: 'monthly',
  payoutDay: 1,
  payoutMethod: 'card',
  payoutMethodId: '',
  taxId: '',
  taxIdType: 'ssn',
  businessName: '',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  },
  notifications: {
    payoutProcessed: true,
    payoutFailed: true,
    lowBalance: true,
    taxDocuments: true
  }
}

// GET - Fetch user's payout settings
export async function GET(request: NextRequest) {
  try {
    let userId: string
    try {
      userId = getVerifiedUserId(request)
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: err.status ?? 401 })
    }

    const supabase = getSupabaseClient()
    const { data: payoutSettings, error: settingsError } = await supabase
      .from("mlm_payout_settings")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (settingsError && settingsError.code !== 'PGRST116') {
      console.error("Error fetching payout settings:", settingsError)
      if (settingsError.code === '42P01') {
        // Table doesn't exist yet — return defaults so UI renders correctly
        return NextResponse.json({ payoutSettings: DEFAULT_PAYOUT_SETTINGS })
      }
      return NextResponse.json({ error: "Failed to fetch payout settings" }, { status: 500 })
    }

    return NextResponse.json({ payoutSettings: payoutSettings || DEFAULT_PAYOUT_SETTINGS })
  } catch (error) {
    console.error("Error fetching payout settings:", error)
    return NextResponse.json({ error: "Failed to fetch payout settings" }, { status: 500 })
  }
}

// POST - Save user's payout settings
export async function POST(request: NextRequest) {
  try {
    let userId: string
    try {
      userId = getVerifiedUserId(request)
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: err.status ?? 401 })
    }

    const payoutSettings = await request.json()

    // Validate required fields
    if (!payoutSettings.minimumPayoutAmount || payoutSettings.minimumPayoutAmount < 10) {
      return NextResponse.json({ error: "Minimum payout amount must be at least $10" }, { status: 400 })
    }

    if (!payoutSettings.payoutMethodId) {
      return NextResponse.json({ error: "Payout method is required" }, { status: 400 })
    }

    if (!payoutSettings.taxId) {
      return NextResponse.json({ error: "Tax ID is required for payouts" }, { status: 400 })
    }

    const supabase = getSupabaseClient()

    // Check if payout settings already exist
    const { data: existingSettings } = await supabase
      .from("mlm_payout_settings")
      .select("id")
      .eq("user_id", userId)
      .single()

    const settingsData = {
      user_id: userId,
      minimum_payout_amount: payoutSettings.minimumPayoutAmount,
      payout_schedule: payoutSettings.payoutSchedule,
      payout_day: payoutSettings.payoutDay,
      payout_method: payoutSettings.payoutMethod,
      payout_method_id: payoutSettings.payoutMethodId,
      tax_id: payoutSettings.taxId,
      tax_id_type: payoutSettings.taxIdType || 'ssn',
      business_name: payoutSettings.businessName || null,
      address: payoutSettings.address,
      notifications: payoutSettings.notifications,
      updated_at: new Date().toISOString()
    }

    let result
    if (existingSettings) {
      result = await supabase
        .from("mlm_payout_settings")
        .update(settingsData)
        .eq("user_id", userId)
    } else {
      result = await supabase
        .from("mlm_payout_settings")
        .insert({
          ...settingsData,
          created_at: new Date().toISOString()
        })
    }

    if (result.error) {
      console.error("Error saving payout settings:", result.error)
      if (result.error.code === '42P01') {
        return NextResponse.json({
          error: "Payout settings table not found. Please run the database migration first.",
          code: "TABLE_NOT_FOUND"
        }, { status: 500 })
      }
      return NextResponse.json({ error: "Failed to save payout settings" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Payout settings saved successfully",
      payoutSettings
    })
  } catch (error) {
    console.error("Error saving payout settings:", error)
    return NextResponse.json({ error: "Failed to save payout settings" }, { status: 500 })
  }
}

// PUT - Update specific payout settings
export async function PUT(request: NextRequest) {
  try {
    let userId: string
    try {
      userId = getVerifiedUserId(request)
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: err.status ?? 401 })
    }

    const { field, value } = await request.json()

    if (!field) {
      return NextResponse.json({ error: "Field is required" }, { status: 400 })
    }

    const supabase = getSupabaseClient()

    const { error: updateError } = await supabase
      .from("mlm_payout_settings")
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq("user_id", userId)

    if (updateError) {
      console.error("Error updating payout settings:", updateError)
      return NextResponse.json({ error: "Failed to update payout settings" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Payout settings updated successfully"
    })
  } catch (error) {
    console.error("Error updating payout settings:", error)
    return NextResponse.json({ error: "Failed to update payout settings" }, { status: 500 })
  }
}

