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

## Certified Mail — Sender Contact (USPS/Shippo)
USPS label purchase requires a sender email AND phone. These are now collected in the
letter flow (and seeded from the user profile via /api/auth/me where available).

- [ ] **(Recommended, do later)** Set business sender fallback env vars in Vercel so labels
  carry real contact info instead of the placeholder defaults:
  - `CERTIFIED_MAIL_FROM_EMAIL` = your business support email
  - `CERTIFIED_MAIL_FROM_PHONE` = your business phone (digits only, e.g. 5551234567)
  (Until set, the service falls back to a safe placeholder so label purchase never fails.)

- [ ] Move phone + mailing address (address/city/state/zip) into the saved user profile
  so they don't have to be re-entered per letter. Today /api/auth/me returns email + name
  reliably; phone/address are entered on the letter form. Add columns/handling to the
  profile + /api/auth/update-profile, then have the letter page read them from the profile.

## Infrastructure
- DB: Supabase (gbvpubekxavjxylofpqf)
- Email: Resend (batch send implemented, webhook handler ready at /api/webhooks/resend)
- Payments: Stripe (test mode — switch to live keys before launch)
- Shipping: Shippo

## Rename "MLM System" references to "The Vault"

The dashboard nav label was renamed from "MLM System" to "The Vault" (see
app/dashboard/layout.tsx), and access is now admin-only. That was just the
nav label, though - the rest of the app still says "MLM" in a lot of
user-facing and internal places that should eventually be updated too:

- Page content under app/mlm/ (headings, copy, page titles) still says
  "MLM" - the pages themselves haven't been touched, only the sidebar
  link text that points to them.
- Component names, variable names, and comments across the mlm-related
  lib/ and components/ files (e.g. lib/mlm-commission-structure.ts,
  lib/mlm-realtime-service.ts, anything under components/mlm/) still use
  "MLM" internally.
- Database: the mlm_users, mlm_teams, mlm_genealogy tables (and related
  columns like mlm_code, sponsor_mlm_id) are named after "MLM" - renaming
  these would be a real migration, not just a text change, so decide
  deliberately whether that's worth doing or whether "MLM" is fine to
  keep as the internal/database name even though the product name is
  "The Vault" everywhere a user sees it.
- Any remaining marketing copy, emails, or admin-facing text that
  references "MLM" by name instead of "The Vault".

Suggested approach: do the user-facing copy first (low risk, high value),
and treat the database/table rename as a separate, more careful pass
since it touches migrations and foreign keys.
