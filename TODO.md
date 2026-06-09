# TODO — Pending Items

## Resend Email Tracking (Webhook + Live Domain)
When the production domain is connected to Resend, complete these steps:

1. **Register webhook endpoint in Resend dashboard**
   - URL: `https://YOUR-PRODUCTION-DOMAIN/api/webhooks/resend`
   - Events: email.sent, email.delivered, email.opened, email.clicked, email.bounced, email.complained

2. **Add env var to Vercel**
   - `RESEND_WEBHOOK_SECRET` = the `whsec_...` signing secret from Resend

3. **Verify it works**
   - Send a test event from Resend dashboard → check Vercel logs
   - Send a real campaign → check `email_events` table in Supabase for open/click rows
   - Campaign stats (`opened_count`, `clicked_count`, `bounced_count`) should increment automatically

4. **Update EMAIL_FROM** in Vercel env vars to your verified sending domain
   (currently defaults to `onboarding@resend.dev` which only works in dev)

## Infrastructure
- DB: Supabase (gbvpubekxavjxylofpqf)
- Email: Resend (batch send implemented, webhook handler ready at /api/webhooks/resend)
- Payments: Stripe (test mode — switch to live keys before launch)
- Shipping: Shippo
