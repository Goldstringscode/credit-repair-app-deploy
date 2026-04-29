import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { getSupabaseClient } from '@/lib/supabase-client'
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { email, password, name, confirmPassword, referralCode } = body

    // Basic validation
    if (!email || !password || !name) {
      return NextResponse.json({ success: false, error: 'Email, password and name are required' }, { status: 400 })
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ success: false, error: 'Passwords do not match' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const supabase = getSupabaseClient()

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (existingUser) {
      return NextResponse.json({ success: false, error: 'An account with this email already exists' }, { status: 409 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Split name
    const trimmedName = name.trim()
    const spaceIdx = trimmedName.indexOf(' ')
    const firstName = spaceIdx > -1 ? trimmedName.substring(0, spaceIdx) : trimmedName
    const lastName  = spaceIdx > -1 ? trimmedName.substring(spaceIdx + 1) : ''

    const emailVerificationToken = crypto.randomBytes(32).toString('hex')

    // Create user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        email_verified: false,
        email_verification_token: emailVerificationToken,
        subscription_status: 'inactive',
        subscription_tier: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id, email, first_name, last_name, subscription_status, subscription_tier')
      .single()

    if (insertError || !newUser) {
      return NextResponse.json({ success: false, error: insertError?.message ?? 'Registration failed' }, { status: 500 })
    }

    // ── MLM REFERRAL INTEGRATION ──
    // Generate unique MLM code via DB function
    const { data: codeResult } = await supabase.rpc('generate_mlm_code')
    const newMlmCode: string = codeResult || ('CR' + newUser.id.replace(/-/g, '').substring(0, 6).toUpperCase())

    // Look up sponsor and their team by referral code
    let sponsorMlmId: string | null = null
    let teamId: string | null = null

    if (referralCode) {
      const { data: sponsor } = await supabase
        .from('mlm_users')
        .select('id, team_id, status')
        .eq('mlm_code', referralCode.toUpperCase())
        .eq('status', 'active')
        .maybeSingle()
      if (sponsor) {
        sponsorMlmId = sponsor.id
        teamId = sponsor.team_id
      }
    }

    // If no referral code, assign to the default CREDITPRO team
    if (!teamId) {
      const { data: defaultTeam } = await supabase
        .from('mlm_teams')
        .select('id')
        .eq('team_code', 'CREDITPRO')
        .eq('is_active', true)
        .maybeSingle()
      teamId = defaultTeam?.id || null
    }

    // Create MLM user record with unique code
    const { data: mlmUser } = await supabase
      .from('mlm_users')
      .insert({
        user_id: newUser.id,
        mlm_code: newMlmCode,
        team_id: teamId,
        direct_sponsor_id: sponsorMlmId,
        rank: 'associate',
        status: 'active',
        commission_rate: 0.30,
        total_earnings: 0,
        current_month_earnings: 0,
        lifetime_earnings: 0,
        personal_volume: 0,
        team_volume: 0,
        active_downlines: 0,
        total_downlines: 0,
        join_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id, mlm_code, team_id')
      .single()

    // Place in genealogy tree under sponsor
    if (mlmUser && sponsorMlmId) {
      // Get sponsor depth to calculate new member depth
      const { data: sponsorGeo } = await supabase
        .from('mlm_genealogy')
        .select('depth')
        .eq('user_id', (await supabase.from('mlm_users').select('user_id').eq('id', sponsorMlmId).single()).data?.user_id || '')
        .maybeSingle()

      const newDepth = (sponsorGeo?.depth || 0) + 1

      await supabase.from('mlm_genealogy').insert({
        user_id: newUser.id,
        sponsor_mlm_id: sponsorMlmId,
        team_id: teamId,
        depth: newDepth,
        joined_at: new Date().toISOString(),
      }).catch(() => {}) // Non-fatal
    }
    // ── END MLM INTEGRATION ──

    // Generate JWT tokens
    const userForToken = {
      id: newUser.id,
      email: newUser.email,
      role: 'user' as const,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      subscriptionStatus: newUser.subscription_status,
      subscriptionTier: newUser.subscription_tier,
    }

    const accessToken  = generateAccessToken(userForToken as any)
    const refreshToken = generateRefreshToken(userForToken as any)

    // Set httpOnly cookies
    const response = NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: [newUser.first_name, newUser.last_name].filter(Boolean).join(' '),
        subscriptionStatus: newUser.subscription_status,
        subscriptionTier: newUser.subscription_tier,
      },
      mlmCode: mlmUser?.mlm_code || null,
    }, { status: 201 })

    response.cookies.set('accessToken', accessToken, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', maxAge: 15 * 60, path: '/',
    })
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', maxAge: 7 * 24 * 60 * 60, path: '/',
    })

    return response

  } catch (error: any) {
    console.error('[Register] Error:', error)
    return NextResponse.json({ success: false, error: error.message ?? 'Registration failed' }, { status: 500 })
  }
}