import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAuth, type User } from "@/lib/auth"
import { getSupabaseClient } from "@/lib/supabase-client"

const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
})

export const GET = requireAuth(async (_request: NextRequest, user: User): Promise<NextResponse> => {
  try {
    const supabase = getSupabaseClient()
    const { data: dbUser, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, phone, subscription_status, subscription_tier, stripe_customer_id, created_at, updated_at')
      .eq('id', user.id)
      .maybeSingle()

    if (error || !dbUser) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.first_name ?? '',
        lastName: dbUser.last_name ?? '',
        phone: dbUser.phone ?? '',
        createdAt: dbUser.created_at,
        subscription: {
          tier: dbUser.subscription_tier ?? 'free',
          status: dbUser.subscription_status ?? 'inactive',
          stripeCustomerId: dbUser.stripe_customer_id ?? null,
        },
      },
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "An internal error occurred" } },
      { status: 500 }
    )
  }
})

export const PUT = requireAuth(async (request: NextRequest, user: User): Promise<NextResponse> => {
  try {
    const body = await request.json()
    const parsed = updateUserSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
        { status: 400 }
      )
    }

    const updates: Record<string, string> = {}
    if (parsed.data.firstName !== undefined) updates.first_name = parsed.data.firstName
    if (parsed.data.lastName !== undefined) updates.last_name = parsed.data.lastName
    if (parsed.data.phone !== undefined) updates.phone = parsed.data.phone

    const supabase = getSupabaseClient()
    const { data: dbUser, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select('id, email, first_name, last_name, phone, subscription_status, subscription_tier, stripe_customer_id, created_at, updated_at')
      .maybeSingle()

    if (error || !dbUser) {
      return NextResponse.json(
        { success: false, error: { code: 'UPDATE_FAILED', message: 'Failed to update user' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.first_name ?? '',
        lastName: dbUser.last_name ?? '',
        phone: dbUser.phone ?? '',
        createdAt: dbUser.created_at,
        subscription: {
          tier: dbUser.subscription_tier ?? 'free',
          status: dbUser.subscription_status ?? 'inactive',
          stripeCustomerId: dbUser.stripe_customer_id ?? null,
        },
      },
    })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "An internal error occurred" } },
      { status: 500 }
    )
  }
})
