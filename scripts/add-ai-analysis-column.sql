-- Migration to add ai_analysis column to credit_reports table
-- Run this if you get "column ai_analysis does not exist" error

-- Add ai_analysis column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'credit_reports' 
        AND column_name = 'ai_analysis'
    ) THEN
        ALTER TABLE credit_reports ADD COLUMN ai_analysis JSONB;
        RAISE NOTICE 'Added ai_analysis column to credit_reports table';
    ELSE
        RAISE NOTICE 'ai_analysis column already exists';
    END IF;
END $$;

-- Add processed_data column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'credit_reports' 
        AND column_name = 'processed_data'
    ) THEN
        ALTER TABLE credit_reports ADD COLUMN processed_data JSONB;
        RAISE NOTICE 'Added processed_data column to credit_reports table';
    ELSE
        RAISE NOTICE 'processed_data column already exists';
    END IF;
END $$;

-- Add raw_text column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'credit_reports' 
        AND column_name = 'raw_text'
    ) THEN
        ALTER TABLE credit_reports ADD COLUMN raw_text TEXT;
        RAISE NOTICE 'Added raw_text column to credit_reports table';
    ELSE
        RAISE NOTICE 'raw_text column already exists';
    END IF;
END $$;

-- Verify the columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'credit_reports' 
AND column_name IN ('ai_analysis', 'processed_data', 'raw_text')
ORDER BY column_name;
