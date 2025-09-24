import { NextRequest, NextResponse } from 'next/server'
import { envValidator } from '@/lib/env-validation'

export const GET = async (request: NextRequest) => {
  try {
    const isValid = envValidator.isValid()
    const errors = envValidator.getErrors()
    
    return NextResponse.json({ 
      valid: isValid,
      errors: errors,
      environment: process.env.NODE_ENV,
      features: {
        aiAnalysis: envValidator.isFeatureEnabled('ai_analysis'),
        superiorParser: envValidator.isFeatureEnabled('superior_parser'),
        notifications: envValidator.isFeatureEnabled('notifications'),
        auditLogging: envValidator.isFeatureEnabled('audit_logging')
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      valid: false,
      error: 'Environment validation failed',
      message: error.message 
    }, { status: 500 })
  }
}

