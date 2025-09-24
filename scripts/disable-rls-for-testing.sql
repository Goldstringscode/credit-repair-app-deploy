-- Temporarily disable RLS for testing
-- WARNING: This should only be used for development/testing

-- Disable RLS on all tables
ALTER TABLE certified_mail_tracking DISABLE ROW LEVEL SECURITY;
ALTER TABLE mail_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE mail_payment_transactions DISABLE ROW LEVEL SECURITY;

-- Or alternatively, create permissive policies
-- DROP POLICY IF EXISTS "Users can view their own mail tracking" ON certified_mail_tracking;
-- DROP POLICY IF EXISTS "Users can insert their own mail tracking" ON certified_mail_tracking;
-- DROP POLICY IF EXISTS "Users can update their own mail tracking" ON certified_mail_tracking;

-- CREATE POLICY "Allow all operations for testing" ON certified_mail_tracking
--   FOR ALL USING (true) WITH CHECK (true);

-- CREATE POLICY "Allow all operations for testing" ON mail_events
--   FOR ALL USING (true) WITH CHECK (true);

-- CREATE POLICY "Allow all operations for testing" ON mail_payment_transactions
--   FOR ALL USING (true) WITH CHECK (true);
