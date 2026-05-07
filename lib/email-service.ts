/**
 * Email Service — Named exports used across the app
 * All functions route through lib/resend.ts (Resend SDK)
 * 
 * Usage: import { sendWelcomeEmail } from '@/lib/email-service'
 */
import { sendEmail, textToHtml, FROM_NAME } from './resend'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://creditrepairai.com'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EmailData {
  to: string
  subject: string
  body: string
  template?: string
  priority?: 'high' | 'normal' | 'low'
}

export interface EmailResponse {
  success: boolean
  id?: string
  error?: string
}

// ─── Core EmailService class (used by lib/email-service.ts consumers) ─────────

class EmailServiceClass {
  async sendEmail(data: EmailData): Promise<EmailResponse> {
    const html = data.body.includes('<html') || data.body.includes('<p')
      ? data.body : textToHtml(data.body)
    return sendEmail({ to: data.to, subject: data.subject, html, text: data.body.replace(/<[^>]+>/g,'') })
  }

  async sendTemplateEmail(templateId: string, to: string, vars: Record<string, string>): Promise<EmailResponse> {
    const subject = vars.subject || 'Message from ' + FROM_NAME
    let body = vars.body || vars.content || ''
    Object.entries(vars).forEach(([k,v]) => { body = body.replace(new RegExp('{{' + k + '}}','g'), v) })
    return this.sendEmail({ to, subject, body })
  }

  async sendBulkEmails(emails: EmailData[]): Promise<EmailResponse[]> {
    return Promise.all(emails.map(e => this.sendEmail(e)))
  }
}

export const emailService = new EmailServiceClass()

// ─── Named exports for MLM registration emails ────────────────────────────────

export async function sendWelcomeEmail(params: {
  to: string; name: string; teamCode: string; dashboardLink: string
}): Promise<void> {
  await sendEmail({
    to: params.to,
    subject: 'Welcome to Credit Repair AI! 🎉',
    html: textToHtml(
      `Hi ${params.name},\n\nWelcome to Credit Repair AI! You're now part of our community.\n\nYour MLM Code: ${params.teamCode}\n\nGet started on your dashboard:\n${params.dashboardLink}\n\nBest regards,\nThe Credit Repair AI Team`
    ),
    tags: [{ name: 'type', value: 'welcome' }],
  }).catch(e => console.error('sendWelcomeEmail:', e))
}

export async function sendTeamJoinEmail(params: {
  to: string; name: string; teamCode: string; sponsorName: string; dashboardLink: string
}): Promise<void> {
  await sendEmail({
    to: params.to,
    subject: "You've Joined a Team on Credit Repair AI!",
    html: textToHtml(
      `Hi ${params.name},\n\nYou've joined the team sponsored by ${params.sponsorName}.\n\nYour team code: ${params.teamCode}\n\nView your dashboard:\n${params.dashboardLink}\n\nBest regards,\nThe Credit Repair AI Team`
    ),
    tags: [{ name: 'type', value: 'team_join' }],
  }).catch(e => console.error('sendTeamJoinEmail:', e))
}

export async function sendTeamCreationEmail(params: {
  to: string; name: string; teamCode: string; dashboardLink: string
}): Promise<void> {
  await sendEmail({
    to: params.to,
    subject: 'Your MLM Team Has Been Created!',
    html: textToHtml(
      `Hi ${params.name},\n\nCongratulations! Your team has been created.\n\nTeam code: ${params.teamCode}\n\nManage your team:\n${params.dashboardLink}\n\nBest regards,\nThe Credit Repair AI Team`
    ),
    tags: [{ name: 'type', value: 'team_creation' }],
  }).catch(e => console.error('sendTeamCreationEmail:', e))
}

export async function sendNewTeamMemberEmail(params: {
  to: string; sponsorName: string; newMemberName: string; newMemberEmail: string; teamCode: string; dashboardLink: string
}): Promise<void> {
  await sendEmail({
    to: params.to,
    subject: 'A New Member Joined Your Team!',
    html: textToHtml(
      `Hi ${params.sponsorName},\n\n${params.newMemberName} (${params.newMemberEmail}) has joined your team (${params.teamCode}).\n\nView your genealogy:\n${params.dashboardLink}\n\nBest regards,\nThe Credit Repair AI Team`
    ),
    tags: [{ name: 'type', value: 'new_team_member' }],
  }).catch(e => console.error('sendNewTeamMemberEmail:', e))
}

export async function sendCreditRepairTemplateEmail(params: {
  to: string; subject: string; htmlContent: string; textContent?: string
}): Promise<void> {
  await sendEmail({
    to: params.to,
    subject: params.subject,
    html: params.htmlContent,
    text: params.textContent,
    tags: [{ name: 'type', value: 'credit_repair' }],
  }).catch(e => console.error('sendCreditRepairTemplateEmail:', e))
}

export async function sendCommissionEarnedEmail(params: {
  to: string; name: string; amount: number; type: string; level: number; dashboardLink?: string
}): Promise<void> {
  await sendEmail({
    to: params.to,
    subject: `Commission Earned: $${params.amount.toFixed(2)}`,
    html: textToHtml(
      `Hi ${params.name},\n\nGreat news! You earned a ${params.type} commission of $${params.amount.toFixed(2)} (Level ${params.level}).\n\nView your earnings:\n${params.dashboardLink || APP_URL + '/mlm/payouts'}\n\nKeep building your team!\nThe Credit Repair AI Team`
    ),
    tags: [{ name: 'type', value: 'commission' }],
  }).catch(e => console.error('sendCommissionEarnedEmail:', e))
}

export async function sendRankAdvancementEmail(params: {
  to: string; name: string; oldRank: string; newRank: string; benefits?: string[]; dashboardLink?: string
}): Promise<void> {
  await sendEmail({
    to: params.to,
    subject: `Congratulations! You Advanced to ${params.newRank}! 🏆`,
    html: textToHtml(
      `Hi ${params.name},\n\nCongratulations! You have advanced from ${params.oldRank} to ${params.newRank}!\n${params.benefits?.length ? '\nNew benefits:\n' + params.benefits.map(b => '• ' + b).join('\n') : ''}\n\nView your progress:\n${params.dashboardLink || APP_URL + '/mlm/rank-progression'}\n\nKeep it up!\nThe Credit Repair AI Team`
    ),
    tags: [{ name: 'type', value: 'rank_advancement' }],
  }).catch(e => console.error('sendRankAdvancementEmail:', e))
}

export async function sendPayoutProcessedEmail(params: {
  to: string; name: string; amount: number; method: string; transactionId: string; dashboardLink?: string
}): Promise<void> {
  await sendEmail({
    to: params.to,
    subject: `Payout Processed: $${params.amount.toFixed(2)}`,
    html: textToHtml(
      `Hi ${params.name},\n\nYour payout of $${params.amount.toFixed(2)} via ${params.method} has been processed.\n\nTransaction ID: ${params.transactionId}\n\nView your payouts:\n${params.dashboardLink || APP_URL + '/mlm/payouts'}\n\nThank you!\nThe Credit Repair AI Team`
    ),
    tags: [{ name: 'type', value: 'payout' }],
  }).catch(e => console.error('sendPayoutProcessedEmail:', e))
}

export type { EmailData, EmailResponse }
