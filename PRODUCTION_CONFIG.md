# Production Configuration Guide

## Overview
This guide covers the configuration needed to enable production-ready certified mail functionality.

## Step 1: Environment Variables

### Required Environment Variables
Add these to your production `.env.local` or environment configuration:

```bash
# ShipEngine Configuration
SHIPENGINE_API_KEY=your_shipengine_api_key_here
SHIPENGINE_BASE_URL=https://api.shipengine.com
SHIPENGINE_WEBHOOK_SECRET=your_webhook_secret_here

# Database Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Email Service Configuration (choose one)
# Option 1: SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Option 2: Resend
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Option 3: AWS SES
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_SES_FROM_EMAIL=noreply@yourdomain.com

# Application Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

## Step 2: Enable Production Service

### Option A: Replace Mock Service (Recommended)
Update your imports to use the production service:

```typescript
// In lib/certified-mail-service-shipengine.ts
import { shipEngineServiceProduction as shipEngineService } from './shipengine-service-production';

// In app/api/certified-mail/create/route.ts
import { certifiedMailService } from '@/lib/certified-mail-service-shipengine-production';
```

### Option B: Environment-Based Switching
Modify the existing service to switch based on environment:

```typescript
// In lib/shipengine-service.ts
const isProduction = process.env.NODE_ENV === 'production' && process.env.SHIPENGINE_API_KEY;

if (isProduction) {
  // Use real ShipEngine API
  this.shipengine = new ShipEngine({
    apiKey: process.env.SHIPENGINE_API_KEY,
    baseURL: process.env.SHIPENGINE_BASE_URL || 'https://api.shipengine.com',
  });
} else {
  // Use mock responses
  this.shipengine = null;
}
```

## Step 3: Database Configuration

### Supabase Setup
1. **Enable RLS**: Ensure Row Level Security is enabled
2. **Service Role Key**: Use service role key for server-side operations
3. **Webhook Access**: Ensure webhook handler can access database

### Database Permissions
```sql
-- Ensure service role has necessary permissions
GRANT ALL ON certified_mail_tracking TO service_role;
GRANT ALL ON mail_events TO service_role;
GRANT ALL ON mail_payment_transactions TO service_role;
```

## Step 4: Webhook Configuration

### ShipEngine Webhooks
1. **Webhook URL**: `https://yourdomain.com/api/webhooks/shipengine`
2. **Events**: Subscribe to all tracking events
3. **Security**: Enable signature verification
4. **Retry Policy**: Configure retry attempts (3-5 retries)

### Stripe Webhooks
1. **Webhook URL**: `https://yourdomain.com/api/webhooks/stripe-mail`
2. **Events**: `payment_intent.succeeded`, `payment_intent.payment_failed`
3. **Security**: Enable signature verification

## Step 5: Email Service Setup

### SendGrid Configuration
1. **API Key**: Generate API key in SendGrid dashboard
2. **Sender Verification**: Verify sender email address
3. **Template**: Create email templates for notifications

### Resend Configuration
1. **API Key**: Generate API key in Resend dashboard
2. **Domain**: Verify your domain
3. **Templates**: Create email templates

### AWS SES Configuration
1. **Credentials**: Set up AWS credentials
2. **Region**: Choose appropriate AWS region
3. **Verification**: Verify sender email address
4. **Sandbox**: Move out of sandbox mode for production

## Step 6: Security Configuration

### Webhook Security
```typescript
// Verify all webhook signatures
const signature = request.headers.get('x-shipengine-signature');
const expectedSignature = crypto
  .createHmac('sha256', process.env.SHIPENGINE_WEBHOOK_SECRET)
  .update(JSON.stringify(body))
  .digest('hex');

if (signature !== expectedSignature) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
}
```

### Rate Limiting
```typescript
// Implement rate limiting for API endpoints
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

### CORS Configuration
```typescript
// Configure CORS for production
const corsOptions = {
  origin: ['https://yourdomain.com'],
  credentials: true,
  optionsSuccessStatus: 200
};
```

## Step 7: Monitoring and Logging

### Application Monitoring
1. **Error Tracking**: Set up Sentry or similar
2. **Performance Monitoring**: Use Vercel Analytics or similar
3. **Uptime Monitoring**: Set up uptime monitoring

### Logging Configuration
```typescript
// Structured logging for production
const logger = {
  info: (message: string, data?: any) => {
    console.log(JSON.stringify({ level: 'info', message, data, timestamp: new Date().toISOString() }));
  },
  error: (message: string, error?: any) => {
    console.error(JSON.stringify({ level: 'error', message, error, timestamp: new Date().toISOString() }));
  }
};
```

### Database Monitoring
1. **Query Performance**: Monitor slow queries
2. **Connection Pooling**: Configure appropriate pool size
3. **Backup Strategy**: Set up automated backups

## Step 8: Testing

### Pre-Production Testing
1. **Staging Environment**: Test all functionality in staging
2. **Load Testing**: Test with realistic load
3. **Webhook Testing**: Test webhook endpoints
4. **Email Testing**: Test email delivery

### Production Testing
1. **Smoke Tests**: Basic functionality tests
2. **Integration Tests**: End-to-end testing
3. **Monitoring**: Watch for errors and performance issues

## Step 9: Deployment Checklist

### Before Deployment
- [ ] All environment variables configured
- [ ] Database schema deployed
- [ ] Webhooks configured
- [ ] Email service configured
- [ ] Security measures in place
- [ ] Monitoring set up
- [ ] Testing completed

### After Deployment
- [ ] Webhook endpoints responding
- [ ] Database connections working
- [ ] Email delivery working
- [ ] Payment processing working
- [ ] Monitoring alerts configured
- [ ] Documentation updated

## Step 10: Maintenance

### Regular Tasks
1. **Monitor Logs**: Check for errors and issues
2. **Update Dependencies**: Keep packages updated
3. **Backup Database**: Regular backups
4. **Review Metrics**: Analyze performance and usage

### Troubleshooting
1. **Webhook Issues**: Check ShipEngine dashboard
2. **Email Issues**: Check email service logs
3. **Database Issues**: Check Supabase logs
4. **Payment Issues**: Check Stripe dashboard

## Support and Resources

### Documentation
- [ShipEngine API Docs](https://www.shipengine.com/docs/)
- [Stripe API Docs](https://stripe.com/docs/api)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

### Support Channels
- ShipEngine Support: support@shipengine.com
- Stripe Support: support@stripe.com
- Supabase Support: support@supabase.com
