import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    console.log('🔍 Testing Supabase connection...')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    console.log('✅ Supabase client created')

    // Test basic connection
    const { data, error } = await supabase
      .from('lesson_notes')
      .select('count')
      .limit(1)

    if (error) {
      console.error('❌ Supabase connection error:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error
      })
    }

    console.log('✅ Supabase connection successful')
    return NextResponse.json({ 
      success: true, 
      message: 'Supabase connection working',
      data 
    })

  } catch (error) {
    console.error('💥 Critical error testing Supabase:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
  }
}
