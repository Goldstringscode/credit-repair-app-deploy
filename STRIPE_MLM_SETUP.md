# MLM Stripe Integration Setup Guide

## Environment Variables Required

Add these environment variables to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# MLM Stripe Price IDs
STRIPE_MLM_STARTER_PRICE_ID=price_starter_monthly
STRIPE_MLM_PROFESSIONAL_PRICE_ID=price_professional_monthly
STRIPE_MLM_ENTERPRISE_PRICE_ID=price_enterprise_monthly

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Stripe Setup Steps

### 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete the account verification process
3. Get your API keys from the Stripe Dashboard

### 2. Create Products and Prices
1. Go to Products in your Stripe Dashboard
2. Create three products:
   - **MLM Starter** - $97/month
   - **MLM Professional** - $197/month  
   - **MLM Enterprise** - $397/month
3. Create recurring prices for each product
4. Copy the Price IDs and add them to your environment variables

### 3. Set Up Webhooks
1. Go to Webhooks in your Stripe Dashboard
2. Add endpoint: `https://yourdomain.com/api/mlm/webhooks/stripe`
3. Select these events:
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `transfer.created`
   - `payout.paid`
   - `account.updated`
4. Copy the webhook secret and add it to your environment variables

### 4. Enable Connected Accounts (for payouts)
1. Go to Connect in your Stripe Dashboard
2. Enable Express accounts
3. Configure payout settings
4. Set up your platform account

## Testing

### Test Mode
- Use test API keys (starting with `sk_test_` and `pk_test_`)
- Use test card numbers from Stripe documentation
- Test webhooks using Stripe CLI or webhook testing tools

### Test Card Numbers
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Authentication**: 4000 0025 0000 3155

## Production Deployment

### 1. Switch to Live Mode
- Replace test keys with live keys
- Update webhook endpoints to production URLs
- Test with real payment methods

### 2. Compliance
- Ensure PCI compliance
- Set up proper error handling
- Implement fraud detection
- Add proper logging and monitoring

### 3. Monitoring
- Set up Stripe Dashboard alerts
- Monitor webhook delivery
- Track payout success rates
- Monitor chargeback rates

## MLM-Specific Features

### Commission Payouts
- Users can set up bank accounts for direct deposits
- Automated payout processing based on commission thresholds
- Support for multiple payout methods (bank, card, PayPal)

### Subscription Management
- Three-tier MLM subscription system
- Automatic billing and renewal
- Proration for upgrades/downgrades
- Cancellation handling

### Tax Documents
- Automatic 1099 generation for qualifying users
- Tax document storage and retrieval
- Compliance with IRS requirements

## Security Considerations

1. **Webhook Verification**: Always verify webhook signatures
2. **API Key Protection**: Never expose secret keys in client-side code
3. **Data Encryption**: Encrypt sensitive payment data
4. **Access Control**: Implement proper user authentication
5. **Audit Logging**: Log all payment-related activities

## Support

For Stripe-specific issues:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- [Stripe Community](https://github.com/stripe/stripe-node)

For MLM system issues:
- Check the application logs
- Review the test scripts
- Contact the development team
