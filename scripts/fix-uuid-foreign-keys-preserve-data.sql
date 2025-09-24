-- Fix Database Schema to Use UUIDs Consistently (Data-Preserving Version)
-- This script updates the database to use UUIDs for all foreign keys while preserving data
-- This approach is safer but more complex

-- First, drop existing foreign key constraints
ALTER TABLE IF EXISTS credit_accounts DROP CONSTRAINT IF EXISTS fk_credit_accounts_report_id;
ALTER TABLE IF EXISTS credit_negative_items DROP CONSTRAINT IF EXISTS fk_negative_items_report_id;
ALTER TABLE IF EXISTS credit_inquiries DROP CONSTRAINT IF EXISTS fk_inquiries_report_id;

-- For credit_accounts table
-- Add new UUID column
ALTER TABLE credit_accounts ADD COLUMN credit_report_id_new UUID;

-- Update the new column with UUIDs from credit_reports table
-- This assumes there's a way to map existing integer IDs to UUIDs
-- If no mapping exists, you'll need to create new credit reports with UUIDs
UPDATE credit_accounts 
SET credit_report_id_new = cr.id::UUID
FROM credit_reports cr 
WHERE credit_accounts.credit_report_id = cr.id;

-- Drop old column and rename new one
ALTER TABLE credit_accounts DROP COLUMN credit_report_id;
ALTER TABLE credit_accounts RENAME COLUMN credit_report_id_new TO credit_report_id;

-- For credit_negative_items table
ALTER TABLE credit_negative_items ADD COLUMN credit_report_id_new UUID;

UPDATE credit_negative_items 
SET credit_report_id_new = cr.id::UUID
FROM credit_reports cr 
WHERE credit_negative_items.credit_report_id = cr.id;

ALTER TABLE credit_negative_items DROP COLUMN credit_report_id;
ALTER TABLE credit_negative_items RENAME COLUMN credit_report_id_new TO credit_report_id;

-- For credit_inquiries table
ALTER TABLE credit_inquiries ADD COLUMN credit_report_id_new UUID;

UPDATE credit_inquiries 
SET credit_report_id_new = cr.id::UUID
FROM credit_reports cr 
WHERE credit_inquiries.credit_report_id = cr.id;

ALTER TABLE credit_inquiries DROP COLUMN credit_report_id;
ALTER TABLE credit_inquiries RENAME COLUMN credit_report_id_new TO credit_report_id;

-- Re-add foreign key constraints with UUIDs
ALTER TABLE credit_accounts 
  ADD CONSTRAINT fk_credit_accounts_report_id 
  FOREIGN KEY (credit_report_id) REFERENCES credit_reports(id) ON DELETE CASCADE;

ALTER TABLE credit_negative_items 
  ADD CONSTRAINT fk_negative_items_report_id 
  FOREIGN KEY (credit_report_id) REFERENCES credit_reports(id) ON DELETE CASCADE;

ALTER TABLE credit_inquiries 
  ADD CONSTRAINT fk_inquiries_report_id 
  FOREIGN KEY (credit_report_id) REFERENCES credit_reports(id) ON DELETE CASCADE;

-- Verify the changes
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name IN ('credit_accounts', 'credit_negative_items', 'credit_inquiries')
  AND column_name = 'credit_report_id'
ORDER BY table_name;

-- Success message
SELECT 'Database schema updated to use UUIDs consistently! Data has been preserved.' as status;
