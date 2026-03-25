import { NextRequest, NextResponse } from 'next/server'
import { extractUserId, getServiceClient } from '@/lib/api-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = extractUserId(request)
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    const supabase = getServiceClient()

    const { data, error } = await supabase
      .from('credit_reports')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 })
    }

    if (data.user_id !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      report: {
        id: data.id,
        userId: data.user_id,
        bureau: data.bureau,
        fileName: data.file_name,
        filePath: data.file_path,
        status: data.status,
        uploadedAt: data.uploaded_at,
        parsedData: data.parsed_data || null,
      },
    })
  } catch (error) {
    console.error('Error fetching report details:', error)

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
