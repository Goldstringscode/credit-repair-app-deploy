import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import jwt from "jsonwebtoken"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co', 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key'
)

// GET - Fetch user's payout settings
export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
      return NextResponse.json({ 
        payoutSettings: {
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
      })
    }

    // Get user from JWT token
    const authToken = request.cookies.get("auth-token")?.value

    if (!authToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    let userId: string
    try {
      const jwtSecret = process.env.JWT_SECRET || 'demo-secret-key'
      const decoded = jwt.verify(authToken, jwtSecret) as any
      userId = decoded.userId || 'demo-user'
    } catch (error) {
      return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 })
    }

    // Get payout settings from database
    const { data: payoutSettings, error: settingsError } = await supabase
      .from("mlm_payout_settings")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (settingsError && settingsError.code !== 'PGRST116') {
      console.error("Error fetching payout settings:", settingsError)
      // If table doesn't exist, return default settings instead of error
      if (settingsError.code === '42P01') {
        console.log("mlm_payout_settings table doesn't exist, returning defaults")
      } else {
        return NextResponse.json({ error: "Failed to fetch payout settings" }, { status: 500 })
      }
    }

    // Return default settings if none exist
    const defaultSettings = {
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

    return NextResponse.json({ 
      payoutSettings: payoutSettings || defaultSettings 
    })
  } catch (error) {
    console.error("Error fetching payout settings:", error)
    return NextResponse.json({ error: "Failed to fetch payout settings" }, { status: 500 })
  }
}

// POST - Save user's payout settings
export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
      const payoutSettings = await request.json()
      return NextResponse.json({ 
        success: true, 
        message: "Payout settings saved successfully (demo mode)",
        payoutSettings: payoutSettings
      })
    }

    // Get user from JWT token
    const authToken = request.cookies.get("auth-token")?.value

    if (!authToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    let userId: string
    try {
      const jwtSecret = process.env.JWT_SECRET || 'demo-secret-key'
      const decoded = jwt.verify(authToken, jwtSecret) as any
      userId = decoded.userId || 'demo-user'
    } catch (error) {
      return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 })
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
      // Update existing settings
      result = await supabase
        .from("mlm_payout_settings")
        .update(settingsData)
        .eq("user_id", userId)
    } else {
      // Insert new settings
      result = await supabase
        .from("mlm_payout_settings")
        .insert({
          ...settingsData,
          created_at: new Date().toISOString()
        })
    }

    if (result.error) {
      console.error("Error saving payout settings:", result.error)
      // If table doesn't exist, return a helpful error message
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
      payoutSettings: payoutSettings
    })
  } catch (error) {
    console.error("Error saving payout settings:", error)
    return NextResponse.json({ error: "Failed to save payout settings" }, { status: 500 })
  }
}

// PUT - Update specific payout settings
export async function PUT(request: NextRequest) {
  try {
    // Get user from JWT token
    const authToken = request.cookies.get("auth-token")?.value

    if (!authToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    let userId: string
    try {
      const jwtSecret = process.env.JWT_SECRET || 'demo-secret-key'
      const decoded = jwt.verify(authToken, jwtSecret) as any
      userId = decoded.userId || 'demo-user'
    } catch (error) {
      return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 })
    }

    const { field, value } = await request.json()

    if (!field) {
      return NextResponse.json({ error: "Field is required" }, { status: 400 })
    }

    // Update specific field
    const updateData = {
      [field]: value,
      updated_at: new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from("mlm_payout_settings")
      .update(updateData)
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
