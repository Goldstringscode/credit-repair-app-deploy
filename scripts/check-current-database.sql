-- Database Diagnostic Script
-- This script checks what currently exists in your database

-- Check what tables exist
SELECT 'Existing Tables:' as info;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if our target tables exist
SELECT 'Target Tables Status:' as info;
SELECT 
    'users' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') 
         THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'credit_reports' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credit_reports') 
         THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'credit_accounts' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credit_accounts') 
         THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'negative_items' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'negative_items') 
         THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'credit_inquiries' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credit_inquiries') 
         THEN 'EXISTS' ELSE 'MISSING' END as status;

-- If credit_reports exists, check its columns
SELECT 'Credit Reports Columns (if table exists):' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'credit_reports'
ORDER BY ordinal_position;

-- Check for any existing data
SELECT 'Existing Data Counts:' as info;
SELECT 
    'users' as table_name, 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') 
         THEN (SELECT COUNT(*) FROM users)::text ELSE 'TABLE NOT EXISTS' END as count
UNION ALL
SELECT 
    'credit_reports' as table_name, 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credit_reports') 
         THEN (SELECT COUNT(*) FROM credit_reports)::text ELSE 'TABLE NOT EXISTS' END as count
UNION ALL
SELECT 
    'credit_accounts' as table_name, 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credit_accounts') 
         THEN (SELECT COUNT(*) FROM credit_accounts)::text ELSE 'TABLE NOT EXISTS' END as count
UNION ALL
SELECT 
    'negative_items' as table_name, 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'negative_items') 
         THEN (SELECT COUNT(*) FROM negative_items)::text ELSE 'TABLE NOT EXISTS' END as count
UNION ALL
SELECT 
    'credit_inquiries' as table_name, 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credit_inquiries') 
         THEN (SELECT COUNT(*) FROM credit_inquiries)::text ELSE 'TABLE NOT EXISTS' END as count;

-- Check for any constraints or indexes
SELECT 'Existing Constraints:' as info;
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

SELECT 'Database Diagnostic Complete!' as status;
