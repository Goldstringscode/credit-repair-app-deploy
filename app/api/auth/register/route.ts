import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { getSupabaseClient } from '@/lib/supabase-client'
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, name, confirmPassword, referralCode } = body

    // Validation
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

    // Check existing user
    const existingCheck = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (existingCheck.data) {
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
    const userResult = await supabase
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

    if (userResult.error || !userResult.data) {
      return NextResponse.json({ success: false, error: userResult.error?.message ?? 'Registration failed' }, { status: 500 })
    }

    const newUser = userResult.data

    // ── MLM REFERRAL INTEGRATION ──
    let newMlmCode: string = ''
    let mlmUserId: string | null = null
    let teamId: string | null = null
    let sponsorMlmId: string | null = null

    try {
      // Generate unique MLM code via DB function
      const codeRpc = await supabase.rpc('generate_mlm_code')
      newMlmCode = (codeRpc.data as string) || ('CR' + newUser.id.replace(/-/g, '').substring(0, 6).toUpperCase())

      // Look up sponsor by referral code
      if (referralCode) {
        const sponsorResult = await supabase
          .from('mlm_users')
          .select('id, team_id, status')
          .eq('mlm_code', referralCode.toUpperCase())
          .eq('status', 'active')
          .maybeSingle()
        if (sponsorResult.data) {
          sponsorMlmId = sponsorResult.data.id
          teamId = sponsorResult.data.team_id
        }
      }

      // Default to CREDITPRO team if no sponsor
      if (!teamId) {
        const teamResult = await supabase
          .from('mlm_teams')
          .select('id')
          .eq('team_code', 'CREDITPRO')
          .eq('is_active', true)
          .maybeSingle()
        teamId = teamResult.data?.id || null
      }

      // Create MLM user record
      const mlmInsert = await supabase
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

      if (mlmInsert.data) {
        mlmUserId = mlmInsert.data.id

        // Place in genealogy under sponsor
        if (sponsorMlmId) {
          const sponsorUserResult = await supabase
            .from('mlm_users')
            .select('user_id')
            .eq('id', sponsorMlmId)
            .maybeSingle()

          let newDepth = 1
          if (sponsorUserResult.data?.user_id) {
            const sponsorGenResult = await supabase
              .from('mlm_genealogy')
              .select('depth')
              .eq('user_id', sponsorUserResult.data.user_id)
              .maybeSingle()
            newDepth = (sponsorGenResult.data?.depth || 0) + 1
          }

          await supabase.from('mlm_genealogy').insert({
            user_id: newUser.id,
            sponsor_mlm_id: sponsorMlmId,
            team_id: teamId,
            depth: newDepth,
            joined_at: new Date().toISOString(),
          })
        } else if (teamId) {
          // Root level - no sponsor
          await supabase.from('mlm_genealogy').insert({
            user_id: newUser.id,
            sponsor_mlm_id: null,
            team_id: teamId,
            depth: 0,
            joined_at: new Date().toISOString(),
          })
        }
      }
    } catch (mlmError: any) {
      console.error('[Register] MLM integration failed (non-fatal):', mlmError?.message)
      // Don't fail the registration if MLM setup has issues
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
      mlmCode: newMlmCode || null,
      sponsorMlmId,
      teamId,
    }, { status: 201 })

    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/',
    })
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return response

  } catch (error: any) {
    console.error('[Register] Error:', error)
    return NextResponse.json({
      success: false,
      error: error?.message ?? 'Registration failed'
    }, { status: 500 })
  }
}