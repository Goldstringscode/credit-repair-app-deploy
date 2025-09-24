-- Enhanced Notifications Table Schema for Credit Repair AI
-- This script enhances the existing notifications table to support the full notification system

-- First, let's check if the notifications table exists and enhance it
DO $$ 
BEGIN
    -- Check if notifications table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        -- Add missing columns to existing table
        ALTER TABLE notifications 
        ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
        ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'system',
        ADD COLUMN IF NOT EXISTS data JSONB,
        ADD COLUMN IF NOT EXISTS actions JSONB,
        ADD COLUMN IF NOT EXISTS template_id VARCHAR(100),
        ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP,
        ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS read_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS dismissed_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS analytics_id VARCHAR(100),
        ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(50) DEFAULT 'in_app',
        ADD COLUMN IF NOT EXISTS sound_enabled BOOLEAN DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS vibration_enabled BOOLEAN DEFAULT FALSE;
        
        -- Update the type column to support more notification types
        ALTER TABLE notifications 
        ALTER COLUMN type TYPE VARCHAR(50);
        
        -- Add constraints
        ALTER TABLE notifications 
        ADD CONSTRAINT chk_notification_type 
        CHECK (type IN ('credit_score', 'dispute', 'fcra', 'payment', 'alert', 'mail', 'info', 'success', 'warning', 'error', 'training', 'milestone', 'system'));
        
        ALTER TABLE notifications 
        ADD CONSTRAINT chk_delivery_method 
        CHECK (delivery_method IN ('in_app', 'push', 'email', 'sms'));
        
        RAISE NOTICE 'Enhanced existing notifications table with new columns';
    ELSE
        -- Create the enhanced notifications table from scratch
        CREATE TABLE notifications (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('credit_score', 'dispute', 'fcra', 'payment', 'alert', 'mail', 'info', 'success', 'warning', 'error', 'training', 'milestone', 'system')),
            priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
            category VARCHAR(50) DEFAULT 'system',
            read BOOLEAN DEFAULT FALSE,
            data JSONB,
            actions JSONB,
            template_id VARCHAR(100),
            scheduled_for TIMESTAMP,
            expires_at TIMESTAMP,
            read_at TIMESTAMP,
            clicked_at TIMESTAMP,
            dismissed_at TIMESTAMP,
            analytics_id VARCHAR(100),
            delivery_method VARCHAR(50) DEFAULT 'in_app' CHECK (delivery_method IN ('in_app', 'push', 'email', 'sms')),
            sound_enabled BOOLEAN DEFAULT TRUE,
            vibration_enabled BOOLEAN DEFAULT FALSE,
            action_url VARCHAR(500),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        RAISE NOTICE 'Created new enhanced notifications table';
    END IF;
END $$;

-- Create notification templates table
CREATE TABLE IF NOT EXISTS notification_templates (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    title_template TEXT NOT NULL,
    message_template TEXT NOT NULL,
    icon VARCHAR(50),
    actions JSONB,
    variables JSONB,
    sound VARCHAR(50),
    vibration BOOLEAN DEFAULT FALSE,
    auto_expire INTEGER, -- minutes
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    push_notifications JSONB DEFAULT '{"enabled": true, "types": ["credit_score", "dispute", "payment", "alert"]}',
    email_notifications JSONB DEFAULT '{"enabled": true, "types": ["payment", "alert", "system"]}',
    in_app_notifications JSONB DEFAULT '{"enabled": true, "types": ["all"]}',
    sms_notifications JSONB DEFAULT '{"enabled": false, "types": ["alert"]}',
    quiet_hours JSONB DEFAULT '{"enabled": false, "start": "22:00", "end": "08:00"}',
    sound_settings JSONB DEFAULT '{"enabled": true, "master_volume": 0.7, "categories": {}}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notification analytics table
CREATE TABLE IF NOT EXISTS notification_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'sent', 'delivered', 'read', 'clicked', 'dismissed'
    event_data JSONB,
    device_info JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create scheduled notifications table
CREATE TABLE IF NOT EXISTS scheduled_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    template_id VARCHAR(100) REFERENCES notification_templates(id),
    template_data JSONB,
    scheduled_for TIMESTAMP NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'failed', 'cancelled')),
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_for ON notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notification_analytics_notification_id ON notification_analytics(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_analytics_user_id ON notification_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_scheduled_for ON scheduled_notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_status ON scheduled_notifications(status);

-- Insert default notification templates
INSERT INTO notification_templates (id, name, description, category, type, priority, title_template, message_template, icon, actions, variables) VALUES
('welcome', 'Welcome Message', 'Welcome new users to the platform', 'system', 'info', 'medium', 'Welcome to Credit Repair AI! 🎉', 'Thank you for joining our platform. Let''s improve your credit score together!', '🎉', '[]', '[]'),
('credit-score-increase', 'Credit Score Increase', 'Notifies when credit score increases', 'credit', 'success', 'high', 'Credit Score Improved! 📈', 'Great news! Your {{bureau}} credit score has increased by {{points}} points to {{newScore}}!', '📈', '[{"label": "View Report", "action": "view_credit_report", "variant": "default"}]', '["bureau", "points", "newScore"]'),
('credit-score-decrease', 'Credit Score Decrease', 'Notifies when credit score decreases', 'credit', 'warning', 'medium', 'Credit Score Update 📉', 'Your {{bureau}} credit score has decreased by {{points}} points to {{newScore}}. Let''s work on improving it!', '📉', '[{"label": "View Report", "action": "view_credit_report", "variant": "default"}]', '["bureau", "points", "newScore"]'),
('dispute-submitted', 'Dispute Submitted', 'Confirms dispute submission', 'dispute', 'success', 'medium', 'Dispute Submitted! ⚖️', 'Your dispute for {{creditor}} has been submitted to {{bureau}}. Expected resolution: {{expectedResolution}}', '⚖️', '[{"label": "Track Dispute", "action": "view_dispute", "variant": "default"}]', '["creditor", "bureau", "expectedResolution"]'),
('dispute-resolved', 'Dispute Resolved', 'Notifies when dispute is resolved', 'dispute', 'success', 'high', 'Dispute Resolved! ✅', 'Great news! Your dispute for {{creditor}} has been resolved: {{resolution}}', '✅', '[{"label": "View Resolution", "action": "view_resolution", "variant": "default"}]', '["creditor", "resolution"]'),
('lesson-completed', 'Lesson Completed', 'Training lesson completion', 'training', 'success', 'medium', 'Lesson Completed! 🎓', 'Great job completing "{{lessonTitle}}" in {{courseTitle}}!{{#pointsEarned}} You earned {{pointsEarned}} points!{{/pointsEarned}}', '🎓', '[{"label": "View Progress", "action": "view_progress", "variant": "default"}]', '["lessonTitle", "courseTitle", "pointsEarned"]'),
('milestone-achieved', 'Milestone Achieved', 'Training milestone achievement', 'milestone', 'success', 'high', 'Milestone Achieved! 🏆', 'Congratulations! You''ve achieved: {{milestoneTitle}}. {{description}}', '🏆', '[{"label": "View Achievement", "action": "view_achievement", "variant": "default"}]', '["milestoneTitle", "description"]'),
('payment-success', 'Payment Success', 'Successful payment confirmation', 'payment', 'success', 'medium', 'Payment Successful! 💳', 'Your payment of ${{amount}} has been processed successfully. Thank you!', '💳', '[{"label": "View Receipt", "action": "view_receipt", "variant": "default"}]', '["amount"]'),
('payment-failed', 'Payment Failed', 'Payment failure notification', 'payment', 'error', 'high', 'Payment Failed ❌', 'Your payment of ${{amount}} could not be processed. Please update your payment method.', '❌', '[{"label": "Update Payment", "action": "update_payment", "variant": "default"}]', '["amount"]'),
('system-maintenance', 'System Maintenance', 'Scheduled maintenance notification', 'system', 'warning', 'medium', 'Scheduled Maintenance 🔧', 'System maintenance is scheduled for {{scheduledTime}} and will last approximately {{duration}}.', '🔧', '[]', '["scheduledTime", "duration"]')
ON CONFLICT (id) DO NOTHING;

-- Create trigger for updated_at on notifications
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at 
    BEFORE UPDATE ON notifications 
    FOR EACH ROW EXECUTE FUNCTION update_notifications_updated_at();

-- Create trigger for updated_at on notification_preferences
DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON notification_preferences;
CREATE TRIGGER update_notification_preferences_updated_at 
    BEFORE UPDATE ON notification_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_notifications_updated_at();

-- Create trigger for updated_at on notification_templates
DROP TRIGGER IF EXISTS update_notification_templates_updated_at ON notification_templates;
CREATE TRIGGER update_notification_templates_updated_at 
    BEFORE UPDATE ON notification_templates 
    FOR EACH ROW EXECUTE FUNCTION update_notifications_updated_at();

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON notification_templates TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON notification_preferences TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON notification_analytics TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON scheduled_notifications TO your_app_user;

COMMENT ON TABLE notifications IS 'Enhanced notifications table supporting the full notification system';
COMMENT ON TABLE notification_templates IS 'Templates for generating consistent notifications';
COMMENT ON TABLE notification_preferences IS 'User notification preferences and settings';
COMMENT ON TABLE notification_analytics IS 'Analytics and tracking data for notifications';
COMMENT ON TABLE scheduled_notifications IS 'Scheduled and delayed notifications';
