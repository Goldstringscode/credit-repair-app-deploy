-- Fix foreign key constraint error for credit repair app
-- Run this script in your Neon SQL Editor

-- First, let's safely create or update all tables
DO $$ 
BEGIN
    -- Ensure credit_reports table exists with correct structure
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credit_reports') THEN
        CREATE TABLE credit_reports (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            file_name VARCHAR(255) NOT NULL,
            file_size INTEGER NOT NULL,
            bureau VARCHAR(50) NOT NULL,
            upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            credit_score INTEGER,
            ai_analysis JSONB,
            processed_data JSONB,
            raw_text TEXT
        );
    ELSE
        -- Add missing columns to existing credit_reports table
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
    END IF;

    -- Ensure credit_accounts table exists with correct structure
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credit_accounts') THEN
        CREATE TABLE credit_accounts (
            id SERIAL PRIMARY KEY,
            report_id INTEGER,
            account_name VARCHAR(255) NOT NULL,
            account_number VARCHAR(255),
            account_number_last_4 VARCHAR(4),
            account_type VARCHAR(100) NOT NULL,
            balance DECIMAL(10,2) DEFAULT 0,
            credit_limit DECIMAL(10,2),
            payment_status VARCHAR(50),
            payment_history TEXT,
            account_status VARCHAR(50),
            date_opened DATE,
            last_payment_date DATE,
            creditor_name VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ELSE
        -- Add missing columns to existing credit_accounts table
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
    END IF;

    -- Drop existing tables with foreign key issues if they exist
    DROP TABLE IF EXISTS credit_inquiries CASCADE;
    DROP TABLE IF EXISTS negative_items CASCADE;
    
    -- Create credit_inquiries table with proper foreign key
    CREATE TABLE credit_inquiries (
        id SERIAL PRIMARY KEY,
        report_id INTEGER,
        creditor_name VARCHAR(255) NOT NULL,
        inquiry_date DATE NOT NULL,
        inquiry_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Create negative_items table with proper foreign key
    CREATE TABLE negative_items (
        id SERIAL PRIMARY KEY,
        report_id INTEGER,
        item_type VARCHAR(100) NOT NULL,
        creditor_name VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2),
        date_reported DATE,
        status VARCHAR(50) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
END $$;

-- Now add foreign key constraints safely
DO $$
BEGIN
    -- Add foreign key for credit_accounts if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'credit_accounts_report_id_fkey'
    ) THEN
        ALTER TABLE credit_accounts 
        ADD CONSTRAINT credit_accounts_report_id_fkey 
        FOREIGN KEY (report_id) REFERENCES credit_reports(id) ON DELETE CASCADE;
    END IF;
    
    -- Add foreign key for credit_inquiries
    ALTER TABLE credit_inquiries 
    ADD CONSTRAINT credit_inquiries_report_id_fkey 
    FOREIGN KEY (report_id) REFERENCES credit_reports(id) ON DELETE CASCADE;
    
    -- Add foreign key for negative_items
    ALTER TABLE negative_items 
    ADD CONSTRAINT negative_items_report_id_fkey 
    FOREIGN KEY (report_id) REFERENCES credit_reports(id) ON DELETE CASCADE;
    
END $$;

-- Update existing data to populate new columns where possible
UPDATE credit_accounts 
SET account_number_last_4 = RIGHT(account_number, 4)
WHERE account_number_last_4 IS NULL AND account_number IS NOT NULL;

UPDATE credit_accounts 
SET payment_history = payment_status
WHERE payment_history IS NULL AND payment_status IS NOT NULL;

-- Verify the changes
SELECT 'Migration completed successfully!' as status;

SELECT 'credit_reports columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'credit_reports' 
ORDER BY ordinal_position;

SELECT 'credit_accounts columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'credit_accounts' 
ORDER BY ordinal_position;

SELECT 'All tables:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('credit_reports', 'credit_accounts', 'credit_inquiries', 'negative_items')
ORDER BY table_name;
