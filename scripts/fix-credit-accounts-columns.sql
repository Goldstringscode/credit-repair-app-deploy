-- Add missing columns to credit_accounts table to match the enhanced upload API

-- Add missing columns to credit_accounts table
ALTER TABLE credit_accounts 
ADD COLUMN IF NOT EXISTS account_number_last_4 VARCHAR(4),
ADD COLUMN IF NOT EXISTS payment_history TEXT,
ADD COLUMN IF NOT EXISTS processing_status VARCHAR(50) DEFAULT 'completed';

-- Update credit_reports table to ensure it has the processing_status column
ALTER TABLE credit_reports 
ADD COLUMN IF NOT EXISTS processing_status VARCHAR(50) DEFAULT 'completed';

-- Create credit_inquiries table if it doesn't exist (needed for the enhanced analysis)
CREATE TABLE IF NOT EXISTS credit_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    credit_report_id UUID REFERENCES credit_reports(id) ON DELETE CASCADE,
    creditor_name VARCHAR(255) NOT NULL,
    inquiry_date DATE NOT NULL,
    inquiry_type VARCHAR(20) NOT NULL, -- 'hard' or 'soft'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update negative_items table to match the enhanced analysis structure
ALTER TABLE negative_items 
ADD COLUMN IF NOT EXISTS creditor_name VARCHAR(255);

-- Create index for the new inquiries table
CREATE INDEX IF NOT EXISTS idx_credit_inquiries_report_id ON credit_inquiries(credit_report_id);

-- Verify the updated structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('credit_accounts', 'credit_reports', 'credit_inquiries', 'negative_items')
ORDER BY table_name, ordinal_position;
