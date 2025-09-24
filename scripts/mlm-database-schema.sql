-- MLM System Database Schema
-- Comprehensive schema for multi-level marketing system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. MLM Users Table
CREATE TABLE mlm_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sponsor_id UUID REFERENCES mlm_users(id) ON DELETE SET NULL,
    upline_id UUID REFERENCES mlm_users(id) ON DELETE SET NULL,
    mlm_code VARCHAR(20) UNIQUE NOT NULL,
    rank_id VARCHAR(50) NOT NULL DEFAULT 'associate',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    personal_volume DECIMAL(12,2) DEFAULT 0,
    team_volume DECIMAL(12,2) DEFAULT 0,
    total_earnings DECIMAL(12,2) DEFAULT 0,
    current_month_earnings DECIMAL(12,2) DEFAULT 0,
    lifetime_earnings DECIMAL(12,2) DEFAULT 0,
    active_downlines INTEGER DEFAULT 0,
    total_downlines INTEGER DEFAULT 0,
    qualified_legs INTEGER DEFAULT 0,
    autoship_active BOOLEAN DEFAULT false,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    next_rank_requirement JSONB,
    billing_info JSONB,
    tax_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. MLM Genealogy Table (Team Structure)
CREATE TABLE mlm_genealogy (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES mlm_users(id) ON DELETE CASCADE,
    sponsor_id UUID REFERENCES mlm_users(id) ON DELETE CASCADE,
    upline_id UUID REFERENCES mlm_users(id) ON DELETE CASCADE,
    level INTEGER NOT NULL DEFAULT 1,
    position VARCHAR(20) CHECK (position IN ('left', 'right', 'matrix_position')),
    matrix_position INTEGER,
    binary_leg VARCHAR(10) CHECK (binary_leg IN ('left', 'right')),
    is_active BOOLEAN DEFAULT true,
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. MLM Commissions Table
CREATE TABLE mlm_commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES mlm_users(id) ON DELETE CASCADE,
    from_user_id UUID REFERENCES mlm_users(id) ON DELETE CASCADE,
    commission_type VARCHAR(50) NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    amount DECIMAL(12,2) NOT NULL,
    percentage DECIMAL(5,4) NOT NULL,
    base_amount DECIMAL(12,2) NOT NULL,
    rank_bonus DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. MLM Payouts Table
CREATE TABLE mlm_payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES mlm_users(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payout_method VARCHAR(50) NOT NULL,
    payout_details JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    commission_ids UUID[] NOT NULL,
    stripe_payout_id VARCHAR(100),
    bank_account_id VARCHAR(100),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. MLM Ranks Table
CREATE TABLE mlm_ranks (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    level INTEGER NOT NULL UNIQUE,
    requirements JSONB NOT NULL,
    benefits JSONB NOT NULL,
    commission_rate DECIMAL(5,4) NOT NULL,
    bonus_eligibility TEXT[] NOT NULL,
    color VARCHAR(7) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. MLM Training Table
CREATE TABLE mlm_training (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES mlm_users(id) ON DELETE CASCADE,
    module_id VARCHAR(100) NOT NULL,
    module_title VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    level VARCHAR(20) NOT NULL,
    duration INTEGER NOT NULL, -- minutes
    completed BOOLEAN DEFAULT false,
    score DECIMAL(5,2),
    progress DECIMAL(5,2) DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    certificate_issued BOOLEAN DEFAULT false,
    certificate_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. MLM Marketing Table
CREATE TABLE mlm_marketing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES mlm_users(id) ON DELETE CASCADE,
    campaign_type VARCHAR(50) NOT NULL,
    campaign_name VARCHAR(200) NOT NULL,
    content JSONB NOT NULL,
    target_audience JSONB,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. MLM Analytics Table
CREATE TABLE mlm_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES mlm_users(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL,
    metric_value DECIMAL(12,2) NOT NULL,
    metric_data JSONB,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. MLM Audit Log Table
CREATE TABLE mlm_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES mlm_users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. MLM Notifications Table
CREATE TABLE mlm_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES mlm_users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_mlm_users_user_id ON mlm_users(user_id);
CREATE INDEX idx_mlm_users_sponsor_id ON mlm_users(sponsor_id);
CREATE INDEX idx_mlm_users_rank_id ON mlm_users(rank_id);
CREATE INDEX idx_mlm_users_status ON mlm_users(status);
CREATE INDEX idx_mlm_users_join_date ON mlm_users(join_date);

CREATE INDEX idx_mlm_genealogy_user_id ON mlm_genealogy(user_id);
CREATE INDEX idx_mlm_genealogy_sponsor_id ON mlm_genealogy(sponsor_id);
CREATE INDEX idx_mlm_genealogy_upline_id ON mlm_genealogy(upline_id);
CREATE INDEX idx_mlm_genealogy_level ON mlm_genealogy(level);
CREATE INDEX idx_mlm_genealogy_position ON mlm_genealogy(position);

CREATE INDEX idx_mlm_commissions_user_id ON mlm_commissions(user_id);
CREATE INDEX idx_mlm_commissions_from_user_id ON mlm_commissions(from_user_id);
CREATE INDEX idx_mlm_commissions_type ON mlm_commissions(commission_type);
CREATE INDEX idx_mlm_commissions_status ON mlm_commissions(status);
CREATE INDEX idx_mlm_commissions_period ON mlm_commissions(period_start, period_end);

CREATE INDEX idx_mlm_payouts_user_id ON mlm_payouts(user_id);
CREATE INDEX idx_mlm_payouts_status ON mlm_payouts(status);
CREATE INDEX idx_mlm_payouts_period ON mlm_payouts(period_start, period_end);

CREATE INDEX idx_mlm_training_user_id ON mlm_training(user_id);
CREATE INDEX idx_mlm_training_module_id ON mlm_training(module_id);
CREATE INDEX idx_mlm_training_completed ON mlm_training(completed);

CREATE INDEX idx_mlm_marketing_user_id ON mlm_marketing(user_id);
CREATE INDEX idx_mlm_marketing_type ON mlm_marketing(campaign_type);
CREATE INDEX idx_mlm_marketing_status ON mlm_marketing(status);

CREATE INDEX idx_mlm_analytics_user_id ON mlm_analytics(user_id);
CREATE INDEX idx_mlm_analytics_type ON mlm_analytics(metric_type);
CREATE INDEX idx_mlm_analytics_period ON mlm_analytics(period_start, period_end);

CREATE INDEX idx_mlm_audit_log_user_id ON mlm_audit_log(user_id);
CREATE INDEX idx_mlm_audit_log_action ON mlm_audit_log(action);
CREATE INDEX idx_mlm_audit_log_entity ON mlm_audit_log(entity_type, entity_id);
CREATE INDEX idx_mlm_audit_log_created_at ON mlm_audit_log(created_at);

CREATE INDEX idx_mlm_notifications_user_id ON mlm_notifications(user_id);
CREATE INDEX idx_mlm_notifications_read ON mlm_notifications(is_read);
CREATE INDEX idx_mlm_notifications_priority ON mlm_notifications(priority);

-- Triggers for Updated At
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_mlm_users_updated_at BEFORE UPDATE ON mlm_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert Default MLM Ranks
INSERT INTO mlm_ranks (id, name, level, requirements, benefits, commission_rate, bonus_eligibility, color, icon) VALUES
('associate', 'Associate', 1, 
 '{"personalVolume": 0, "teamVolume": 0, "activeDownlines": 0, "qualifiedLegs": 0}',
 '{"commissions": [{"type": "commission", "description": "Direct referral commission", "value": "30%"}], "perks": [{"type": "perk", "description": "Access to basic training", "value": "included"}]}',
 0.30, ARRAY['fast_start'], '#94A3B8', 'user'),

('consultant', 'Consultant', 2,
 '{"personalVolume": 500, "teamVolume": 1000, "activeDownlines": 2, "qualifiedLegs": 1}',
 '{"commissions": [{"type": "commission", "description": "Direct referral commission", "value": "35%"}, {"type": "commission", "description": "2-level unilevel", "value": "5%"}], "perks": [{"type": "perk", "description": "Marketing materials access", "value": "included"}]}',
 0.35, ARRAY['fast_start', 'matching_bonus'], '#10B981', 'briefcase'),

('manager', 'Manager', 3,
 '{"personalVolume": 1000, "teamVolume": 5000, "activeDownlines": 5, "qualifiedLegs": 2}',
 '{"commissions": [{"type": "commission", "description": "Direct referral commission", "value": "40%"}, {"type": "commission", "description": "4-level unilevel", "value": "5-10%"}], "bonuses": [{"type": "bonus", "description": "Leadership bonus", "value": 500}], "perks": [{"type": "perk", "description": "Custom landing pages", "value": "included"}]}',
 0.40, ARRAY['fast_start', 'matching_bonus', 'leadership_bonus'], '#3B82F6', 'users'),

('director', 'Director', 4,
 '{"personalVolume": 2500, "teamVolume": 15000, "activeDownlines": 10, "qualifiedLegs": 3}',
 '{"commissions": [{"type": "commission", "description": "Direct referral commission", "value": "45%"}, {"type": "commission", "description": "6-level unilevel", "value": "5-15%"}], "bonuses": [{"type": "bonus", "description": "Leadership bonus", "value": 1000}], "perks": [{"type": "perk", "description": "Advanced analytics", "value": "included"}]}',
 0.45, ARRAY['fast_start', 'matching_bonus', 'leadership_bonus'], '#8B5CF6', 'crown'),

('executive', 'Executive Director', 5,
 '{"personalVolume": 5000, "teamVolume": 50000, "activeDownlines": 20, "qualifiedLegs": 4}',
 '{"commissions": [{"type": "commission", "description": "Direct referral commission", "value": "50%"}, {"type": "commission", "description": "8-level unilevel", "value": "5-20%"}], "bonuses": [{"type": "bonus", "description": "Leadership bonus", "value": 2500}], "perks": [{"type": "perk", "description": "White-label options", "value": "included"}]}',
 0.50, ARRAY['fast_start', 'matching_bonus', 'leadership_bonus', 'infinity_bonus'], '#F59E0B', 'star'),

('presidential', 'Presidential Diamond', 6,
 '{"personalVolume": 10000, "teamVolume": 150000, "activeDownlines": 50, "qualifiedLegs": 5}',
 '{"commissions": [{"type": "commission", "description": "Direct referral commission", "value": "55%"}, {"type": "commission", "description": "Unlimited unilevel", "value": "5-25%"}], "bonuses": [{"type": "bonus", "description": "Leadership bonus", "value": 5000}], "perks": [{"type": "perk", "description": "All premium features", "value": "included"}]}',
 0.55, ARRAY['fast_start', 'matching_bonus', 'leadership_bonus', 'infinity_bonus'], '#EF4444', 'diamond');

-- Views for Common Queries
CREATE VIEW mlm_user_stats AS
SELECT 
    u.id,
    u.user_id,
    u.mlm_code,
    u.rank_id,
    r.name as rank_name,
    u.status,
    u.personal_volume,
    u.team_volume,
    u.total_earnings,
    u.current_month_earnings,
    u.lifetime_earnings,
    u.active_downlines,
    u.total_downlines,
    u.qualified_legs,
    u.join_date,
    u.last_activity
FROM mlm_users u
JOIN mlm_ranks r ON u.rank_id = r.id;

CREATE VIEW mlm_commission_summary AS
SELECT 
    user_id,
    commission_type,
    COUNT(*) as commission_count,
    SUM(amount) as total_amount,
    AVG(percentage) as avg_percentage,
    MIN(created_at) as first_commission,
    MAX(created_at) as last_commission
FROM mlm_commissions
WHERE status = 'paid'
GROUP BY user_id, commission_type;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;
