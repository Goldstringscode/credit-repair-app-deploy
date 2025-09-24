-- Enhanced database schema to handle partial credit report data
-- Run this script in your Neon SQL Editor

-- Add new columns to credit_reports table for enhanced analysis
ALTER TABLE credit_reports 
ADD COLUMN IF NOT EXISTS experian_score INTEGER,
ADD COLUMN IF NOT EXISTS equifax_score INTEGER,
ADD COLUMN IF NOT EXISTS transunion_score INTEGER,
ADD COLUMN IF NOT EXISTS primary_score INTEGER,
ADD COLUMN IF NOT EXISTS score_model VARCHAR(100),
ADD COLUMN IF NOT EXISTS bureau_detected VARCHAR(50),
ADD COLUMN IF NOT EXISTS report_date DATE,
ADD COLUMN IF NOT EXISTS file_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS processing_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS has_personal_info BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_accounts BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_payment_history BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_inquiries BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_negative_items BOOLEAN DEFAULT FALSE;

-- Update credit_reports to use UUID for better compatibility
ALTER TABLE credit_reports ALTER COLUMN id TYPE VARCHAR(36);

-- Add new columns to credit_accounts for enhanced tracking
ALTER TABLE credit_accounts 
ADD COLUMN IF NOT EXISTS months_reviewed INTEGER,
ADD COLUMN IF NOT EXISTS late_payments_30 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS late_payments_60 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS late_payments_90 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS credit_report_id VARCHAR(36);

-- Update foreign key reference in credit_accounts
UPDATE credit_accounts SET credit_report_id = report_id::VARCHAR WHERE credit_report_id IS NULL;
ALTER TABLE credit_accounts DROP CONSTRAINT IF EXISTS credit_accounts_report_id_fkey;
ALTER TABLE credit_accounts 
ADD CONSTRAINT credit_accounts_credit_report_id_fkey 
FOREIGN KEY (credit_report_id) REFERENCES credit_reports(id) ON DELETE CASCADE;

-- Add new columns to negative_items for better tracking
ALTER TABLE negative_items 
ADD COLUMN IF NOT EXISTS date_of_first_delinquency DATE,
ADD COLUMN IF NOT EXISTS account_number_last_4 VARCHAR(4),
ADD COLUMN IF NOT EXISTS credit_report_id VARCHAR(36);

-- Update foreign key reference in negative_items
UPDATE negative_items SET credit_report_id = report_id::VARCHAR WHERE credit_report_id IS NULL;
ALTER TABLE negative_items DROP CONSTRAINT IF EXISTS negative_items_report_id_fkey;
ALTER TABLE negative_items 
ADD CONSTRAINT negative_items_credit_report_id_fkey 
FOREIGN KEY (credit_report_id) REFERENCES credit_reports(id) ON DELETE CASCADE;

-- Add new columns to credit_inquiries for enhanced data
ALTER TABLE credit_inquiries 
ADD COLUMN IF NOT EXISTS purpose VARCHAR(255),
ADD COLUMN IF NOT EXISTS credit_report_id VARCHAR(36);

-- Update foreign key reference in credit_inquiries
UPDATE credit_inquiries SET credit_report_id = report_id::VARCHAR WHERE credit_report_id IS NULL;
ALTER TABLE credit_inquiries DROP CONSTRAINT IF EXISTS credit_inquiries_report_id_fkey;
ALTER TABLE credit_inquiries 
ADD CONSTRAINT credit_inquiries_credit_report_id_fkey 
FOREIGN KEY (credit_report_id) REFERENCES credit_reports(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_credit_reports_user_id ON credit_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_reports_bureau_detected ON credit_reports(bureau_detected);
CREATE INDEX IF NOT EXISTS idx_credit_reports_processing_status ON credit_reports(processing_status);
CREATE INDEX IF NOT EXISTS idx_credit_accounts_credit_report_id ON credit_accounts(credit_report_id);
CREATE INDEX IF NOT EXISTS idx_negative_items_credit_report_id ON negative_items(credit_report_id);
CREATE INDEX IF NOT EXISTS idx_credit_inquiries_credit_report_id ON credit_inquiries(credit_report_id);

-- Create a view for easy access to complete credit report data
CREATE OR REPLACE VIEW credit_report_summary AS
SELECT 
    cr.id,
    cr.user_id,
    cr.file_name,
    cr.bureau_detected,
    cr.experian_score,
    cr.equifax_score,
    cr.transunion_score,
    cr.primary_score,
    cr.score_model,
    cr.report_date,
    cr.confidence_score,
    cr.has_personal_info,
    cr.has_accounts,
    cr.has_payment_history,
    cr.has_inquiries,
    cr.has_negative_items,
    cr.processing_status,
    cr.upload_date,
    COUNT(DISTINCT ca.id) as total_accounts,
    COUNT(DISTINCT CASE WHEN ca.account_status = 'open' THEN ca.id END) as open_accounts,
    COUNT(DISTINCT ni.id) as negative_items_count,
    COUNT(DISTINCT ci.id) as inquiries_count,
    COALESCE(SUM(ca.balance), 0) as total_debt,
    COALESCE(SUM(ca.credit_limit), 0) as total_available_credit,
    CASE 
        WHEN SUM(ca.credit_limit) > 0 THEN 
            ROUND((SUM(ca.balance) / SUM(ca.credit_limit) * 100)::NUMERIC, 2)
        ELSE NULL 
    END as credit_utilization
FROM credit_reports cr
LEFT JOIN credit_accounts ca ON cr.id = ca.credit_report_id
LEFT JOIN negative_items ni ON cr.id = ni.credit_report_id
LEFT JOIN credit_inquiries ci ON cr.id = ci.credit_report_id
GROUP BY cr.id, cr.user_id, cr.file_name, cr.bureau_detected, cr.experian_score, 
         cr.equifax_score, cr.transunion_score, cr.primary_score, cr.score_model,
         cr.report_date, cr.confidence_score, cr.has_personal_info, cr.has_accounts,
         cr.has_payment_history, cr.has_inquiries, cr.has_negative_items, 
         cr.processing_status, cr.upload_date;

-- Update existing sample data to match new structure
UPDATE credit_reports 
SET 
    primary_score = credit_score,
    bureau_detected = LOWER(bureau),
    processing_status = 'completed',
    confidence_score = 0.8,
    has_accounts = TRUE,
    report_date = CURRENT_DATE
WHERE credit_score IS NOT NULL;

-- Verify the migration
SELECT 'Enhanced schema migration completed successfully!' as status;

-- Show the updated table structures
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('credit_reports', 'credit_accounts', 'credit_inquiries', 'negative_items')
ORDER BY table_name, ordinal_position;
