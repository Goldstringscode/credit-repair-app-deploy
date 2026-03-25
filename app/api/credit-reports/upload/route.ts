import { NextRequest, NextResponse } from 'next/server'
import { extractUserId, getServiceClient } from '@/lib/api-auth'
import { randomUUID } from 'crypto'
import { UltimateCreditParserWorking } from '@/lib/ultimate-credit-parser-working'

interface ParsedScore {
  bureau?: string
  score: number
  dateGenerated?: string
}

interface ParsedNegativeItem {
  creditor?: string
  accountNumber?: string
  amount?: number
  dateReported?: string
  status?: string
  type?: string
  disputeRecommendation?: string
  description?: string
}

async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  try {
    // pdf-parse is a CommonJS module; use require to avoid ESM interop issues
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pdfParse = require('pdf-parse')
    const data = await pdfParse(buffer)
    return data.text || ''
  } catch (err) {
    console.error('pdf-parse error:', err)
    return ''
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = extractUserId(request)
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid multipart form data' },
        { status: 400 }
      )
    }

    const file = formData.get('file')
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'No file provided. Include a "file" field in the form data.' },
        { status: 400 }
      )
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only PDF files are accepted.' },
        { status: 400 }
      )
    }

    const supabase = getServiceClient()

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const timestamp = Date.now()
    const storagePath = `credit-reports/${userId}/${timestamp}.pdf`
    const { error: uploadError } = await supabase.storage
      .from('credit-reports')
      .upload(storagePath, buffer, {
        contentType: 'application/pdf',
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { success: false, error: 'Failed to upload file to storage', details: uploadError.message },
        { status: 500 }
      )
    }

    // Extract text from PDF
    const pdfText = await extractTextFromPdfBuffer(buffer)

    // Parse the credit report
    const parser = new UltimateCreditParserWorking(pdfText)
    const parsedData = await parser.parse()

    // Detect bureau from parsed scores (fall back to 'unknown')
    let bureau = 'unknown'
    if (parsedData.scores && parsedData.scores.length > 0) {
      const bureauFromScore = parsedData.scores[0].bureau
      if (bureauFromScore) bureau = bureauFromScore.toLowerCase()
    }

    const reportId = randomUUID()
    const now = new Date().toISOString()

    // Save credit report record
    const { error: reportError } = await supabase.from('credit_reports').insert({
      id: reportId,
      user_id: userId,
      bureau,
      file_path: storagePath,
      file_name: file.name,
      status: 'parsed',
      parsed_data: parsedData,
      uploaded_at: now,
      created_at: now,
    })

    if (reportError) {
      console.error('Error saving credit report:', reportError)
      return NextResponse.json(
        { success: false, error: 'Failed to save credit report', details: reportError.message },
        { status: 500 }
      )
    }

    // Auto-insert negative items
    let negativeItemsFound = 0
    if (parsedData.negativeItems && parsedData.negativeItems.length > 0) {
      const negativeItemsToInsert = parsedData.negativeItems.map((item: ParsedNegativeItem) => ({
        id: randomUUID(),
        user_id: userId,
        credit_report_id: reportId,
        creditor: item.creditor || 'Unknown',
        account_number: item.accountNumber || null,
        original_amount: item.amount || null,
        current_balance: item.amount || null,
        date_opened: null,
        date_reported: item.dateReported || null,
        status: item.status || 'Open',
        item_type: item.type || 'Other',
        dispute_reason: item.disputeRecommendation || 'Inaccurate information',
        notes: item.description || null,
        is_disputed: false,
        created_at: now,
        updated_at: now,
      }))

      const { error: negItemsError } = await supabase
        .from('negative_items')
        .insert(negativeItemsToInsert)

      if (negItemsError) {
        console.error('Error saving negative items:', negItemsError)
        // Non-fatal: continue even if negative items fail to save
      } else {
        negativeItemsFound = negativeItemsToInsert.length
      }
    }

    // Upsert credit scores for dashboard chart
    if (parsedData.scores && parsedData.scores.length > 0) {
      const scoreUpserts = parsedData.scores.map((s: ParsedScore) => ({
        id: randomUUID(),
        user_id: userId,
        bureau: s.bureau ? s.bureau.toLowerCase() : bureau,
        score: s.score,
        recorded_at: s.dateGenerated || now,
        created_at: now,
      }))

      const { error: scoresError } = await supabase
        .from('credit_scores')
        .upsert(scoreUpserts, { onConflict: 'user_id,bureau,recorded_at' })

      if (scoresError) {
        console.error('Error upserting credit scores:', scoresError)
        // Non-fatal
      }
    }

    return NextResponse.json({
      success: true,
      reportId,
      negativeItemsFound,
      bureau,
      scoresFound: parsedData.scores?.length ?? 0,
      accountsFound: parsedData.accounts?.length ?? 0,
    })
  } catch (error) {
    console.error('Error processing credit report upload:', error)
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
