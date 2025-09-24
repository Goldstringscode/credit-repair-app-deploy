-- Add missing columns to certified_mail_tracking table
-- This script adds the processing_status and payment_status columns

-- Add processing_status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'certified_mail_tracking' 
        AND column_name = 'processing_status'
    ) THEN
        ALTER TABLE certified_mail_tracking 
        ADD COLUMN processing_status VARCHAR(50) DEFAULT 'pending';
    END IF;
END $$;

-- Add payment_status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'certified_mail_tracking' 
        AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE certified_mail_tracking 
        ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending';
    END IF;
END $$;

-- Add other missing columns that might be needed
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'certified_mail_tracking' 
        AND column_name = 'recipient_company'
    ) THEN
        ALTER TABLE certified_mail_tracking 
        ADD COLUMN recipient_company VARCHAR(255);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'certified_mail_tracking' 
        AND column_name = 'sender_company'
    ) THEN
        ALTER TABLE certified_mail_tracking 
        ADD COLUMN sender_company VARCHAR(255);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'certified_mail_tracking' 
        AND column_name = 'letter_subject'
    ) THEN
        ALTER TABLE certified_mail_tracking 
        ADD COLUMN letter_subject TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'certified_mail_tracking' 
        AND column_name = 'letter_type'
    ) THEN
        ALTER TABLE certified_mail_tracking 
        ADD COLUMN letter_type VARCHAR(50);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'certified_mail_tracking' 
        AND column_name = 'letter_template_id'
    ) THEN
        ALTER TABLE certified_mail_tracking 
        ADD COLUMN letter_template_id UUID;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'certified_mail_tracking' 
        AND column_name = 'shipengine_label_id'
    ) THEN
        ALTER TABLE certified_mail_tracking 
        ADD COLUMN shipengine_label_id VARCHAR(255);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'certified_mail_tracking' 
        AND column_name = 'shipengine_tracking_id'
    ) THEN
        ALTER TABLE certified_mail_tracking 
        ADD COLUMN shipengine_tracking_id VARCHAR(255);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'certified_mail_tracking' 
        AND column_name = 'label_url'
    ) THEN
        ALTER TABLE certified_mail_tracking 
        ADD COLUMN label_url TEXT;
    END IF;
END $$;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'certified_mail_tracking' 
ORDER BY ordinal_position;
