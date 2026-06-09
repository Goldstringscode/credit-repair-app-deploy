import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminRequest } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const _auth = await verifyAdminRequest(request)
  if ('error' in _auth) return _auth.error

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const startTime = Date.now()
    const tables = ['users', 'disputes', 'certified_mail_requests', 'payments', 'letter_templates', 'email_campaigns']
    const backup: Record<string, any[]> = {}
    const errors: string[] = []
    let totalRows = 0

    // Export each table
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: true })
      if (error) {
        errors.push(`${table}: ${error.message}`)
        backup[table] = []
      } else {
        // Redact sensitive fields
        backup[table] = (data || []).map((row: any) => {
          const safe = { ...row }
          // Redact password hashes and sensitive tokens
          if (safe.password_hash) safe.password_hash = '[REDACTED]'
          if (safe.stripe_customer_id) safe.stripe_customer_id = '[REDACTED]'
          return safe
        })
        totalRows += backup[table].length
      }
    }

    const backupData = {
      metadata: {
        timestamp: new Date().toISOString(),
        tables: tables,
        totalRows,
        durationMs: Date.now() - startTime,
        version: '1.0',
        project: 'credit-repair-ai',
      },
      data: backup,
    }

    // Return as downloadable JSON
    const json = JSON.stringify(backupData, null, 2)
    const filename = `credit-repair-backup-${new Date().toISOString().split('T')[0]}.json`

    return new NextResponse(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Backup-Rows': String(totalRows),
        'X-Backup-Tables': String(tables.length - errors.length),
        'X-Backup-Errors': errors.join('; ') || 'none',
      },
    })
  } catch (err: any) {
    console.error('Backup error:', err.message)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
