import { NextRequest, NextResponse } from 'next/server'
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendMLMWelcomeEmail,
  sendTeamJoinEmail,
  sendNewTeamMemberEmail,
  sendTeamCreationEmail,
  sendCommissionEarnedEmail,
  sendRankAdvancementEmail,
  sendPayoutProcessedEmail,
  sendInvitationEmail,
  sendDisputeLetterReadyEmail,
  sendCreditScoreImprovementEmail,
  sendPaymentSuccessEmail,
  sendTrainingCompletionEmail,
  sendTaskCompletionEmail,
} from '@/lib/email-service'

export const dynamic = 'force-dynamic'

const TO = process.env.DEV_TO_EMAIL || 'jstringscode@gmail.com'
const APP = process.env.NEXT_PUBLIC_APP_URL || 'https://creditrepairai.com'

const TESTS: Record<string, () => Promise<any>> = {
  welcome: () => sendWelcomeEmail({
    to: TO, name: 'John Smith',
    dashboardLink: APP + '/dashboard/overview',
  }),
  password_reset: () => sendPasswordResetEmail({
    to: TO, name: 'John Smith', resetToken: 'test-reset-token-abc123',
  }),
  mlm_welcome: () => sendMLMWelcomeEmail({
    to: TO, name: 'John Smith', teamCode: 'JOHN2025',
    sponsorName: 'Jane Doe', dashboardLink: APP + '/mlm/dashboard',
  }),
  team_join: () => sendTeamJoinEmail({
    to: TO, name: 'John Smith', teamCode: 'JANE2025',
    sponsorName: 'Jane Doe', dashboardLink: APP + '/mlm/dashboard',
  }),
  new_team_member: () => sendNewTeamMemberEmail({
    to: TO, sponsorName: 'Jane Doe', newMemberName: 'John Smith',
    newMemberEmail: 'john@example.com', teamCode: 'JANE2025',
    dashboardLink: APP + '/mlm/genealogy',
  }),
  team_creation: () => sendTeamCreationEmail({
    to: TO, name: 'Jane Doe', teamCode: 'JANE2025',
    dashboardLink: APP + '/mlm/dashboard',
  }),
  commission_earned: () => sendCommissionEarnedEmail({
    to: TO, name: 'Jane Doe', amount: 125.50,
    type: 'direct_referral', level: 1,
    dashboardLink: APP + '/mlm/payouts',
  }),
  rank_advancement: () => sendRankAdvancementEmail({
    to: TO, name: 'Jane Doe', oldRank: 'associate', newRank: 'consultant',
    benefits: ['Higher commission rates (35%)', 'Access to team creation', 'Monthly leadership bonus'],
    dashboardLink: APP + '/mlm/rank-progression',
  }),
  payout_processed: () => sendPayoutProcessedEmail({
    to: TO, name: 'Jane Doe', amount: 350.00,
    method: 'Bank Transfer', transactionId: 'TXN-' + Date.now(),
    dashboardLink: APP + '/mlm/payouts',
  }),
  invitation: () => sendInvitationEmail({
    to: TO, name: 'New Friend', sponsorName: 'Jane Doe',
    teamCode: 'JANE2025', invitationLink: APP + '/signup?ref=JANE2025',
  }),
  dispute_letter: () => sendDisputeLetterReadyEmail({
    to: TO, name: 'John Smith',
    accountName: 'Capital One - #4521', issueType: 'Late Payment',
    letterUrl: APP + '/dashboard/letters',
  }),
  score_improvement: () => sendCreditScoreImprovementEmail({
    to: TO, name: 'John Smith',
    previousScore: 582, newScore: 634,
    dashboardLink: APP + '/dashboard/overview',
  }),
  payment_success: () => sendPaymentSuccessEmail({
    to: TO, name: 'John Smith', amount: '79.00',
    planName: 'Professional Plan', transactionId: 'ch_' + Date.now(),
    billingPeriod: 'Monthly',
    nextBillingDate: new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}),
  }),
  training_complete: () => sendTrainingCompletionEmail({
    to: TO, name: 'John Smith',
    courseName: 'Credit Repair Fundamentals',
    certificateUrl: APP + '/mlm/training/certificate/abc123',
  }),
  task_complete: () => sendTaskCompletionEmail({
    to: TO, name: 'John Smith',
    taskName: 'Complete Profile Setup', reward: '50 Bonus Points',
  }),
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  // Run single test or all
  if (type && TESTS[type]) {
    try {
      const result = await TESTS[type]()
      return NextResponse.json({ type, ...result, to: TO })
    } catch (err: any) {
      return NextResponse.json({ type, success: false, error: err.message }, { status: 500 })
    }
  }

  if (type === 'all') {
    const results: Record<string, any> = {}
    for (const [name, fn] of Object.entries(TESTS)) {
      try {
        results[name] = await fn()
        console.log('✅ ' + name + ': ' + results[name].id)
      } catch (err: any) {
        results[name] = { success: false, error: err.message }
        console.error('❌ ' + name + ': ' + err.message)
      }
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 300))
    }
    const passed = Object.values(results).filter((r:any) => r.success).length
    const failed = Object.values(results).filter((r:any) => !r.success).length
    return NextResponse.json({ summary: { total: Object.keys(TESTS).length, passed, failed }, results, to: TO })
  }

  // Return available tests
  return NextResponse.json({
    available: Object.keys(TESTS),
    usage: {
      all: '/api/email-test?type=all',
      single: '/api/email-test?type=welcome',
    },
    to: TO,
    note: 'All emails sent to DEV_TO_EMAIL env var'
  })
}
