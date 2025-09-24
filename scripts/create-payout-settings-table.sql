-- Create MLM Payout Settings table
-- Run this script to create the payout settings table in your Supabase database

CREATE TABLE IF NOT EXISTS mlm_payout_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  minimum_payout_amount DECIMAL(10,2) NOT NULL DEFAULT 50.00,
  payout_schedule VARCHAR(20) NOT NULL DEFAULT 'monthly',
  payout_day INTEGER NOT NULL DEFAULT 1,
  payout_method VARCHAR(20) NOT NULL,
  payout_method_id VARCHAR(255) NOT NULL,
  tax_id VARCHAR(50),
  tax_id_type VARCHAR(10) DEFAULT 'ssn',
  business_name VARCHAR(255),
  address JSONB,
  notifications JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_mlm_payout_settings_user_id ON mlm_payout_settings(user_id);

-- Add comments for documentation
COMMENT ON TABLE mlm_payout_settings IS 'Stores MLM user payout configuration settings';
COMMENT ON COLUMN mlm_payout_settings.minimum_payout_amount IS 'Minimum amount before payout is processed';
COMMENT ON COLUMN mlm_payout_settings.payout_schedule IS 'How often payouts are processed (weekly, biweekly, monthly, quarterly)';
COMMENT ON COLUMN mlm_payout_settings.payout_day IS 'Day of the period when payout is processed';
COMMENT ON COLUMN mlm_payout_settings.payout_method IS 'Method used for payouts (card, bank, paypal)';
COMMENT ON COLUMN mlm_payout_settings.payout_method_id IS 'ID of the specific payment method to use';
COMMENT ON COLUMN mlm_payout_settings.tax_id IS 'Tax ID or SSN for compliance';
COMMENT ON COLUMN mlm_payout_settings.business_name IS 'Optional business name';
COMMENT ON COLUMN mlm_payout_settings.address IS 'Billing address as JSON';
COMMENT ON COLUMN mlm_payout_settings.notifications IS 'Notification preferences as JSON';
