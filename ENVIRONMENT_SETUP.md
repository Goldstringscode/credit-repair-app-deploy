# Environment Setup Guide

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here

# Database Configuration
DATABASE_URL=your_database_url_here

# Email Configuration
SMTP_HOST=your_smtp_host_here
SMTP_PORT=587
SMTP_USER=your_smtp_user_here
SMTP_PASS=your_smtp_password_here

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here

# App Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

## Demo Mode

If you don't have Supabase configured, the app will run in demo mode with:
- Default payout settings
- Mock data for testing
- No database persistence

## Quick Setup

1. Copy the environment variables above
2. Create `.env.local` file in the root directory
3. Replace placeholder values with your actual credentials
4. Restart the development server

## Testing Without Database

The MLM billing system will work in demo mode without Supabase configuration, allowing you to test all features including:
- Tax ID formatting (SSN/EIN)
- Payout settings modal
- Payment method management
- All UI interactions
