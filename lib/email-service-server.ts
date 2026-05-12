/**
 * email-service-server.ts - Server-side email service
 * Uses Resend SDK via lib/resend.ts
 * DO NOT import on client side - server only
 */
import { sendEmail, textToHtml, FROM_NAME } from './resend'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://creditrepairai.com'

// ─── Interfaces (kept for type compatibility) ─────────────────────────────────

export interface InvitationEmailData {
  to: string; name: string; sponsorName: string
  teamCode: string; invitationCode: string; invitationLink: string
}
export interface WelcomeEmailData {
  to: string; name: string; teamCode: string; dashboardLink: string
}

// ─── Core emailService object (used by routes importing from this file) ───────

export const emailService = {
  async sendEmail(opts: { to: string; subject: string; body: string; template?: string }) {
    const html = opts.body.includes('<html') || opts.body.includes('<p') || opts.body.includes('<div')
      ? opts.body : textToHtml(opts.body)
    return sendEmail({ to: opts.to, subject: opts.subject, html, text: opts.body.replace(/<[^>]+>/g,'').trim() })
  },

  sendInvitationEmail: async (data: InvitationEmailData) => {
    return sendEmail({
      to: data.to,
      subject: `You're Invited to Join Credit Repair AI!`,
      html: textToHtml(`Hi ${data.name},\n\n${data.sponsorName} has invited you to join their team on Credit Repair AI!\n\nYour invitation code: ${data.invitationCode}\n\nJoin now:\n${data.invitationLink}\n\nBest,\nThe Credit Repair AI Team`),
      tags: [{ name: 'type', value: 'invitation' }],
    })
  },

  sendWelcomeEmail: async (data: WelcomeEmailData) => {
    return sendEmail({
      to: data.to,
      subject: 'Welcome to Credit Repair AI! 🎉',
      html: textToHtml(`Hi ${data.name},\n\nWelcome to Credit Repair AI!\n\nYour MLM code: ${data.teamCode}\n\nGet started:\n${data.dashboardLink}\n\nBest,\nThe Credit Repair AI Team`),
      tags: [{ name: 'type', value: 'welcome' }],
    })
  },

  sendCreditRepairEmail: async (to: string, name: string, subject: string, content: string) => {
    const html = content.includes('<') ? content : textToHtml(content)
    return sendEmail({ to, subject, html, tags: [{ name: 'type', value: 'credit_repair' }] })
  },

  sendPasswordResetEmail: async (email: string, name: string, resetToken: string) => {
    const resetLink = `${APP_URL}/reset-password?token=${resetToken}`
    return sendEmail({
      to: email,
      subject: 'Reset Your Credit Repair AI Password',
      html: textToHtml(`Hi ${name},\n\nWe received a request to reset your password.\n\nClick the link below to reset it (expires in 1 hour):\n${resetLink}\n\nIf you did not request this, you can safely ignore this email.\n\nBest,\nThe Credit Repair AI Team`),
      tags: [{ name: 'type', value: 'password_reset' }],
    })
  },

  sendTeamUpdateEmail: async (to: string, name: string, updateMessage: string) => {
    return sendEmail({
      to, subject: 'Team Update - Credit Repair AI',
      html: textToHtml(`Hi ${name},\n\n${updateMessage}\n\nBest,\nThe Credit Repair AI Team`),
      tags: [{ name: 'type', value: 'team_update' }],
    })
  },

  sendAdminEmail: async (to: string, subject: string, content: string) => {
    const html = content.includes('<') ? content : textToHtml(content)
    return sendEmail({ to, subject, html, tags: [{ name: 'type', value: 'admin' }] })
  },

  sendTeamJoinEmail: async (params: { to: string; name: string; teamCode: string; sponsorName: string; dashboardLink: string }) => {
    return sendEmail({
      to: params.to,
      subject: "You've Joined a Team on Credit Repair AI!",
      html: textToHtml(`Hi ${params.name},\n\nYou've joined the team sponsored by ${params.sponsorName}.\n\nTeam code: ${params.teamCode}\n\nView your dashboard:\n${params.dashboardLink}\n\nBest,\nThe Credit Repair AI Team`),
      tags: [{ name: 'type', value: 'team_join' }],
    })
  },

  sendTeamCreationEmail: async (params: { to: string; name: string; teamCode: string; dashboardLink: string }) => {
    return sendEmail({
      to: params.to,
      subject: 'Your MLM Team Has Been Created!',
      html: textToHtml(`Hi ${params.name},\n\nYour team has been created!\n\nTeam code: ${params.teamCode}\n\nManage it here:\n${params.dashboardLink}\n\nBest,\nThe Credit Repair AI Team`),
      tags: [{ name: 'type', value: 'team_creation' }],
    })
  },

  sendCommissionEarnedEmail: async (params: { to: string; name: string; amount: number; type: string; level: number; dashboardLink?: string }) => {
    return sendEmail({
      to: params.to,
      subject: `Commission Earned: $${params.amount.toFixed(2)}`,
      html: textToHtml(`Hi ${params.name},\n\nYou earned a ${params.type} commission of $${params.amount.toFixed(2)} at level ${params.level}.\n\nView your earnings:\n${params.dashboardLink || APP_URL + '/mlm/payouts'}\n\nBest,\nThe Credit Repair AI Team`),
      tags: [{ name: 'type', value: 'commission' }],
    })
  },

  sendRankAdvancementEmail: async (params: { to: string; name: string; oldRank: string; newRank: string; benefits?: string[]; dashboardLink?: string }) => {
    return sendEmail({
      to: params.to,
      subject: `Congratulations! You Reached ${params.newRank}! 🏆`,
      html: textToHtml(`Hi ${params.name},\n\nYou advanced from ${params.oldRank} to ${params.newRank}!\n${params.benefits?.length ? '\nNew benefits:\n' + params.benefits.map(b => '• ' + b).join('\n') : ''}\n\nView your progress:\n${params.dashboardLink || APP_URL + '/mlm/rank-progression'}\n\nBest,\nThe Credit Repair AI Team`),
      tags: [{ name: 'type', value: 'rank_advancement' }],
    })
  },

  sendNewTeamMemberEmail: async (params: { to: string; sponsorName: string; newMemberName: string; newMemberEmail: string; teamCode: string; dashboardLink: string }) => {
    return sendEmail({
      to: params.to,
      subject: 'A New Member Joined Your Team!',
      html: textToHtml(`Hi ${params.sponsorName},\n\n${params.newMemberName} (${params.newMemberEmail}) has joined your team (${params.teamCode}).\n\nView your genealogy:\n${params.dashboardLink}\n\nBest,\nThe Credit Repair AI Team`),
      tags: [{ name: 'type', value: 'new_member' }],
    })
  },

  sendPayoutProcessedEmail: async (params: { to: string; name: string; amount: number; method: string; transactionId: string; dashboardLink?: string }) => {
    return sendEmail({
      to: params.to,
      subject: `Payout Processed: $${params.amount.toFixed(2)}`,
      html: textToHtml(`Hi ${params.name},\n\nYour payout of $${params.amount.toFixed(2)} via ${params.method} has been processed.\n\nTransaction ID: ${params.transactionId}\n\nView your payouts:\n${params.dashboardLink || APP_URL + '/mlm/payouts'}\n\nThank you!\nThe Credit Repair AI Team`),
      tags: [{ name: 'type', value: 'payout' }],
    })
  },

  sendTrainingCompletionEmail: async (params: { to: string; name: string; courseName: string; certificateUrl?: string }) => {
    return sendEmail({
      to: params.to,
      subject: `Training Complete: ${params.courseName} 🎓`,
      html: textToHtml(`Hi ${params.name},\n\nCongratulations! You completed "${params.courseName}".\n${params.certificateUrl ? '\nView your certificate:\n' + params.certificateUrl : ''}\n\nBest,\nThe Credit Repair AI Team`),
      tags: [{ name: 'type', value: 'training_completion' }],
    })
  },

  sendTaskCompletionEmail: async (params: { to: string; name: string; taskName: string; reward?: string }) => {
    return sendEmail({
      to: params.to,
      subject: `Task Completed: ${params.taskName} ✅`,
      html: textToHtml(`Hi ${params.name},\n\nYou completed the task "${params.taskName}"!${params.reward ? '\n\nReward earned: ' + params.reward : ''}\n\nKeep going!\nThe Credit Repair AI Team`),
      tags: [{ name: 'type', value: 'task_completion' }],
    })
  },

  sendBillingNotification: async (to: string, name: string, subject: string, message: string) => {
    return sendEmail({
      to, subject,
      html: textToHtml(`Hi ${name},\n\n${message}\n\nBest,\nThe Credit Repair AI Team`),
      tags: [{ name: 'type', value: 'billing' }],
    })
  },
}

// Named exports (compatible with email-service-server imports)
export const {
  sendInvitationEmail,
  sendWelcomeEmail,
  sendCreditRepairEmail,
  sendPasswordResetEmail,
  sendTeamUpdateEmail,
  sendAdminEmail,
  sendTeamJoinEmail,
  sendTeamCreationEmail,
  sendCommissionEarnedEmail,
  sendRankAdvancementEmail,
  sendNewTeamMemberEmail,
  sendPayoutProcessedEmail,
  sendTrainingCompletionEmail,
  sendTaskCompletionEmail,
  sendBillingNotification,
} = emailService

// Legacy compatibility
export const sendCreditRepairTemplateEmail = async (params: { to: string; subject: string; htmlContent: string; textContent?: string }) => {
  return sendEmail({ to: params.to, subject: params.subject, html: params.htmlContent, text: params.textContent })
}
