import { NextRequest, NextResponse } from 'next/server'
import { databaseService } from '@/lib/database-service'
import { getAuthenticatedUser } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const result = await databaseService.getNegativeItems(user.userId)
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json({ success: false, error: result.error || 'Failed to fetch negative items' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error fetching negative items:', error)
    return NextResponse.json({ success: false, error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Only creditor is required — all other fields are optional so users
    // can save a partial item and fill in the rest later
    if (!body.creditor || !String(body.creditor).trim()) {
      return NextResponse.json({ success: false, error: 'Creditor name is required' }, { status: 400 })
    }

    const itemData = {
      userId: user.userId,
      creditor: String(body.creditor).trim(),
      // Accept either camelCase (from the form) or snake_case (legacy)
      accountNumber: body.accountNumber ?? body.account_number ?? null,
      originalAmount: body.originalAmount ?? body.original_amount ?? null,
      currentBalance: body.currentBalance ?? body.current_balance ?? null,
      dateOpened: body.dateOpened ?? body.date_opened ?? null,
      dateReported: body.dateReported ?? body.date_reported ?? null,
      status: body.status ?? 'active',
      itemType: body.itemType ?? body.item_type ?? null,
      disputeReason: body.disputeReason ?? body.dispute_reason ?? null,
      notes: body.notes ?? null,
      isDisputed: body.isDisputed ?? body.is_disputed ?? false,
      disputeDate: body.disputeDate ?? body.dispute_date ?? null,
      resolutionStatus: body.resolutionStatus ?? body.resolution_status ?? null,
    }

    const result = await databaseService.createNegativeItem(itemData)

    if (result.success) {
      return NextResponse.json(result, { status: 201 })
    } else {
      return NextResponse.json({ success: false, error: result.error || 'Failed to create negative item' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error creating negative item:', error)
    return NextResponse.json({ success: false, error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const { id, ...updates } = body
    if (!id) {
      return NextResponse.json({ success: false, error: 'Item ID is required' }, { status: 400 })
    }
    const result = await databaseService.updateNegativeItem(id, updates)
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json({ success: false, error: result.error || 'Failed to update negative item' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error updating negative item:', error)
    return NextResponse.json({ success: false, error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, error: 'Item ID is required' }, { status: 400 })
    }
    const result = await databaseService.deleteNegativeItem(id)
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json({ success: false, error: result.error || 'Failed to delete negative item' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error deleting negative item:', error)
    return NextResponse.json({ success: false, error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
