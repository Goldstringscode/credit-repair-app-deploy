# Production Deployment Checklist

## Pre-Deployment Checklist

### Environment Configuration
- [ ] **ShipEngine API Key**: `SHIPENGINE_API_KEY` configured
- [ ] **ShipEngine Webhook Secret**: `SHIPENGINE_WEBHOOK_SECRET` configured
- [ ] **Database URLs**: Supabase URLs and keys configured
- [ ] **Stripe Keys**: Payment processing keys configured
- [ ] **Email Service**: SendGrid/Resend/AWS SES configured
- [ ] **App URL**: `NEXT_PUBLIC_APP_URL` set to production domain

### Database Setup
- [ ] **Schema Deployed**: Run `scripts/deploy-certified-mail-schema.sql` in Supabase
- [ ] **RLS Policies**: Row Level Security policies enabled
- [ ] **Service Role**: Service role key has necessary permissions
- [ ] **Test Data**: Remove any test data from production

### ShipEngine Configuration
- [ ] **Webhook URL**: Set to `https://yourdomain.com/api/webhooks/shipengine`
- [ ] **Webhook Events**: Subscribe to all tracking events
- [ ] **Webhook Security**: Signature verification enabled
- [ ] **Test Webhook**: Verify webhook is receiving events

### Email Service Setup
- [ ] **Provider Selected**: SendGrid, Resend, or AWS SES
- [ ] **API Keys**: Email service API keys configured
- [ ] **Sender Verification**: Sender email address verified
- [ ] **Templates**: Email templates created and tested

### Security Configuration
- [ ] **HTTPS**: All endpoints use HTTPS
- [ ] **CORS**: CORS configured for production domain
- [ ] **Rate Limiting**: API rate limiting enabled
- [ ] **Webhook Security**: All webhooks verify signatures

## Deployment Steps

### 1. Code Deployment
```bash
# Build the application
npm run build

# Deploy to your hosting platform
# (Vercel, Netlify, AWS, etc.)
```

### 2. Environment Variables
Set all required environment variables in your hosting platform:
- `SHIPENGINE_API_KEY`
- `SHIPENGINE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `SENDGRID_API_KEY` (or other email service)
- `NEXT_PUBLIC_APP_URL`

### 3. Database Migration
```sql
-- Run in Supabase SQL Editor
-- Execute scripts/deploy-certified-mail-schema.sql
```

### 4. Webhook Configuration
1. **ShipEngine Dashboard**:
   - Go to Settings → Webhooks
   - Add webhook: `https://yourdomain.com/api/webhooks/shipengine`
   - Subscribe to all tracking events
   - Set webhook secret

2. **Stripe Dashboard**:
   - Go to Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe-mail`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`

### 5. Email Service Setup
1. **SendGrid**:
   - Verify sender email
   - Create API key
   - Test email delivery

2. **Resend**:
   - Verify domain
   - Create API key
   - Test email delivery

3. **AWS SES**:
   - Verify sender email
   - Create IAM user with SES permissions
   - Move out of sandbox mode

## Post-Deployment Testing

### 1. Run Production Tests
```bash
node scripts/test-production-system.js
```

### 2. Manual Testing
- [ ] **Create Test Letter**: Send a test certified mail
- [ ] **Check Tracking**: Verify tracking updates work
- [ ] **Test Payments**: Process a test payment
- [ ] **Check Emails**: Verify email notifications work
- [ ] **Test Webhooks**: Send test webhook events

### 3. Monitoring Setup
- [ ] **Error Tracking**: Set up Sentry or similar
- [ ] **Performance Monitoring**: Set up Vercel Analytics
- [ ] **Uptime Monitoring**: Set up uptime monitoring
- [ ] **Log Monitoring**: Set up log aggregation

## Production Monitoring

### Key Metrics to Monitor
- **API Response Times**: Should be < 2 seconds
- **Error Rates**: Should be < 1%
- **Webhook Success Rate**: Should be > 99%
- **Email Delivery Rate**: Should be > 95%
- **Database Performance**: Query times < 500ms

### Alerts to Set Up
- **High Error Rate**: > 5% errors in 5 minutes
- **Slow Response**: > 5 second response times
- **Webhook Failures**: Failed webhook deliveries
- **Database Issues**: Connection failures or slow queries
- **Email Failures**: Failed email deliveries

### Daily Checks
- [ ] Check error logs
- [ ] Verify webhook deliveries
- [ ] Check email delivery rates
- [ ] Monitor database performance
- [ ] Review user feedback

## Troubleshooting Guide

### Common Issues

#### Webhook Not Receiving Events
1. Check webhook URL is accessible
2. Verify HTTPS certificate
3. Check webhook secret configuration
4. Review ShipEngine webhook logs

#### Email Not Sending
1. Check email service API keys
2. Verify sender email address
3. Check email service quotas
4. Review email service logs

#### Database Connection Issues
1. Check Supabase service status
2. Verify database credentials
3. Check RLS policies
4. Review connection limits

#### Payment Processing Issues
1. Check Stripe API keys
2. Verify webhook configuration
3. Check payment method validation
4. Review Stripe logs

### Emergency Procedures

#### System Down
1. Check hosting platform status
2. Review application logs
3. Check database connectivity
4. Verify environment variables

#### Data Issues
1. Check database backups
2. Review data integrity
3. Check for data corruption
4. Restore from backup if needed

## Maintenance Schedule

### Weekly
- [ ] Review error logs
- [ ] Check system performance
- [ ] Update dependencies
- [ ] Review user feedback

### Monthly
- [ ] Security updates
- [ ] Performance optimization
- [ ] Database maintenance
- [ ] Backup verification

### Quarterly
- [ ] Security audit
- [ ] Performance review
- [ ] Feature updates
- [ ] Disaster recovery test

## Support Contacts

### Technical Support
- **Hosting Platform**: [Your hosting provider support]
- **ShipEngine**: support@shipengine.com
- **Stripe**: support@stripe.com
- **Supabase**: support@supabase.com

### Emergency Contacts
- **On-Call Engineer**: [Your contact]
- **System Administrator**: [Your contact]
- **Product Manager**: [Your contact]

## Success Criteria

### Launch Success Metrics
- [ ] All tests passing
- [ ] Zero critical errors
- [ ] < 2 second response times
- [ ] 99%+ uptime
- [ ] Successful test transactions

### Post-Launch Success Metrics
- [ ] User adoption rate
- [ ] Transaction success rate
- [ ] Customer satisfaction
- [ ] System performance
- [ ] Revenue generation

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Approved By**: _______________
