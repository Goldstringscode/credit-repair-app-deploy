/**
 * lib/email-service.ts
 * Named email exports used across the app.
 * All use buildEmail() for consistent branded HTML.
 */
import { sendEmail, buildEmail, infoRow, infoTable, APP_URL } from './resend'

// ─── Shared body helpers ───────────────────────────────────────────────────────
const p = (text: string) =>
  `<p style="margin:0 0 16px;color:#2c3e50;font-size:15px;line-height:1.7">${text}</p>`

const hi = (name: string) => p(`Hi <strong>${name}</strong>,`)

const sig = () => `
  <p style="margin:24px 0 0;color:#5a6c7d;font-size:14px;line-height:1.6">
    Warm regards,<br>
    <strong style="color:#2c3e50">The Credit Repair AI Team</strong>
  </p>`

const highlight = (text: string, color = '#667eea') =>
  `<div style="background:linear-gradient(135deg,${color}15,${color}08);border-left:4px solid ${color};border-radius:0 8px 8px 0;padding:16px 20px;margin:20px 0;font-size:15px;color:#2c3e50;font-weight:500">${text}</div>`

const badge = (label: string, value: string, color = '#667eea') =>
  `<div style="display:inline-block;background:${color}15;border:1px solid ${color}30;border-radius:8px;padding:12px 20px;margin:8px 4px;text-align:center">
    <div style="font-size:12px;color:${color};font-weight:600;text-transform:uppercase;letter-spacing:0.5px">${label}</div>
    <div style="font-size:22px;font-weight:700;color:#2c3e50;margin-top:4px">${value}</div>
  </div>`

// ─── CR: Welcome new credit repair user ───────────────────────────────────────
export async function sendWelcomeEmail(params: {
  to: string; name: string; email?: string; dashboardLink?: string; teamCode?: string
}) {
  const link = params.dashboardLink || APP_URL + '/dashboard/overview'
  return sendEmail({
    to: params.to, subject: 'Welcome to Credit Repair AI! Your Journey Starts Now 🚀',
    html: buildEmail({
      preheader: 'Your AI-powered credit repair platform is ready.',
      headerTitle: 'Welcome Aboard! 🎉',
      headerSubtitle: 'Your credit repair journey starts today',
      body: hi(params.name) +
        p('We're thrilled to have you join Credit Repair AI. Your account is ready and your AI-powered credit repair tools are waiting.') +
        highlight('✅ Account created successfully — you're all set to start improving your credit!') +
        `<div style="background:#f8f9fa;border-radius:10px;padding:24px;margin:24px 0">
          <p style="margin:0 0 16px;font-weight:600;color:#2c3e50;font-size:15px">🚀 Get started in 3 steps:</p>
          <div style="display:flex;flex-direction:column;gap:12px">
            <div style="display:flex;align-items:flex-start;gap:12px"><div style="min-width:28px;height:28px;background:#667eea;border-radius:50%;color:white;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center">1</div><div><strong>Upload your credit report</strong><br><span style="color:#5a6c7d;font-size:13px">Get your free report from AnnualCreditReport.com</span></div></div>
            <div style="display:flex;align-items:flex-start;gap:12px"><div style="min-width:28px;height:28px;background:#667eea;border-radius:50%;color:white;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center">2</div><div><strong>Review your AI action plan</strong><br><span style="color:#5a6c7d;font-size:13px">Our AI will identify issues and generate dispute strategies</span></div></div>
            <div style="display:flex;align-items:flex-start;gap:12px"><div style="min-width:28px;height:28px;background:#667eea;border-radius:50%;color:white;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center">3</div><div><strong>Send your dispute letters</strong><br><span style="color:#5a6c7d;font-size:13px">AI-generated letters sent directly to the credit bureaus</span></div></div>
          </div>
        </div>` + sig(),
      ctaUrl: link, ctaText: 'Go to My Dashboard',
      footerNote: 'You're receiving this because you created a Credit Repair AI account.',
    }),
    tags: [{ name: 'type', value: 'welcome' }],
  })
}

// ─── Auth: Password reset ──────────────────────────────────────────────────────
export async function sendPasswordResetEmail(params: {
  to: string; name: string; resetToken: string
}) {
  const link = APP_URL + '/reset-password?token=' + params.resetToken
  return sendEmail({
    to: params.to, subject: 'Reset Your Credit Repair AI Password',
    html: buildEmail({
      preheader: 'You requested a password reset. Click the link to set a new password.',
      headerTitle: 'Password Reset Request',
      headerSubtitle: 'We received a request to reset your password',
      accentColor: '#e74c3c',
      body: hi(params.name) +
        p('We received a password reset request for your Credit Repair AI account. Click the button below to set a new password.') +
        highlight('⏱️ This link expires in <strong>1 hour</strong> for your security.', '#e74c3c') +
        p('If you did not request this reset, you can safely ignore this email — your password will remain unchanged.') +
        sig(),
      ctaUrl: link, ctaText: '🔑 Reset My Password',
      footerNote: 'If you're having trouble, copy this link into your browser: ' + link,
    }),
    tags: [{ name: 'type', value: 'password_reset' }],
  })
}

// ─── MLM: Welcome new MLM member ──────────────────────────────────────────────
export async function sendMLMWelcomeEmail(params: {
  to: string; name: string; teamCode: string; sponsorName?: string; dashboardLink?: string
}) {
  const link = params.dashboardLink || APP_URL + '/mlm/dashboard'
  return sendEmail({
    to: params.to, subject: 'Welcome to the Credit Repair AI Team! 🏆',
    html: buildEmail({
      preheader: 'Your MLM account is active. Your referral code is ' + params.teamCode,
      headerTitle: 'Welcome to the Team! 🏆',
      headerSubtitle: params.sponsorName ? 'Sponsored by ' + params.sponsorName : 'Your business journey starts now',
      body: hi(params.name) +
        p(`You're now an official Credit Repair AI partner!${params.sponsorName ? ' <strong>' + params.sponsorName + '</strong> is your sponsor and is here to help you succeed.' : ''}`) +
        highlight(`🎯 Your referral code: <strong style="font-size:18px;letter-spacing:2px">${params.teamCode}</strong> — Share this to earn commissions!`) +
        `<div style="text-align:center;margin:24px 0">` +
          badge('Your Code', params.teamCode, '#667eea') +
          badge('Commission Level', 'L1: 10%', '#27ae60') +
          badge('Status', 'Active', '#2ecc71') +
        `</div>` +
        `<div style="background:#f8f9fa;border-radius:10px;padding:24px;margin:24px 0">
          <p style="margin:0 0 12px;font-weight:600;color:#2c3e50">💰 How you earn:</p>
          <p style="margin:0 0 8px;color:#5a6c7d;font-size:14px">• <strong>Level 1 (Direct):</strong> 10% on every referral you sign up</p>
          <p style="margin:0 0 8px;color:#5a6c7d;font-size:14px">• <strong>Level 2:</strong> 8% on your team's referrals</p>
          <p style="margin:0 0 8px;color:#5a6c7d;font-size:14px">• <strong>Levels 3–6:</strong> 6%, 5%, 4%, 3%</p>
          <p style="margin:0;color:#5a6c7d;font-size:14px">• <strong>Rank bonuses</strong> unlock as your team grows</p>
        </div>` + sig(),
      ctaUrl: link, ctaText: 'Go to My MLM Dashboard',
      footerNote: 'Share your referral link: ' + APP_URL + '/signup?ref=' + params.teamCode,
    }),
    tags: [{ name: 'type', value: 'mlm_welcome' }],
  })
}

// ─── MLM: Team join notification (sent to sponsor) ───────────────────────────
export async function sendTeamJoinEmail(params: {
  to: string; name: string; teamCode: string; sponsorName: string; dashboardLink?: string
}) {
  const link = params.dashboardLink || APP_URL + '/mlm/dashboard'
  return sendEmail({
    to: params.to, subject: "You've Joined a Team on Credit Repair AI!",
    html: buildEmail({
      preheader: 'You are now part of ' + params.sponsorName + ''s team.',
      headerTitle: 'Team Joined! 🤝',
      headerSubtitle: 'You are now part of a growing team',
      body: hi(params.name) +
        p('You have successfully joined the team sponsored by <strong>' + params.sponsorName + '</strong>.') +
        infoTable(
          infoRow('Sponsor', params.sponsorName) +
          infoRow('Your Team Code', params.teamCode) +
          infoRow('Status', '✅ Active')
        ) + sig(),
      ctaUrl: link, ctaText: 'View My Dashboard',
    }),
    tags: [{ name: 'type', value: 'team_join' }],
  })
}

// ─── MLM: New team member alert (sent to sponsor) ────────────────────────────
export async function sendNewTeamMemberEmail(params: {
  to: string; sponsorName: string; newMemberName: string; newMemberEmail: string; teamCode: string; dashboardLink?: string
}) {
  const link = params.dashboardLink || APP_URL + '/mlm/genealogy'
  return sendEmail({
    to: params.to, subject: '🎉 New Team Member: ' + params.newMemberName + ' joined!',
    html: buildEmail({
      preheader: params.newMemberName + ' just joined your team. Your network is growing!',
      headerTitle: 'New Team Member! 🎉',
      headerSubtitle: 'Your downline is growing',
      body: hi(params.sponsorName) +
        p('Great news! <strong>' + params.newMemberName + '</strong> has just joined your team.') +
        infoTable(
          infoRow('New Member', params.newMemberName) +
          infoRow('Email', params.newMemberEmail) +
          infoRow('Under Code', params.teamCode) +
          infoRow('Joined', new Date().toLocaleDateString('en-US', {month:'long',day:'numeric',year:'numeric'}))
        ) +
        highlight('💰 You'll earn commissions on their activity automatically. Keep growing your team!', '#27ae60') +
        sig(),
      ctaUrl: link, ctaText: 'View My Team Tree',
    }),
    tags: [{ name: 'type', value: 'new_team_member' }],
  })
}

// ─── MLM: Team creation ────────────────────────────────────────────────────────
export async function sendTeamCreationEmail(params: {
  to: string; name: string; teamCode: string; dashboardLink?: string
}) {
  const link = params.dashboardLink || APP_URL + '/mlm/dashboard'
  return sendEmail({
    to: params.to, subject: 'Your MLM Team Has Been Created! 🚀',
    html: buildEmail({
      preheader: 'Your team is live. Start building your network with code: ' + params.teamCode,
      headerTitle: 'Team Created! 🚀',
      headerSubtitle: 'You're now a team leader',
      body: hi(params.name) +
        p('Congratulations! Your Credit Repair AI team has been created and is ready to grow.') +
        highlight('🎯 Team Code: <strong style="font-size:20px;letter-spacing:3px">' + params.teamCode + '</strong>') +
        p('Share your code at <strong>' + APP_URL + '/signup?ref=' + params.teamCode + '</strong> to start building your downline and earning commissions.') +
        sig(),
      ctaUrl: link, ctaText: 'Manage My Team',
    }),
    tags: [{ name: 'type', value: 'team_creation' }],
  })
}

// ─── MLM: Commission earned ────────────────────────────────────────────────────
export async function sendCommissionEarnedEmail(params: {
  to: string; name: string; amount: number; type: string; level: number; dashboardLink?: string
}) {
  const link = params.dashboardLink || APP_URL + '/mlm/payouts'
  const typeLabels: Record<string,string> = {
    direct_referral:'Direct Referral',unilevel:'Unilevel',matching_bonus:'Matching Bonus',
    rank_advancement:'Rank Advancement',fast_start:'Fast Start',leadership_bonus:'Leadership Bonus',infinity_bonus:'Infinity Bonus'
  }
  const label = typeLabels[params.type] || params.type
  return sendEmail({
    to: params.to, subject: '💰 Commission Earned: $' + params.amount.toFixed(2),
    html: buildEmail({
      preheader: 'You earned $' + params.amount.toFixed(2) + ' in ' + label + ' commission.',
      headerTitle: 'Commission Earned! 💰',
      headerSubtitle: 'Your earnings are growing',
      accentColor: '#27ae60',
      body: hi(params.name) +
        p('You just earned a commission! Here are the details:') +
        `<div style="text-align:center;margin:24px 0">` +
          badge('Amount', '$' + params.amount.toFixed(2), '#27ae60') +
          badge('Type', label, '#667eea') +
          badge('Level', 'L' + params.level, '#764ba2') +
        `</div>` +
        infoTable(
          infoRow('Commission Amount', '<strong style="color:#27ae60">$' + params.amount.toFixed(2) + '</strong>') +
          infoRow('Commission Type', label) +
          infoRow('Level', 'Level ' + params.level) +
          infoRow('Date', new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}))
        ) +
        highlight('🎯 Keep growing your team to increase your earnings. Commissions are paid monthly!', '#27ae60') +
        sig(),
      ctaUrl: link, ctaText: 'View My Earnings',
    }),
    tags: [{ name: 'type', value: 'commission' }],
  })
}

// ─── MLM: Rank advancement ─────────────────────────────────────────────────────
export async function sendRankAdvancementEmail(params: {
  to: string; name: string; oldRank: string; newRank: string; benefits?: string[]; dashboardLink?: string
}) {
  const link = params.dashboardLink || APP_URL + '/mlm/rank-progression'
  const rankIcons: Record<string,string> = {associate:'⭐',consultant:'⭐⭐',manager:'🥉',director:'🥈',executive:'🥇',presidential:'👑'}
  const icon = rankIcons[params.newRank.toLowerCase()] || '🏆'
  return sendEmail({
    to: params.to, subject: `${icon} Rank Advancement: You reached ${params.newRank.charAt(0).toUpperCase()+params.newRank.slice(1)}!`,
    html: buildEmail({
      preheader: 'Congratulations! You advanced from ' + params.oldRank + ' to ' + params.newRank + '.',
      headerTitle: icon + ' Rank Advancement!',
      headerSubtitle: 'You leveled up — congratulations!',
      accentColor: '#f39c12',
      body: hi(params.name) +
        p('Outstanding achievement! You have officially advanced from <strong>' + params.oldRank.charAt(0).toUpperCase()+params.oldRank.slice(1) + '</strong> to <strong>' + params.newRank.charAt(0).toUpperCase()+params.newRank.slice(1) + '</strong>.') +
        `<div style="text-align:center;margin:24px 0">` +
          badge('Previous Rank', params.oldRank.charAt(0).toUpperCase()+params.oldRank.slice(1), '#95a5a6') +
          `<span style="font-size:24px;margin:0 12px">→</span>` +
          badge('New Rank', params.newRank.charAt(0).toUpperCase()+params.newRank.slice(1), '#f39c12') +
        `</div>` +
        (params.benefits?.length ? `<div style="background:#fff9e6;border-radius:10px;padding:20px;margin:20px 0">
          <p style="margin:0 0 12px;font-weight:600;color:#2c3e50">🎁 New Benefits Unlocked:</p>
          ${params.benefits.map(b => '<p style="margin:0 0 8px;color:#5a6c7d;font-size:14px">✅ ' + b + '</p>').join('')}
        </div>` : '') +
        sig(),
      ctaUrl: link, ctaText: 'View My Progress',
    }),
    tags: [{ name: 'type', value: 'rank_advancement' }],
  })
}

// ─── MLM: Payout processed ────────────────────────────────────────────────────
export async function sendPayoutProcessedEmail(params: {
  to: string; name: string; amount: number; method: string; transactionId: string; dashboardLink?: string
}) {
  const link = params.dashboardLink || APP_URL + '/mlm/payouts'
  return sendEmail({
    to: params.to, subject: '✅ Payout Processed: $' + params.amount.toFixed(2),
    html: buildEmail({
      preheader: 'Your payout of $' + params.amount.toFixed(2) + ' has been processed successfully.',
      headerTitle: 'Payout Processed! ✅',
      headerSubtitle: 'Your earnings are on the way',
      accentColor: '#27ae60',
      body: hi(params.name) +
        p('Your payout request has been approved and processed. Here are the details:') +
        infoTable(
          infoRow('Amount', '<strong style="color:#27ae60">$' + params.amount.toFixed(2) + '</strong>') +
          infoRow('Payment Method', params.method) +
          infoRow('Transaction ID', '<code style="background:#f8f9fa;padding:2px 6px;border-radius:4px;font-size:12px">' + params.transactionId + '</code>') +
          infoRow('Processed', new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}))
        ) +
        highlight('💳 Allow 2–5 business days for funds to appear depending on your payment method.', '#27ae60') +
        sig(),
      ctaUrl: link, ctaText: 'View Payout History',
    }),
    tags: [{ name: 'type', value: 'payout' }],
  })
}

// ─── MLM: Invitation email ─────────────────────────────────────────────────────
export async function sendInvitationEmail(params: {
  to: string; name: string; sponsorName: string; teamCode: string; invitationLink: string
}) {
  return sendEmail({
    to: params.to, subject: params.sponsorName + ' invited you to Credit Repair AI 🎉',
    html: buildEmail({
      preheader: 'You've been personally invited by ' + params.sponsorName + ' to join Credit Repair AI.',
      headerTitle: 'You're Invited! 🎉',
      headerSubtitle: params.sponsorName + ' thinks you'd be a great fit',
      body: hi(params.name) +
        p('<strong>' + params.sponsorName + '</strong> has personally invited you to join Credit Repair AI — the AI-powered credit repair platform that's helping thousands improve their credit scores.') +
        `<div style="background:#f0f8ff;border-radius:10px;padding:24px;margin:24px 0;text-align:center">
          <p style="margin:0 0 8px;color:#5a6c7d;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Your Invitation Code</p>
          <p style="margin:0;font-size:28px;font-weight:700;color:#667eea;letter-spacing:4px">${params.teamCode}</p>
        </div>` +
        p('As a member you get access to AI-powered dispute letters, credit monitoring, real-time score tracking, and the ability to earn commissions by referring others.') +
        sig(),
      ctaUrl: params.invitationLink, ctaText: 'Accept Invitation',
      footerNote: 'Or copy this link: ' + params.invitationLink,
    }),
    tags: [{ name: 'type', value: 'invitation' }],
  })
}

// ─── CR: Dispute letter ready ─────────────────────────────────────────────────
export async function sendDisputeLetterReadyEmail(params: {
  to: string; name: string; accountName: string; issueType: string; letterUrl?: string
}) {
  const link = params.letterUrl || APP_URL + '/dashboard/letters'
  return sendEmail({
    to: params.to, subject: '📝 Your Dispute Letter is Ready — ' + params.accountName,
    html: buildEmail({
      preheader: 'Your AI-generated dispute letter for ' + params.accountName + ' is ready to send.',
      headerTitle: 'Dispute Letter Ready! 📝',
      headerSubtitle: 'Your letter has been generated and is ready to send',
      body: hi(params.name) +
        p('Your AI-generated dispute letter is ready! Here are the details:') +
        infoTable(
          infoRow('Account', params.accountName) +
          infoRow('Issue Type', params.issueType) +
          infoRow('Generated', new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})) +
          infoRow('Status', '✅ Ready to Send')
        ) +
        highlight('📬 Send this letter to the credit bureau to begin the dispute process. Bureaus must respond within 30 days.') +
        sig(),
      ctaUrl: link, ctaText: 'View My Letter',
    }),
    tags: [{ name: 'type', value: 'dispute_letter' }],
  })
}

// ─── CR: Credit score improvement ─────────────────────────────────────────────
export async function sendCreditScoreImprovementEmail(params: {
  to: string; name: string; previousScore: number; newScore: number; dashboardLink?: string
}) {
  const link = params.dashboardLink || APP_URL + '/dashboard/overview'
  const increase = params.newScore - params.previousScore
  return sendEmail({
    to: params.to, subject: `🎉 Your Credit Score Improved by ${increase} Points!`,
    html: buildEmail({
      preheader: 'Your credit score went from ' + params.previousScore + ' to ' + params.newScore + '. Great progress!',
      headerTitle: '🎉 Score Improved!',
      headerSubtitle: 'Your hard work is paying off',
      accentColor: '#27ae60',
      body: hi(params.name) +
        p('Congratulations! Your credit score has improved. Here's your progress:') +
        `<div style="text-align:center;margin:32px 0">` +
          badge('Previous Score', params.previousScore.toString(), '#95a5a6') +
          `<span style="font-size:24px;margin:0 12px">→</span>` +
          badge('New Score', params.newScore.toString(), '#27ae60') +
          badge('+' + increase + ' Points', 'Improvement', '#2ecc71') +
        `</div>` +
        highlight('🚀 Keep going! Continue sending dispute letters to further improve your score.', '#27ae60') +
        sig(),
      ctaUrl: link, ctaText: 'View My Credit Report',
    }),
    tags: [{ name: 'type', value: 'score_improvement' }],
  })
}

// ─── Billing: Payment success ─────────────────────────────────────────────────
export async function sendPaymentSuccessEmail(params: {
  to: string; name: string; amount: string; planName: string; transactionId: string; billingPeriod?: string; nextBillingDate?: string
}) {
  const link = APP_URL + '/dashboard/billing'
  return sendEmail({
    to: params.to, subject: '✅ Payment Confirmed — Thank You!',
    html: buildEmail({
      preheader: 'Payment of ' + params.amount + ' for ' + params.planName + ' confirmed.',
      headerTitle: 'Payment Confirmed ✅',
      headerSubtitle: 'Thank you for your subscription',
      body: hi(params.name) +
        p('Your payment has been successfully processed. Your subscription is active and all features are unlocked.') +
        infoTable(
          infoRow('Plan', params.planName) +
          infoRow('Amount', '<strong>$' + params.amount + '</strong>') +
          infoRow('Transaction ID', '<code style="background:#f8f9fa;padding:2px 6px;border-radius:4px;font-size:12px">' + params.transactionId + '</code>') +
          infoRow('Billing Period', params.billingPeriod || 'Monthly') +
          (params.nextBillingDate ? infoRow('Next Billing Date', params.nextBillingDate) : '')
        ) +
        sig(),
      ctaUrl: link, ctaText: 'View Billing',
      footerNote: 'Questions about your subscription? Contact support@creditrepairai.com',
    }),
    tags: [{ name: 'type', value: 'payment_success' }],
  })
}

// ─── Training completion ────────────────────────────────────────────────────────
export async function sendTrainingCompletionEmail(params: {
  to: string; name: string; courseName: string; certificateUrl?: string
}) {
  return sendEmail({
    to: params.to, subject: '🎓 Training Complete: ' + params.courseName,
    html: buildEmail({
      preheader: 'You completed ' + params.courseName + '. Great work!',
      headerTitle: 'Training Complete! 🎓',
      headerSubtitle: 'You completed: ' + params.courseName,
      body: hi(params.name) +
        p('Congratulations on completing <strong>' + params.courseName + '</strong>! Your dedication to learning is paying off.') +
        (params.certificateUrl ? highlight('🏅 Your certificate is ready. Click below to view and download it.') : '') +
        sig(),
      ctaUrl: params.certificateUrl || APP_URL + '/mlm/training', ctaText: params.certificateUrl ? 'View Certificate' : 'Continue Training',
    }),
    tags: [{ name: 'type', value: 'training_completion' }],
  })
}

// ─── Task completion ───────────────────────────────────────────────────────────
export async function sendTaskCompletionEmail(params: {
  to: string; name: string; taskName: string; reward?: string
}) {
  return sendEmail({
    to: params.to, subject: '✅ Task Completed: ' + params.taskName,
    html: buildEmail({
      preheader: 'You completed: ' + params.taskName + (params.reward ? '. Reward: ' + params.reward : ''),
      headerTitle: 'Task Complete! ✅',
      headerSubtitle: params.taskName,
      body: hi(params.name) +
        p('You just completed the task: <strong>' + params.taskName + '</strong>. Keep up the great work!') +
        (params.reward ? highlight('🎁 Reward earned: <strong>' + params.reward + '</strong>', '#27ae60') : '') +
        sig(),
      ctaUrl: APP_URL + '/mlm/dashboard', ctaText: 'View Dashboard',
    }),
    tags: [{ name: 'type', value: 'task_completion' }],
  })
}

// ─── Generic credit repair template email ─────────────────────────────────────
export async function sendCreditRepairTemplateEmail(params: {
  to: string; subject: string; htmlContent: string; textContent?: string
}) {
  return sendEmail({ to: params.to, subject: params.subject, html: params.htmlContent, text: params.textContent })
}

// ─── Billing notification ──────────────────────────────────────────────────────
export async function sendBillingNotification(to: string, name: string, subject: string, message: string) {
  return sendEmail({
    to, subject,
    html: buildEmail({
      headerTitle: 'Billing Notification',
      body: hi(name) + p(message) + sig(),
    }),
    tags: [{ name: 'type', value: 'billing' }],
  })
}

// ─── emailService object (for server imports) ──────────────────────────────────
export const emailService = {
  sendEmail: async (opts: {to:string;subject:string;body:string}) => {
    const { sendEmail: se, textToHtml } = await import('./resend')
    return se({ to: opts.to, subject: opts.subject, html: textToHtml(opts.body) })
  },
  sendPasswordResetEmail: (email: string, name: string, resetToken: string) =>
    sendPasswordResetEmail({ to: email, name, resetToken }),
  sendInvitationEmail: (data: any) => sendInvitationEmail(data),
  sendWelcomeEmail: (data: any) => sendWelcomeEmail(data),
  sendTeamJoinEmail: (data: any) => sendTeamJoinEmail(data),
  sendTeamCreationEmail: (data: any) => sendTeamCreationEmail(data),
  sendNewTeamMemberEmail: (data: any) => sendNewTeamMemberEmail(data),
  sendCommissionEarnedEmail: (data: any) => sendCommissionEarnedEmail(data),
  sendRankAdvancementEmail: (data: any) => sendRankAdvancementEmail(data),
  sendPayoutProcessedEmail: (data: any) => sendPayoutProcessedEmail(data),
  sendTrainingCompletionEmail: (data: any) => sendTrainingCompletionEmail(data),
  sendTaskCompletionEmail: (data: any) => sendTaskCompletionEmail(data),
  sendBillingNotification,
  sendAdminEmail: async (to: string, subject: string, content: string) =>
    sendEmail({ to, subject, html: content }),
  sendCreditRepairEmail: async (to: string, name: string, subject: string, content: string) =>
    sendEmail({ to, subject, html: buildEmail({ headerTitle: subject, body: hi(name) + content + sig() }) }),
  sendTeamUpdateEmail: async (to: string, name: string, updateMessage: string) =>
    sendEmail({ to, subject: 'Team Update — Credit Repair AI', html: buildEmail({ headerTitle: 'Team Update', body: hi(name) + p(updateMessage) + sig() }) }),
}
