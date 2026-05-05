import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getServiceClient } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    const { user, isAuthenticated } = await getCurrentUser(request)
    if (!isAuthenticated || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const userId = user.id

    const supabase = getServiceClient()

    const { data, error } = await supabase
      .from('credit_reports')
      .select('id, user_id, bureau, uploaded_at, parsed_data, status, file_name')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false })

    if (error) {
      console.error('Error fetching credit reports:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch credit reports' },
        { status: 500 }
      )
    }

    const reports = (data || []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      bureau: row.bureau,
      uploadedAt: row.uploaded_at,
      fileName: row.file_name,
      status: row.status,
      parsedData: row.parsed_data
        ? {
            scores: (row.parsed_data as { scores?: unknown[] }).scores ?? [],
            summary: (row.parsed_data as { summary?: unknown }).summary ?? {},
            negativeItemsCount: ((row.parsed_data as { negativeItems?: unknown[] }).negativeItems ?? []).length,
            accountsCount: ((row.parsed_data as { accounts?: unknown[] }).accounts ?? []).length,
            confidence: (row.parsed_data as { confidence?: number }).confidence ?? null,
          }
        : null,
    }))

    return NextResponse.json({ success: true, reports })
  } catch (error) {
    console.error('Error fetching credit reports:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
