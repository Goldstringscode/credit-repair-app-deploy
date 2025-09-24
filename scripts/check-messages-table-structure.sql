-- Check mlm_messages table structure
-- This script shows the actual column structure of the mlm_messages table

SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'mlm_messages' 
ORDER BY ordinal_position;

-- Also check if the columns exist
SELECT 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mlm_messages' AND column_name = 'is_flagged') 
         THEN 'EXISTS' ELSE 'MISSING' END as is_flagged_status,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mlm_messages' AND column_name = 'is_starred') 
         THEN 'EXISTS' ELSE 'MISSING' END as is_starred_status;
