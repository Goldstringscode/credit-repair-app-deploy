-- Check Current Database Schema
-- This script helps understand the current state of your database

-- Check what tables exist
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%credit%'
ORDER BY table_name;

-- Check the structure of credit_reports table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'credit_reports'
ORDER BY ordinal_position;

-- Check the structure of credit_accounts table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'credit_accounts'
ORDER BY ordinal_position;

-- Check the structure of credit_negative_items table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'credit_negative_items'
ORDER BY ordinal_position;

-- Check the structure of credit_inquiries table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'credit_inquiries'
ORDER BY ordinal_position;

-- Check existing foreign key constraints
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('credit_accounts', 'credit_negative_items', 'credit_inquiries');

-- Check if there are any existing data issues
SELECT 
  'credit_reports' as table_name,
  COUNT(*) as row_count,
  'id column type: ' || data_type as info
FROM information_schema.columns c
LEFT JOIN credit_reports cr ON true
WHERE c.table_name = 'credit_reports' AND c.column_name = 'id'
GROUP BY data_type;

SELECT 
  'credit_accounts' as table_name,
  COUNT(*) as row_count,
  'credit_report_id column type: ' || data_type as info
FROM information_schema.columns c
LEFT JOIN credit_accounts ca ON true
WHERE c.table_name = 'credit_accounts' AND c.column_name = 'credit_report_id'
GROUP BY data_type;
