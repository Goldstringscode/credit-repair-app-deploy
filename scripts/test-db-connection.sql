-- Test Database Connection and Schema
-- Run this in your Neon database console to verify everything is working

-- Test 1: Basic connection
SELECT 'Database connection successful!' as test_result;

-- Test 2: Check if tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IS NOT NULL THEN 'EXISTS'
        ELSE 'MISSING'
    END as status
FROM (
    SELECT 'credit_reports' as table_name
    UNION ALL SELECT 'credit_accounts'
    UNION ALL SELECT 'credit_negative_items'
    UNION ALL SELECT 'credit_inquiries'
) t
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = t.table_name
);

-- Test 3: Check table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'credit_reports'
ORDER BY ordinal_position;

-- Test 4: Check foreign key constraints
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
AND tc.table_name LIKE 'credit_%';

-- Test 5: Insert test record
INSERT INTO credit_reports (user_id, file_name, file_size, file_type, bureau, report_date, processing_status)
VALUES ('test-user', 'test-file.pdf', 1024, 'application/pdf', 'experian', CURRENT_DATE, 'completed')
ON CONFLICT DO NOTHING;

-- Test 6: Verify test record
SELECT 
    id,
    user_id,
    file_name,
    bureau,
    processing_status,
    created_at
FROM credit_reports 
WHERE user_id = 'test-user'
ORDER BY created_at DESC
LIMIT 1;

-- Test 7: Clean up test data
DELETE FROM credit_reports WHERE user_id = 'test-user';

-- Final status
SELECT 'All database tests completed successfully!' as final_status;
