# Database Migration Order

Run these SQL files in Supabase SQL Editor in this exact order for a fresh production setup:

1. `supabase-setup.sql` — Base tables and auth setup
2. `supabase-subscriptions-schema-safe.sql` — Subscription tables (use the -safe version)
3. `setup-credit-reports-tables.sql` — Credit report storage tables
4. `compliance-schema.sql` — FCRA/FDCPA compliance tables
5. `training-progress.sql` — Training progress tracking (this file)

> Note: Do NOT run `supabase-subscriptions-schema.sql` or `supabase-subscriptions-schema-fixed.sql` — use only the `-safe` version.
