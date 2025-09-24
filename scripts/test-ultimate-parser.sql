-- Test Ultimate Parser Database Operations
-- This script tests the complete flow of the ultimate parser

-- First, let's check the current schema
SELECT 'Current Schema Status:' as info;
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('credit_reports', 'credit_scores', 'credit_accounts', 'credit_negative_items')
ORDER BY table_name, ordinal_position;

-- Test inserting a sample credit report
INSERT INTO credit_reports (
  id, user_id, bureau, report_date, file_name, file_size, file_type,
  credit_score, ai_analysis, processing_status, raw_text, confidence_score
) VALUES (
  gen_random_uuid(), 'test-user-123', 'EXPERIAN', 
  CURRENT_DATE, 'test_report.pdf', 1024000, 'application/pdf',
  750, '{"test": "data"}', 'completed', 'Sample credit report text for testing', 0.95
) RETURNING id;

-- Test inserting credit scores
INSERT INTO credit_scores (
  id, credit_report_id, bureau, score, score_model, date_generated
) VALUES (
  gen_random_uuid(), 
  (SELECT id FROM credit_reports WHERE user_id = 'test-user-123' LIMIT 1),
  'EXPERIAN', 750, 'FICO Score 8', '2024-01-15'
);

INSERT INTO credit_scores (
  id, credit_report_id, bureau, score, score_model, date_generated
) VALUES (
  gen_random_uuid(), 
  (SELECT id FROM credit_reports WHERE user_id = 'test-user-123' LIMIT 1),
  'EQUIFAX', 745, 'FICO Score 8', '2024-01-15'
);

-- Test inserting credit accounts
INSERT INTO credit_accounts (
  id, credit_report_id, account_type, creditor_name, account_number_last_4,
  balance, credit_limit, payment_status, opened_date, last_activity
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM credit_reports WHERE user_id = 'test-user-123' LIMIT 1),
  'Credit Card', 'CHASE BANK', '1234',
  2500.00, 10000.00, 'Current', '2020-03-15', '2024-01-15'
);

-- Test inserting negative items
INSERT INTO credit_negative_items (
  id, credit_report_id, item_type, creditor_name, account_number_last_4,
  status, balance, original_amount, date_reported, notes
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM credit_reports WHERE user_id = 'test-user-123' LIMIT 1),
  'Late Payment', 'CHASE BANK', '5678',
  'Paid', 0.00, 150.00, '2023-06-15', '30 days late payment'
);

-- Verify all data was inserted correctly
SELECT 'Verification Results:' as info;

SELECT 'Credit Reports:' as table_name, COUNT(*) as count FROM credit_reports;
SELECT 'Credit Scores:' as table_name, COUNT(*) as count FROM credit_scores;
SELECT 'Credit Accounts:' as table_name, COUNT(*) as count FROM credit_accounts;
SELECT 'Negative Items:' as table_name, COUNT(*) as count FROM credit_negative_items;

-- Show sample data
SELECT 'Sample Credit Report:' as info;
SELECT id, user_id, bureau, credit_score, confidence_score FROM credit_reports WHERE user_id = 'test-user-123';

SELECT 'Sample Credit Scores:' as info;
SELECT bureau, score, score_model FROM credit_scores 
WHERE credit_report_id = (SELECT id FROM credit_reports WHERE user_id = 'test-user-123' LIMIT 1);

SELECT 'Sample Credit Accounts:' as info;
SELECT creditor_name, account_type, balance, credit_limit FROM credit_accounts 
WHERE credit_report_id = (SELECT id FROM credit_reports WHERE user_id = 'test-user-123' LIMIT 1);

SELECT 'Sample Negative Items:' as info;
SELECT item_type, creditor_name, status, balance FROM credit_negative_items 
WHERE credit_report_id = (SELECT id FROM credit_reports WHERE user_id = 'test-user-123' LIMIT 1);

-- Test foreign key relationships
SELECT 'Foreign Key Test:' as info;
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
  AND tc.table_name IN ('credit_scores', 'credit_accounts', 'credit_negative_items');

-- Clean up test data
DELETE FROM credit_negative_items WHERE credit_report_id IN (SELECT id FROM credit_reports WHERE user_id = 'test-user-123');
DELETE FROM credit_accounts WHERE credit_report_id IN (SELECT id FROM credit_reports WHERE user_id = 'test-user-123');
DELETE FROM credit_scores WHERE credit_report_id IN (SELECT id FROM credit_reports WHERE user_id = 'test-user-123');
DELETE FROM credit_reports WHERE user_id = 'test-user-123';

SELECT 'Test completed successfully! All test data cleaned up.' as status;
