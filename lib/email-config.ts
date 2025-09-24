// Email configuration for the Credit Repair App
export interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
  from: {
    name: string
    email: string
  }
}

// Get email configuration based on environment
export function getEmailConfig(): EmailConfig {
  // Check for SendGrid first (production)
  if (process.env.SENDGRID_API_KEY) {
    return {
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      },
      from: {
        name: process.env.FROM_NAME || 'Credit Repair App',
        email: process.env.FROM_EMAIL || 'noreply@creditrepairapp.com'
      }
    }
  }

  // Check for Mailgun
  if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
    return {
      host: 'smtp.mailgun.org',
      port: 587,
      secure: false,
      auth: {
        user: `postmaster@${process.env.MAILGUN_DOMAIN}`,
        pass: process.env.MAILGUN_API_KEY
      },
      from: {
        name: process.env.FROM_NAME || 'Credit Repair App',
        email: `noreply@${process.env.MAILGUN_DOMAIN}`
      }
    }
  }

  // Default to Gmail SMTP (development)
  const config = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || 'your-email@gmail.com',
      pass: process.env.SMTP_PASS || 'your-app-password'
    },
    from: {
      name: process.env.FROM_NAME || 'Credit Repair App',
      email: process.env.FROM_EMAIL || 'noreply@creditrepairapp.com'
    }
  }
  
  // Validate Gmail configuration
  if (config.host === 'smtp.gmail.com') {
    if (!config.auth.user || !config.auth.pass) {
      console.warn('⚠️ Gmail SMTP credentials not configured. Emails will not be sent.')
      console.warn('📧 Please set SMTP_USER and SMTP_PASS in your .env.local file')
    } else if (config.auth.pass === 'your-app-password') {
      console.warn('⚠️ Please replace "your-app-password" with your actual Gmail App Password')
    }
  }
  
  return config
}

// Email templates configuration
export const EMAIL_TEMPLATES = {
  // MLM Templates
  MLM_INVITATION: {
    subject: (sponsorName: string, teamCode: string) => 
      `Join ${sponsorName}'s MLM Team - Team Code: ${teamCode}`,
    template: 'mlm-invitation'
  },
  MLM_WELCOME: {
    subject: (name: string) => `Welcome to the MLM Program, ${name}!`,
    template: 'mlm-welcome'
  },
  MLM_RANK_UPGRADE: {
    subject: (name: string, newRank: string) => 
      `Congratulations! You've been promoted to ${newRank}`,
    template: 'mlm-rank-upgrade'
  },
  
  // Credit Repair Templates
  CREDIT_REPAIR_WELCOME: {
    subject: (name: string) => `Welcome to Credit Repair Services, ${name}!`,
    template: 'credit-repair-welcome'
  },
  CREDIT_REPAIR_UPDATE: {
    subject: (name: string) => `Credit Repair Progress Update for ${name}`,
    template: 'credit-repair-update'
  },
  CREDIT_REPAIR_COMPLETION: {
    subject: (name: string) => `Credit Repair Process Completed for ${name}`,
    template: 'credit-repair-completion'
  },
  
  // Admin Templates
  ADMIN_NOTIFICATION: {
    subject: (type: string) => `Admin Notification: ${type}`,
    template: 'admin-notification'
  },
  SYSTEM_ALERT: {
    subject: (alert: string) => `System Alert: ${alert}`,
    template: 'system-alert'
  }
} as const

// Email service types
export type EmailService = 'gmail' | 'sendgrid' | 'mailgun' | 'ses'

export function getEmailService(): EmailService {
  if (process.env.SENDGRID_API_KEY) return 'sendgrid'
  if (process.env.MAILGUN_API_KEY) return 'mailgun'
  if (process.env.AWS_SES_ACCESS_KEY_ID) return 'ses'
  return 'gmail'
}
