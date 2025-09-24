// Production email configuration for SendGrid
// This file contains the production email settings for deployment

export const PRODUCTION_EMAIL_CONFIG = {
  // SendGrid Configuration (for production)
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    from: {
      email: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
      name: process.env.FROM_NAME || 'Credit Repair App'
    }
  },
  
  // Environment-specific settings
  environment: process.env.NODE_ENV || 'development',
  
  // Rate limiting for production
  rateLimits: {
    maxEmailsPerHour: 1000,
    maxEmailsPerDay: 10000
  },
  
  // Email templates for production
  templates: {
    mlmInvitation: {
      subject: (sponsorName: string, teamCode: string) => 
        `Join ${sponsorName}'s MLM Team - Team Code: ${teamCode}`,
      templateId: 'd-1234567890abcdef' // SendGrid template ID
    },
    creditRepairWelcome: {
      subject: (name: string) => `Welcome to Credit Repair Services, ${name}!`,
      templateId: 'd-1234567890abcdef' // SendGrid template ID
    },
    adminNotification: {
      subject: (type: string) => `Admin Notification: ${type}`,
      templateId: 'd-1234567890abcdef' // SendGrid template ID
    }
  }
}

// SendGrid API configuration
export const SENDGRID_CONFIG = {
  apiKey: process.env.SENDGRID_API_KEY,
  from: {
    email: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
    name: process.env.FROM_NAME || 'Credit Repair App'
  },
  replyTo: process.env.REPLY_TO_EMAIL || process.env.FROM_EMAIL,
  tracking: {
    clickTracking: true,
    openTracking: true,
    subscriptionTracking: true
  }
}

// Production email service setup
export function setupProductionEmail() {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY is required for production email')
  }
  
  if (!process.env.FROM_EMAIL) {
    throw new Error('FROM_EMAIL is required for production email')
  }
  
  console.log('✅ Production email configured with SendGrid')
  console.log(`📧 From: ${SENDGRID_CONFIG.from.name} <${SENDGRID_CONFIG.from.email}>`)
  
  return SENDGRID_CONFIG
}

// Environment detection
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

