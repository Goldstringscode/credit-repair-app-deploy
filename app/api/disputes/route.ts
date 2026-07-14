import { requireAuth, type User } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabase-client"

export const dynamic = 'force-dynamic'

// GET /api/disputes — list the authenticated user's disputes, scoped by
// user_id (previously this read from a shared in-memory mock array with no
// per-user scoping at all, so every user saw the same hardcoded sample row).
async function getHandler(request: NextRequest, user: User) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const bureau = searchParams.get("bureau")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "10"), 100)
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const supabase = getSupabaseClient()
    let query = supabase
      .from('disputes')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)
    if (bureau) query = query.eq('bureau', bureau)

    const { data, error, count } = await query.range(offset, offset + limit - 1)

    if (error) {
      console.error("Get disputes error:", error.message)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "An internal error occurred",
          },
        },
        { status: 500 },
      )
    }

    const total = count ?? 0

    // Top-level 'disputes' (not nested under data.data) to match what the
    // dashboard's letters page already expects, reading real DB column
    // names (dispute_type, account_name, bureau, created_at, etc.) directly.
    return NextResponse.json({
      success: true,
      disputes: data ?? [],
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error("Get disputes error:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An internal error occurred",
        },
      },
      { status: 500 },
    )
  }
}

// POST /api/disputes — create a dispute for the authenticated user,
// persisted to the real disputes table (previously pushed to a
// module-level array that reset on every cold start and was never the
// same table the dashboard actually reads from).
async function postHandler(request: NextRequest, user: User) {
  try {
    const body = await request.json()

    // Accept either the legacy camelCase field names this route originally
    // used, or the DB's native snake_case names, so existing callers keep
    // working either way.
    const creditor = body.creditor ?? body.accountName ?? body.account_name
    const accountNumber = body.accountNumber ?? body.account_number ?? null
    const disputeType = body.type ?? body.disputeType ?? body.dispute_type
    const bureau = body.bureau
    const description = body.description ?? body.disputeReason ?? body.dispute_reason

    const requiredFields: Record<string, unknown> = { creditor, disputeType, bureau, description }
    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "MISSING_FIELD",
              message: `Field '${field}' is required`,
              details: { field },
            },
          },
          { status: 400 },
        )
      }
    }

    const submittedDate = new Date().toISOString().slice(0, 10)
    const expectedResolutionDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

    const supabase = getSupabaseClient()
    const { data: newDispute, error } = await supabase
      .from('disputes')
      .insert({
        user_id: user.id,
        dispute_type: disputeType,
        account_name: creditor,
        account_number: accountNumber,
        dispute_reason: description,
        bureau,
        status: 'pending',
        submitted_date: submittedDate,
        expected_resolution_date: expectedResolutionDate,
      })
      .select()
      .single()

    if (error || !newDispute) {
      console.error("Create dispute error:", error?.message)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "An internal error occurred",
          },
        },
        { status: 500 },
      )
    }

    // Send dispute submission notification (best-effort — a notification
    // failure shouldn't fail the whole request; the dispute is already saved).
    try {
      const { notificationService } = await import('@/lib/notification-service')
      await notificationService.notifyDisputeSubmitted(newDispute)
      console.log("Dispute submission notification sent successfully")
    } catch (notifyErr) {
      console.error("Failed to send dispute submission notification:", notifyErr)
    }

    return NextResponse.json(
      {
        success: true,
        data: newDispute,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create dispute error:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An internal error occurred",
        },
      },
      { status: 500 },
    )
  }
}

export const GET = requireAuth(getHandler)
export const POST = requireAuth(postHandler)

