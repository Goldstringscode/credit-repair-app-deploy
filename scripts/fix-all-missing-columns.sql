-- Fix all missing columns for credit repair app
-- Run this script in your Neon SQL Editor

-- First, let's check if tables exist and add missing columns
DO $$ 
BEGIN
    -- Add missing columns to credit_accounts table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'credit_accounts' AND column_name = 'account_number_last_4') THEN
        ALTER TABLE credit_accounts ADD COLUMN account_number_last_4 VARCHAR(4);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'credit_accounts' AND column_name = 'payment_history') THEN
        ALTER TABLE credit_accounts ADD COLUMN payment_history TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'credit_accounts' AND column_name = 'account_status') THEN
        ALTER TABLE credit_accounts ADD COLUMN account_status VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'credit_accounts' AND column_name = 'date_opened') THEN
        ALTER TABLE credit_accounts ADD COLUMN date_opened DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'credit_accounts' AND column_name = 'last_payment_date') THEN
        ALTER TABLE credit_accounts ADD COLUMN last_payment_date DATE;
    END IF;
    
    -- Add missing columns to credit_reports table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'credit_reports' AND column_name = 'ai_analysis') THEN
        ALTER TABLE credit_reports ADD COLUMN ai_analysis JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'credit_reports' AND column_name = 'processed_data') THEN
        ALTER TABLE credit_reports ADD COLUMN processed_data JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'credit_reports' AND column_name = 'raw_text') THEN
        ALTER TABLE credit_reports ADD COLUMN raw_text TEXT;
    END IF;
    
    -- Create credit_inquiries table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credit_inquiries') THEN
        CREATE TABLE credit_inquiries (
            id SERIAL PRIMARY KEY,
            report_id INTEGER REFERENCES credit_reports(id) ON DELETE CASCADE,
            creditor_name VARCHAR(255) NOT NULL,
            inquiry_date DATE NOT NULL,
            inquiry_type VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;
    
    -- Create negative_items table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'negative_items') THEN
        CREATE TABLE negative_items (
            id SERIAL PRIMARY KEY,
            report_id INTEGER REFERENCES credit_reports(id) ON DELETE CASCADE,
            item_type VARCHAR(100) NOT NULL,
            creditor_name VARCHAR(255) NOT NULL,
            amount DECIMAL(10,2),
            date_reported DATE,
            status VARCHAR(50) NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;
    
END $$;

-- Update existing data to populate new columns where possible
UPDATE credit_accounts 
SET account_number_last_4 = RIGHT(account_number, 4)
WHERE account_number_last_4 IS NULL AND account_number IS NOT NULL;

UPDATE credit_accounts 
SET payment_history = payment_status
WHERE payment_history IS NULL AND payment_status IS NOT NULL;

-- Verify the changes
SELECT 'credit_accounts columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'credit_accounts' 
ORDER BY ordinal_position;

SELECT 'credit_reports columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'credit_reports' 
ORDER BY ordinal_position;

SELECT 'Tables created:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('credit_inquiries', 'negative_items');
