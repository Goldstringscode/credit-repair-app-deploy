-- Fix Database Schema to Use UUIDs Consistently
-- This script updates the database to use UUIDs for all foreign keys
-- IMPORTANT: This will clear existing data in the related tables

-- First, drop existing foreign key constraints
ALTER TABLE IF EXISTS credit_accounts DROP CONSTRAINT IF EXISTS fk_credit_accounts_report_id;
ALTER TABLE IF EXISTS credit_negative_items DROP CONSTRAINT IF EXISTS fk_negative_items_report_id;
ALTER TABLE IF EXISTS credit_inquiries DROP CONSTRAINT IF EXISTS fk_inquiries_report_id;

-- Clear existing data from child tables since we can't convert integer IDs to UUIDs
-- This is necessary because the existing integer IDs are not valid UUIDs
TRUNCATE TABLE credit_accounts CASCADE;
TRUNCATE TABLE credit_negative_items CASCADE;
TRUNCATE TABLE credit_inquiries CASCADE;

-- Update credit_accounts table - change column type to UUID
ALTER TABLE IF EXISTS credit_accounts 
  ALTER COLUMN credit_report_id TYPE UUID;

-- Update credit_negative_items table - change column type to UUID
ALTER TABLE IF EXISTS credit_negative_items 
  ALTER COLUMN credit_report_id TYPE UUID;

-- Update credit_inquiries table - change column type to UUID
ALTER TABLE IF EXISTS credit_inquiries 
  ALTER COLUMN credit_report_id TYPE UUID;

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
SELECT 'Database schema updated to use UUIDs consistently! All child table data has been cleared.' as status;
