-- Credit Monitoring Database Schema
-- Production-ready database tables for credit monitoring system

-- Credit Scores Table
CREATE TABLE IF NOT EXISTS credit_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bureau VARCHAR(20) NOT NULL CHECK (bureau IN ('experian', 'equifax', 'transunion')),
    score INTEGER NOT NULL CHECK (score >= 300 AND score <= 850),
    score_type VARCHAR(20) NOT NULL DEFAULT 'fico',
    score_range_min INTEGER NOT NULL DEFAULT 300,
    score_range_max INTEGER NOT NULL DEFAULT 850,
    factors JSONB,
    request_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, bureau, created_at::DATE)
);

-- Credit Reports Table
CREATE TABLE IF NOT EXISTS credit_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bureau VARCHAR(20) NOT NULL CHECK (bureau IN ('experian', 'equifax', 'transunion')),
    report_id VARCHAR(100) NOT NULL,
    report_type VARCHAR(20) NOT NULL DEFAULT 'full',
    personal_info JSONB,
    accounts JSONB,
    inquiries JSONB,
    public_records JSONB,
    collections JSONB,
    summary JSONB,
    request_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, bureau, report_id)
);

-- Credit Alerts Table
CREATE TABLE IF NOT EXISTS credit_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bureau VARCHAR(20) NOT NULL CHECK (bureau IN ('experian', 'equifax', 'transunion', 'all')),
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    alert_data JSONB,
    action_required BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    action_taken BOOLEAN DEFAULT FALSE,
    action_taken_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit Monitoring Settings Table
CREATE TABLE IF NOT EXISTS credit_monitoring_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT TRUE,
    score_alerts_enabled BOOLEAN DEFAULT TRUE,
    score_alerts_threshold INTEGER DEFAULT 10,
    score_alerts_direction VARCHAR(10) DEFAULT 'both' CHECK (score_alerts_direction IN ('increase', 'decrease', 'both')),
    new_account_alerts BOOLEAN DEFAULT TRUE,
    inquiry_alerts BOOLEAN DEFAULT TRUE,
    payment_alerts BOOLEAN DEFAULT TRUE,
    balance_alerts_enabled BOOLEAN DEFAULT TRUE,
    balance_alerts_threshold INTEGER DEFAULT 1000,
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    push_notifications BOOLEAN DEFAULT TRUE,
    frequency VARCHAR(20) DEFAULT 'immediate' CHECK (frequency IN ('immediate', 'daily', 'weekly')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Credit Monitoring Sessions Table
CREATE TABLE IF NOT EXISTS credit_monitoring_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    last_check TIMESTAMP WITH TIME ZONE,
    next_check TIMESTAMP WITH TIME ZONE,
    settings_id UUID REFERENCES credit_monitoring_settings(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Credit Bureau API Logs Table
CREATE TABLE IF NOT EXISTS credit_bureau_api_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    bureau VARCHAR(20) NOT NULL,
    endpoint VARCHAR(100) NOT NULL,
    request_id VARCHAR(100) NOT NULL,
    request_data JSONB,
    response_data JSONB,
    status_code INTEGER,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    response_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit Score History Table (for tracking changes over time)
CREATE TABLE IF NOT EXISTS credit_score_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bureau VARCHAR(20) NOT NULL,
    score INTEGER NOT NULL,
    previous_score INTEGER,
    change_amount INTEGER GENERATED ALWAYS AS (score - COALESCE(previous_score, score)) STORED,
    change_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN previous_score IS NULL OR previous_score = 0 THEN 0
            ELSE ROUND(((score - previous_score)::DECIMAL / previous_score) * 100, 2)
        END
    ) STORED,
    factors JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit Monitoring Notifications Table
CREATE TABLE IF NOT EXISTS credit_monitoring_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    alert_id UUID REFERENCES credit_alerts(id) ON DELETE CASCADE,
    notification_type VARCHAR(20) NOT NULL CHECK (notification_type IN ('email', 'sms', 'push')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
    subject VARCHAR(255),
    message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_credit_scores_user_id ON credit_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_scores_bureau ON credit_scores(bureau);
CREATE INDEX IF NOT EXISTS idx_credit_scores_created_at ON credit_scores(created_at);
CREATE INDEX IF NOT EXISTS idx_credit_scores_user_bureau_date ON credit_scores(user_id, bureau, created_at);

CREATE INDEX IF NOT EXISTS idx_credit_reports_user_id ON credit_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_reports_bureau ON credit_reports(bureau);
CREATE INDEX IF NOT EXISTS idx_credit_reports_created_at ON credit_reports(created_at);

CREATE INDEX IF NOT EXISTS idx_credit_alerts_user_id ON credit_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_alerts_bureau ON credit_alerts(bureau);
CREATE INDEX IF NOT EXISTS idx_credit_alerts_alert_type ON credit_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_credit_alerts_severity ON credit_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_credit_alerts_created_at ON credit_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_credit_alerts_action_required ON credit_alerts(action_required) WHERE action_required = TRUE;

CREATE INDEX IF NOT EXISTS idx_credit_monitoring_settings_user_id ON credit_monitoring_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_credit_monitoring_sessions_user_id ON credit_monitoring_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_monitoring_sessions_active ON credit_monitoring_sessions(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_credit_bureau_api_logs_user_id ON credit_bureau_api_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_bureau_api_logs_bureau ON credit_bureau_api_logs(bureau);
CREATE INDEX IF NOT EXISTS idx_credit_bureau_api_logs_created_at ON credit_bureau_api_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_credit_bureau_api_logs_success ON credit_bureau_api_logs(success);

CREATE INDEX IF NOT EXISTS idx_credit_score_history_user_id ON credit_score_history(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_score_history_bureau ON credit_score_history(bureau);
CREATE INDEX IF NOT EXISTS idx_credit_score_history_created_at ON credit_score_history(created_at);

CREATE INDEX IF NOT EXISTS idx_credit_monitoring_notifications_user_id ON credit_monitoring_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_monitoring_notifications_status ON credit_monitoring_notifications(status);
CREATE INDEX IF NOT EXISTS idx_credit_monitoring_notifications_created_at ON credit_monitoring_notifications(created_at);

-- Triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_credit_scores_updated_at BEFORE UPDATE ON credit_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_credit_reports_updated_at BEFORE UPDATE ON credit_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_credit_alerts_updated_at BEFORE UPDATE ON credit_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_credit_monitoring_settings_updated_at BEFORE UPDATE ON credit_monitoring_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_credit_monitoring_sessions_updated_at BEFORE UPDATE ON credit_monitoring_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for common queries
CREATE OR REPLACE VIEW latest_credit_scores AS
SELECT DISTINCT ON (user_id, bureau)
    user_id,
    bureau,
    score,
    score_type,
    score_range_min,
    score_range_max,
    factors,
    created_at
FROM credit_scores
ORDER BY user_id, bureau, created_at DESC;

CREATE OR REPLACE VIEW active_credit_alerts AS
SELECT 
    ca.*,
    cms.is_active as monitoring_active
FROM credit_alerts ca
LEFT JOIN credit_monitoring_sessions cms ON ca.user_id = cms.user_id
WHERE ca.action_required = TRUE
    AND (cms.is_active = TRUE OR cms.is_active IS NULL);

CREATE OR REPLACE VIEW credit_score_trends AS
SELECT 
    user_id,
    bureau,
    score,
    previous_score,
    change_amount,
    change_percentage,
    created_at,
    LAG(score) OVER (PARTITION BY user_id, bureau ORDER BY created_at) as prev_score
FROM credit_score_history
ORDER BY user_id, bureau, created_at DESC;

-- Functions for common operations
CREATE OR REPLACE FUNCTION get_user_credit_scores(p_user_id UUID)
RETURNS TABLE (
    bureau VARCHAR(20),
    score INTEGER,
    score_type VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lcs.bureau,
        lcs.score,
        lcs.score_type,
        lcs.created_at
    FROM latest_credit_scores lcs
    WHERE lcs.user_id = p_user_id
    ORDER BY lcs.bureau;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_alerts(p_user_id UUID, p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
    id UUID,
    bureau VARCHAR(20),
    alert_type VARCHAR(50),
    severity VARCHAR(20),
    title VARCHAR(255),
    description TEXT,
    action_required BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ca.id,
        ca.bureau,
        ca.alert_type,
        ca.severity,
        ca.title,
        ca.description,
        ca.action_required,
        ca.created_at
    FROM credit_alerts ca
    WHERE ca.user_id = p_user_id
    ORDER BY ca.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Insert default monitoring settings for existing users
INSERT INTO credit_monitoring_settings (user_id, enabled, score_alerts_enabled, score_alerts_threshold, score_alerts_direction, new_account_alerts, inquiry_alerts, payment_alerts, balance_alerts_enabled, balance_alerts_threshold, email_notifications, sms_notifications, push_notifications, frequency)
SELECT 
    id as user_id,
    TRUE as enabled,
    TRUE as score_alerts_enabled,
    10 as score_alerts_threshold,
    'both' as score_alerts_direction,
    TRUE as new_account_alerts,
    TRUE as inquiry_alerts,
    TRUE as payment_alerts,
    TRUE as balance_alerts_enabled,
    1000 as balance_alerts_threshold,
    TRUE as email_notifications,
    FALSE as sms_notifications,
    TRUE as push_notifications,
    'immediate' as frequency
FROM users
WHERE id NOT IN (SELECT user_id FROM credit_monitoring_settings);

-- Insert monitoring sessions for existing users
INSERT INTO credit_monitoring_sessions (user_id, is_active, last_check, next_check, settings_id)
SELECT 
    u.id as user_id,
    TRUE as is_active,
    NOW() as last_check,
    NOW() + INTERVAL '5 minutes' as next_check,
    cms.id as settings_id
FROM users u
LEFT JOIN credit_monitoring_settings cms ON u.id = cms.user_id
WHERE u.id NOT IN (SELECT user_id FROM credit_monitoring_sessions);
