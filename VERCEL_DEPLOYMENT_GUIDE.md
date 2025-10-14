# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Environment Variables**: Prepare all required environment variables

## Required Environment Variables

Add these environment variables in your Vercel dashboard:

### Database
```
DATABASE_URL=postgresql://username:password@host:port/database
```

### Authentication
```
JWT_SECRET=your-super-secure-jwt-secret-for-production-min-32-chars
JWT_EXPIRES_IN=7d
```

### Stripe (Payment Processing)
```
STRIPE_SECRET_KEY=sk_live_your_live_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret
```

### Supabase (Database & Auth)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
```

### Email Service
```
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your_production_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Credit Repair App
```

### SMTP (Alternative to SendGrid)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Twilio (SMS)
```
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### ShipEngine (Shipping)
```
SHIPENGINE_API_KEY=your_shipengine_api_key
```

### Application URLs
```
APP_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Security
```
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

### File Upload
```
MAX_FILE_SIZE=10485760
```

### OpenAI
```
OPENAI_API_KEY=your_openai_api_key
```

## Deployment Steps

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**:
   ```bash
   vercel env add DATABASE_URL
   vercel env add JWT_SECRET
   vercel env add STRIPE_SECRET_KEY
   vercel env add STRIPE_PUBLISHABLE_KEY
   vercel env add STRIPE_WEBHOOK_SECRET
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add SENDGRID_API_KEY
   vercel env add FROM_EMAIL
   vercel env add FROM_NAME
   vercel env add TWILIO_ACCOUNT_SID
   vercel env add TWILIO_AUTH_TOKEN
   vercel env add TWILIO_PHONE_NUMBER
   vercel env add SHIPENGINE_API_KEY
   vercel env add APP_URL
   vercel env add NEXT_PUBLIC_APP_URL
   vercel env add CORS_ORIGIN
   vercel env add OPENAI_API_KEY
   ```

### Option 2: Deploy via Vercel Dashboard

1. **Connect GitHub Repository**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Project**:
   - Framework Preset: Next.js
   - Root Directory: `./` (default)
   - Build Command: `npm run build`
   - Output Directory: `.next` (default)

3. **Add Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add all the variables listed above

4. **Deploy**:
   - Click "Deploy"

## Post-Deployment Configuration

### 1. Webhook URLs
Update your webhook URLs in external services:

- **Stripe Webhooks**: `https://yourdomain.vercel.app/api/webhooks/stripe`
- **ShipEngine Webhooks**: `https://yourdomain.vercel.app/api/webhooks/shipengine`

### 2. Domain Configuration
- Add your custom domain in Vercel dashboard
- Update DNS records as instructed by Vercel

### 3. Database Setup
- Ensure your production database is accessible from Vercel
- Run any necessary migrations

## Troubleshooting

### Build Failures
- Check that all dependencies are in `package.json`
- Ensure environment variables are set correctly
- Check build logs in Vercel dashboard

### Runtime Errors
- Check function logs in Vercel dashboard
- Verify all environment variables are set
- Check database connectivity

### Performance Issues
- Monitor function execution time
- Consider upgrading Vercel plan for higher limits
- Optimize database queries

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to Git
2. **API Keys**: Use production keys, not test keys
3. **CORS**: Configure CORS properly for your domain
4. **Rate Limiting**: Implement proper rate limiting
5. **HTTPS**: Vercel provides HTTPS by default

## Monitoring

- Use Vercel Analytics for performance monitoring
- Set up error tracking (Sentry, etc.)
- Monitor API usage and costs
- Set up alerts for critical failures

## Support

- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- Vercel Community: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
