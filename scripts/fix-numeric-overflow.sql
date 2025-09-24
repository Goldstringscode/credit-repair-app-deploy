-- Fix numeric field overflow issues
-- Copy and paste this into Neon SQL Editor

-- Update credit_accounts table to handle larger numbers
ALTER TABLE credit_accounts 
ALTER COLUMN balance TYPE DECIMAL(15,2),
ALTER COLUMN credit_limit TYPE DECIMAL(15,2),
ALTER COLUMN original_amount TYPE DECIMAL(15,2),
ALTER COLUMN monthly_payment TYPE DECIMAL(12,2);

-- Update negative_items table to handle larger amounts
ALTER TABLE negative_items 
ALTER COLUMN amount TYPE DECIMAL(15,2);

-- Add constraints to prevent unreasonable values
ALTER TABLE credit_accounts 
ADD CONSTRAINT check_balance_reasonable CHECK (balance >= 0 AND balance <= 999999999.99),
ADD CONSTRAINT check_credit_limit_reasonable CHECK (credit_limit IS NULL OR (credit_limit >= 0 AND credit_limit <= 999999999.99));

ALTER TABLE negative_items
ADD CONSTRAINT check_amount_reasonable CHECK (amount IS NULL OR (amount >= 0 AND amount <= 999999999.99));

-- Show the updated schema
SELECT 
    table_name,
    column_name,
    data_type,
    numeric_precision,
    numeric_scale
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('credit_accounts', 'negative_items')
AND data_type LIKE '%numeric%'
ORDER BY table_name, column_name;

SELECT 'Numeric field overflow fix applied successfully!' as status;
