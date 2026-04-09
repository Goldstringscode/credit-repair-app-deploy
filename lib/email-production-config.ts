// Production email configuration for SendGrid
// This file contains the production email settings for deployment

export const PRODUCTION_EMAIL_CONFIG = {
  // SendGrid Configuration (for production)
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    from: {
      email: process.env.FROM_EMAIL || 'noreply@creditrepairapp.com',
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
  // Set these env vars in your Vercel/deployment dashboard once SendGrid templates are created.
  templates: {
    mlmInvitation: {
      subject: (sponsorName: string, teamCode: string) => 
        `Join ${sponsorName}'s MLM Team - Team Code: ${teamCode}`,
      templateId: process.env.SENDGRID_TEMPLATE_MLM_INVITATION
    },
    creditRepairWelcome: {
      subject: (name: string) => `Welcome to Credit Repair Services, ${name}!`,
      templateId: process.env.SENDGRID_TEMPLATE_CREDIT_REPAIR_WELCOME
    },
    adminNotification: {
      subject: (type: string) => `Admin Notification: ${type}`,
      templateId: process.env.SENDGRID_TEMPLATE_ADMIN_NOTIFICATION
    }
  }
}

// SendGrid API configuration
export const SENDGRID_CONFIG = {
  apiKey: process.env.SENDGRID_API_KEY,
  from: {
    email: process.env.FROM_EMAIL || 'noreply@creditrepairapp.com',
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

