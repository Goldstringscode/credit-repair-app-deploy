/**
 * lib/email-service-server.ts
 * Re-exports from lib/email-service.ts for backward compatibility.
 */
export * from './email-service'
export { emailService } from './email-service'

// Standalone named export so routes can do:
// import { sendCreditRepairEmail } from '@/lib/email-service-server'
export async function sendCreditRepairEmail(
  to: string,
  name: string,
  subject: string,
  content: string
): Promise<{ success: boolean; error?: string }> {
  const { emailService } = await import('./email-service')
  return emailService.sendCreditRepairEmail(to, name, subject, content)
}
