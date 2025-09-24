-- Fix Decimal Precision Issues
-- This script identifies and fixes any columns with DECIMAL(5,4) precision

-- First, let's check what columns exist with problematic precision
SELECT 
    table_name,
    column_name,
    data_type,
    numeric_precision,
    numeric_scale
FROM information_schema.columns 
WHERE data_type = 'numeric' 
AND numeric_precision = 5 
AND numeric_scale = 4;

-- If any columns are found, we'll need to alter them
-- For example, if there's a commission_rate column with DECIMAL(5,4):
-- ALTER TABLE table_name ALTER COLUMN column_name TYPE DECIMAL(7,2);

-- Let's also check for any other problematic precision combinations
SELECT 
    table_name,
    column_name,
    data_type,
    numeric_precision,
    numeric_scale
FROM information_schema.columns 
WHERE data_type = 'numeric' 
AND (numeric_precision - numeric_scale) < 2; -- This would cause overflow for values >= 10
