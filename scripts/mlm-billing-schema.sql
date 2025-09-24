-- MLM Billing System Database Schema
-- This schema extends the existing MLM system with billing and payment functionality

-- MLM Users table (extends existing user system)
CREATE TABLE IF NOT EXISTS mlm_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mlm_code VARCHAR(50) UNIQUE NOT NULL,
    sponsor_id UUID REFERENCES mlm_users(id),
    rank VARCHAR(50) DEFAULT 'associate',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    subscription_id VARCHAR(255),
    subscription_status VARCHAR(50),
    plan_type VARCHAR(50) NOT NULL,
    commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.30,
    personal_volume DECIMAL(10,2) DEFAULT 0,
    team_volume DECIMAL(10,2) DEFAULT 0,
    total_earnings DECIMAL(12,2) DEFAULT 0,
    current_month_earnings DECIMAL(10,2) DEFAULT 0,
    lifetime_earnings DECIMAL(12,2) DEFAULT 0,
    active_downlines INTEGER DEFAULT 0,
    total_downlines INTEGER DEFAULT 0,
    qualified_legs INTEGER DEFAULT 0,
    autoship_active BOOLEAN DEFAULT false,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MLM Genealogy table (tracks sponsor relationships)
CREATE TABLE IF NOT EXISTS mlm_genealogy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sponsor_id UUID REFERENCES mlm_users(id),
    upline_id UUID REFERENCES mlm_users(id),
    level INTEGER NOT NULL DEFAULT 1,
    position VARCHAR(10),
    matrix_position INTEGER,
    binary_leg VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MLM Payments table (tracks all payments)
CREATE TABLE IF NOT EXISTS mlm_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_payment_intent_id VARCHAR(255),
    stripe_invoice_id VARCHAR(255),
    amount INTEGER NOT NULL, -- Amount in cents
    currency VARCHAR(3) DEFAULT 'usd',
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    plan_type VARCHAR(50) NOT NULL,
    payment_type VARCHAR(20) DEFAULT 'subscription' CHECK (payment_type IN ('subscription', 'commission', 'bonus', 'payout')),
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MLM Commissions table (tracks commission earnings)
CREATE TABLE IF NOT EXISTS mlm_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_user_id UUID REFERENCES users(id),
    source_order_id VARCHAR(255),
    commission_type VARCHAR(50) NOT NULL CHECK (commission_type IN (
        'direct_referral', 'unilevel', 'binary', 'matrix', 'matching_bonus',
        'rank_advancement', 'leadership_bonus', 'fast_start', 'infinity_bonus'
    )),
    amount DECIMAL(10,2) NOT NULL,
    percentage DECIMAL(5,4) NOT NULL,
    level INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    payout_date TIMESTAMP WITH TIME ZONE,
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MLM Payouts table (tracks commission payouts)
CREATE TABLE IF NOT EXISTS mlm_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'usd',
    payout_method VARCHAR(50) NOT NULL CHECK (payout_method IN ('bank_transfer', 'paypal', 'check')),
    payout_details JSONB,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    stripe_payout_id VARCHAR(255),
    bank_account_id VARCHAR(255),
    commission_ids UUID[],
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MLM Payment Methods table (stores user payment methods)
CREATE TABLE IF NOT EXISTS mlm_payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_payment_method_id VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('card', 'bank', 'paypal')),
    card_details JSONB,
    bank_details JSONB,
    paypal_details JSONB,
    is_default BOOLEAN DEFAULT false,
    is_mlm_approved BOOLEAN DEFAULT true,
    payout_eligible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MLM Ranks table (defines rank requirements and benefits)
CREATE TABLE IF NOT EXISTS mlm_ranks (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    level INTEGER NOT NULL,
    personal_volume_required DECIMAL(10,2) DEFAULT 0,
    team_volume_required DECIMAL(10,2) DEFAULT 0,
    active_downlines_required INTEGER DEFAULT 0,
    qualified_legs_required INTEGER DEFAULT 0,
    time_in_rank_months INTEGER DEFAULT 0,
    commission_rate DECIMAL(5,4) NOT NULL,
    max_levels INTEGER DEFAULT 10,
    color VARCHAR(7),
    icon VARCHAR(50),
    benefits JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MLM Plans table (defines subscription plans)
CREATE TABLE IF NOT EXISTS mlm_plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL, -- Price in cents
    currency VARCHAR(3) DEFAULT 'usd',
    interval VARCHAR(20) DEFAULT 'month' CHECK (interval IN ('month', 'year')),
    features JSONB,
    mlm_benefits JSONB,
    commission_rate DECIMAL(5,4) NOT NULL,
    rank_requirement VARCHAR(50) REFERENCES mlm_ranks(id),
    stripe_product_id VARCHAR(255),
    stripe_price_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MLM Notifications table (for billing-related notifications)
CREATE TABLE IF NOT EXISTS mlm_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_mlm_users_user_id ON mlm_users(user_id);
CREATE INDEX IF NOT EXISTS idx_mlm_users_sponsor_id ON mlm_users(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_mlm_users_mlm_code ON mlm_users(mlm_code);
CREATE INDEX IF NOT EXISTS idx_mlm_users_status ON mlm_users(status);

CREATE INDEX IF NOT EXISTS idx_mlm_genealogy_user_id ON mlm_genealogy(user_id);
CREATE INDEX IF NOT EXISTS idx_mlm_genealogy_sponsor_id ON mlm_genealogy(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_mlm_genealogy_upline_id ON mlm_genealogy(upline_id);

CREATE INDEX IF NOT EXISTS idx_mlm_payments_user_id ON mlm_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_mlm_payments_status ON mlm_payments(status);
CREATE INDEX IF NOT EXISTS idx_mlm_payments_payment_date ON mlm_payments(payment_date);

CREATE INDEX IF NOT EXISTS idx_mlm_commissions_user_id ON mlm_commissions(user_id);
CREATE INDEX IF NOT EXISTS idx_mlm_commissions_source_user_id ON mlm_commissions(source_user_id);
CREATE INDEX IF NOT EXISTS idx_mlm_commissions_status ON mlm_commissions(status);
CREATE INDEX IF NOT EXISTS idx_mlm_commissions_created_at ON mlm_commissions(created_at);

CREATE INDEX IF NOT EXISTS idx_mlm_payouts_user_id ON mlm_payouts(user_id);
CREATE INDEX IF NOT EXISTS idx_mlm_payouts_status ON mlm_payouts(status);
CREATE INDEX IF NOT EXISTS idx_mlm_payouts_period ON mlm_payouts(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_mlm_payment_methods_user_id ON mlm_payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_mlm_payment_methods_is_default ON mlm_payment_methods(is_default);

CREATE INDEX IF NOT EXISTS idx_mlm_notifications_user_id ON mlm_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_mlm_notifications_is_read ON mlm_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_mlm_notifications_created_at ON mlm_notifications(created_at);

-- Insert default MLM ranks
INSERT INTO mlm_ranks (id, name, level, personal_volume_required, team_volume_required, active_downlines_required, qualified_legs_required, commission_rate, max_levels, color, icon) VALUES
('associate', 'Associate', 1, 0, 0, 0, 0, 0.30, 3, '#94A3B8', 'user'),
('consultant', 'Consultant', 2, 500, 1000, 2, 1, 0.35, 5, '#10B981', 'briefcase'),
('manager', 'Manager', 3, 1000, 5000, 5, 2, 0.40, 7, '#3B82F6', 'users'),
('director', 'Director', 4, 2000, 15000, 10, 3, 0.45, 10, '#8B5CF6', 'crown'),
('executive', 'Executive Director', 5, 3000, 50000, 25, 5, 0.50, 15, '#F59E0B', 'star'),
('presidential', 'Presidential Diamond', 6, 5000, 150000, 50, 8, 0.55, -1, '#EF4444', 'diamond')
ON CONFLICT (id) DO NOTHING;

-- Insert default MLM plans
INSERT INTO mlm_plans (id, name, description, price, currency, interval, commission_rate, rank_requirement, is_active) VALUES
('mlm_starter', 'MLM Starter', 'Perfect for new MLM members', 4999, 'usd', 'month', 0.30, 'associate', true),
('mlm_professional', 'MLM Professional', 'Advanced MLM features for serious builders', 9999, 'usd', 'month', 0.35, 'consultant', true),
('mlm_enterprise', 'MLM Enterprise', 'Complete MLM leadership solution', 19999, 'usd', 'month', 0.40, 'manager', true)
ON CONFLICT (id) DO NOTHING;

-- Functions for MLM billing calculations
CREATE OR REPLACE FUNCTION calculate_mlm_commission(
    p_user_id UUID,
    p_amount DECIMAL,
    p_commission_type VARCHAR(50)
) RETURNS DECIMAL AS $$
DECLARE
    v_commission_rate DECIMAL;
    v_commission_amount DECIMAL;
BEGIN
    -- Get user's commission rate
    SELECT commission_rate INTO v_commission_rate
    FROM mlm_users
    WHERE user_id = p_user_id AND status = 'active';
    
    IF v_commission_rate IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Calculate commission based on type
    CASE p_commission_type
        WHEN 'direct_referral' THEN
            v_commission_amount := p_amount * v_commission_rate;
        WHEN 'unilevel' THEN
            v_commission_amount := p_amount * (v_commission_rate * 0.1); -- 10% of direct rate
        ELSE
            v_commission_amount := p_amount * (v_commission_rate * 0.05); -- 5% for other types
    END CASE;
    
    RETURN v_commission_amount;
END;
$$ LANGUAGE plpgsql;

-- Function to update MLM user earnings
CREATE OR REPLACE FUNCTION update_mlm_earnings(
    p_user_id UUID,
    p_amount DECIMAL
) RETURNS VOID AS $$
BEGIN
    UPDATE mlm_users
    SET 
        total_earnings = total_earnings + p_amount,
        lifetime_earnings = lifetime_earnings + p_amount,
        current_month_earnings = current_month_earnings + p_amount,
        last_activity = NOW(),
        updated_at = NOW()
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check MLM rank advancement
CREATE OR REPLACE FUNCTION check_mlm_rank_advancement(
    p_user_id UUID
) RETURNS VARCHAR(50) AS $$
DECLARE
    v_current_rank VARCHAR(50);
    v_personal_volume DECIMAL;
    v_team_volume DECIMAL;
    v_active_downlines INTEGER;
    v_qualified_legs INTEGER;
    v_new_rank VARCHAR(50);
BEGIN
    -- Get current user data
    SELECT 
        rank,
        personal_volume,
        team_volume,
        active_downlines,
        qualified_legs
    INTO 
        v_current_rank,
        v_personal_volume,
        v_team_volume,
        v_active_downlines,
        v_qualified_legs
    FROM mlm_users
    WHERE user_id = p_user_id;
    
    -- Find next rank that user qualifies for
    SELECT id INTO v_new_rank
    FROM mlm_ranks
    WHERE level > (
        SELECT level FROM mlm_ranks WHERE id = v_current_rank
    )
    AND personal_volume_required <= v_personal_volume
    AND team_volume_required <= v_team_volume
    AND active_downlines_required <= v_active_downlines
    AND qualified_legs_required <= v_qualified_legs
    ORDER BY level ASC
    LIMIT 1;
    
    -- Update rank if advancement found
    IF v_new_rank IS NOT NULL THEN
        UPDATE mlm_users
        SET 
            rank = v_new_rank,
            commission_rate = (SELECT commission_rate FROM mlm_ranks WHERE id = v_new_rank),
            updated_at = NOW()
        WHERE user_id = p_user_id;
        
        -- Insert rank advancement commission
        INSERT INTO mlm_commissions (
            user_id,
            commission_type,
            amount,
            percentage,
            status
        ) VALUES (
            p_user_id,
            'rank_advancement',
            100.00, -- Fixed bonus for rank advancement
            0.00,
            'pending'
        );
    END IF;
    
    RETURN COALESCE(v_new_rank, v_current_rank);
END;
$$ LANGUAGE plpgsql;

-- MLM Payout Settings table
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
