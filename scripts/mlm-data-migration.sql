-- MLM System Data Migration Script
-- This script migrates existing user data to the MLM system

-- 1. Create MLM users from existing users
INSERT INTO mlm_users (
    user_id,
    sponsor_id,
    upline_id,
    mlm_code,
    rank_id,
    status,
    join_date,
    personal_volume,
    team_volume,
    total_earnings,
    current_month_earnings,
    lifetime_earnings,
    active_downlines,
    total_downlines,
    qualified_legs,
    autoship_active,
    last_activity,
    billing_info,
    tax_info
)
SELECT 
    u.id as user_id,
    NULL as sponsor_id, -- Will be updated later
    NULL as upline_id,  -- Will be updated later
    'CR' || LPAD(EXTRACT(EPOCH FROM u.created_at)::text, 10, '0') as mlm_code,
    'associate' as rank_id,
    CASE 
        WHEN u.status = 'active' THEN 'active'
        WHEN u.status = 'inactive' THEN 'inactive'
        ELSE 'pending'
    END as status,
    u.created_at as join_date,
    COALESCE((
        SELECT SUM(amount) 
        FROM transactions t 
        WHERE t.user_id = u.id 
        AND t.type = 'sale'
        AND t.status = 'completed'
    ), 0) as personal_volume,
    0 as team_volume, -- Will be calculated later
    COALESCE((
        SELECT SUM(amount) 
        FROM transactions t 
        WHERE t.user_id = u.id 
        AND t.type = 'commission'
        AND t.status = 'completed'
    ), 0) as total_earnings,
    COALESCE((
        SELECT SUM(amount) 
        FROM transactions t 
        WHERE t.user_id = u.id 
        AND t.type = 'commission'
        AND t.status = 'completed'
        AND t.created_at >= DATE_TRUNC('month', CURRENT_DATE)
    ), 0) as current_month_earnings,
    COALESCE((
        SELECT SUM(amount) 
        FROM transactions t 
        WHERE t.user_id = u.id 
        AND t.type = 'commission'
        AND t.status = 'completed'
    ), 0) as lifetime_earnings,
    0 as active_downlines, -- Will be calculated later
    0 as total_downlines,  -- Will be calculated later
    0 as qualified_legs,   -- Will be calculated later
    false as autoship_active,
    u.updated_at as last_activity,
    COALESCE(u.billing_info, '{}') as billing_info,
    COALESCE(u.tax_info, '{}') as tax_info
FROM users u
WHERE u.id NOT IN (SELECT user_id FROM mlm_users);

-- 2. Create genealogy entries for existing referrals
INSERT INTO mlm_genealogy (
    user_id,
    sponsor_id,
    upline_id,
    level,
    position,
    matrix_position,
    binary_leg,
    is_active
)
SELECT 
    mu.id as user_id,
    sponsor_mu.id as sponsor_id,
    sponsor_mu.id as upline_id,
    1 as level,
    'left' as position, -- Default position
    NULL as matrix_position,
    'left' as binary_leg, -- Default leg
    true as is_active
FROM mlm_users mu
JOIN users u ON mu.user_id = u.id
JOIN users sponsor ON u.referred_by = sponsor.id
JOIN mlm_users sponsor_mu ON sponsor.id = sponsor_mu.user_id
WHERE u.referred_by IS NOT NULL;

-- 3. Create commission records from existing transactions
INSERT INTO mlm_commissions (
    user_id,
    from_user_id,
    commission_type,
    level,
    amount,
    percentage,
    base_amount,
    rank_bonus,
    total_amount,
    status,
    period_start,
    period_end,
    processed_at
)
SELECT 
    mu.id as user_id,
    from_mu.id as from_user_id,
    CASE 
        WHEN t.type = 'referral_commission' THEN 'direct_referral'
        WHEN t.type = 'unilevel_commission' THEN 'unilevel'
        WHEN t.type = 'binary_commission' THEN 'binary_left'
        ELSE 'direct_referral'
    END as commission_type,
    1 as level,
    t.amount as amount,
    0.30 as percentage, -- Default 30%
    t.amount / 0.30 as base_amount,
    0 as rank_bonus,
    t.amount as total_amount,
    CASE 
        WHEN t.status = 'completed' THEN 'paid'
        WHEN t.status = 'pending' THEN 'pending'
        ELSE 'cancelled'
    END as status,
    DATE_TRUNC('month', t.created_at) as period_start,
    (DATE_TRUNC('month', t.created_at) + INTERVAL '1 month' - INTERVAL '1 day') as period_end,
    CASE 
        WHEN t.status = 'completed' THEN t.updated_at
        ELSE NULL
    END as processed_at
FROM transactions t
JOIN mlm_users mu ON t.user_id = mu.user_id
LEFT JOIN users from_user ON t.from_user_id = from_user.id
LEFT JOIN mlm_users from_mu ON from_user.id = from_mu.user_id
WHERE t.type LIKE '%commission%';

-- 4. Create payout records from existing payouts
INSERT INTO mlm_payouts (
    user_id,
    amount,
    currency,
    payout_method,
    payout_details,
    status,
    period_start,
    period_end,
    commission_ids,
    processed_at
)
SELECT 
    mu.id as user_id,
    p.amount as amount,
    COALESCE(p.currency, 'USD') as currency,
    COALESCE(p.method, 'bank_account') as payout_method,
    COALESCE(p.details, '{}') as payout_details,
    CASE 
        WHEN p.status = 'completed' THEN 'completed'
        WHEN p.status = 'pending' THEN 'pending'
        WHEN p.status = 'failed' THEN 'failed'
        ELSE 'pending'
    END as status,
    p.created_at as period_start,
    p.created_at as period_end,
    ARRAY[]::uuid[] as commission_ids, -- Would need to link to actual commissions
    CASE 
        WHEN p.status = 'completed' THEN p.updated_at
        ELSE NULL
    END as processed_at
FROM payouts p
JOIN mlm_users mu ON p.user_id = mu.user_id;

-- 5. Create training records from existing course completions
INSERT INTO mlm_training (
    user_id,
    module_id,
    module_title,
    category,
    level,
    duration,
    completed,
    score,
    progress,
    started_at,
    completed_at,
    certificate_issued
)
SELECT 
    mu.id as user_id,
    c.id as module_id,
    c.title as module_title,
    COALESCE(c.category, 'general') as category,
    COALESCE(c.level, 'beginner') as level,
    COALESCE(c.duration, 60) as duration, -- Default 60 minutes
    pc.completed as completed,
    pc.score as score,
    CASE 
        WHEN pc.completed THEN 100
        ELSE COALESCE(pc.progress, 0)
    END as progress,
    pc.started_at as started_at,
    CASE 
        WHEN pc.completed THEN pc.completed_at
        ELSE NULL
    END as completed_at,
    COALESCE(pc.certificate_issued, false) as certificate_issued
FROM course_progress pc
JOIN courses c ON pc.course_id = c.id
JOIN mlm_users mu ON pc.user_id = mu.user_id;

-- 6. Create notifications from existing notifications
INSERT INTO mlm_notifications (
    user_id,
    type,
    title,
    message,
    data,
    is_read,
    priority
)
SELECT 
    mu.id as user_id,
    COALESCE(n.type, 'general') as type,
    n.title as title,
    n.message as message,
    COALESCE(n.data, '{}') as data,
    COALESCE(n.is_read, false) as is_read,
    COALESCE(n.priority, 'normal') as priority
FROM notifications n
JOIN mlm_users mu ON n.user_id = mu.user_id;

-- 7. Update team volumes and downline counts
UPDATE mlm_users 
SET team_volume = (
    WITH RECURSIVE team_tree AS (
        SELECT id, user_id, personal_volume
        FROM mlm_users 
        WHERE id = mlm_users.id
        
        UNION ALL
        
        SELECT u.id, u.user_id, u.personal_volume
        FROM mlm_users u
        JOIN team_tree tt ON u.sponsor_id = tt.id
    )
    SELECT COALESCE(SUM(personal_volume), 0)
    FROM team_tree
    WHERE id != mlm_users.id
),
active_downlines = (
    WITH RECURSIVE team_tree AS (
        SELECT id, user_id, status
        FROM mlm_users 
        WHERE id = mlm_users.id
        
        UNION ALL
        
        SELECT u.id, u.user_id, u.status
        FROM mlm_users u
        JOIN team_tree tt ON u.sponsor_id = tt.id
    )
    SELECT COUNT(*)
    FROM team_tree
    WHERE id != mlm_users.id AND status = 'active'
),
total_downlines = (
    WITH RECURSIVE team_tree AS (
        SELECT id, user_id
        FROM mlm_users 
        WHERE id = mlm_users.id
        
        UNION ALL
        
        SELECT u.id, u.user_id
        FROM mlm_users u
        JOIN team_tree tt ON u.sponsor_id = tt.id
    )
    SELECT COUNT(*)
    FROM team_tree
    WHERE id != mlm_users.id
);

-- 8. Update user ranks based on performance
UPDATE mlm_users 
SET rank_id = CASE 
    WHEN personal_volume >= 10000 AND team_volume >= 150000 AND active_downlines >= 50 THEN 'presidential'
    WHEN personal_volume >= 5000 AND team_volume >= 50000 AND active_downlines >= 20 THEN 'executive'
    WHEN personal_volume >= 2500 AND team_volume >= 15000 AND active_downlines >= 10 THEN 'director'
    WHEN personal_volume >= 1000 AND team_volume >= 5000 AND active_downlines >= 5 THEN 'manager'
    WHEN personal_volume >= 500 AND team_volume >= 1000 AND active_downlines >= 2 THEN 'consultant'
    ELSE 'associate'
END;

-- 9. Create analytics records
INSERT INTO mlm_analytics (
    user_id,
    metric_type,
    metric_value,
    metric_data,
    period_start,
    period_end
)
SELECT 
    mu.id as user_id,
    'personal_volume' as metric_type,
    mu.personal_volume as metric_value,
    '{"source": "migration"}' as metric_data,
    DATE_TRUNC('month', mu.join_date) as period_start,
    (DATE_TRUNC('month', mu.join_date) + INTERVAL '1 month' - INTERVAL '1 day') as period_end
FROM mlm_users mu
WHERE mu.personal_volume > 0

UNION ALL

SELECT 
    mu.id as user_id,
    'team_volume' as metric_type,
    mu.team_volume as metric_value,
    '{"source": "migration"}' as metric_data,
    DATE_TRUNC('month', mu.join_date) as period_start,
    (DATE_TRUNC('month', mu.join_date) + INTERVAL '1 month' - INTERVAL '1 day') as period_end
FROM mlm_users mu
WHERE mu.team_volume > 0

UNION ALL

SELECT 
    mu.id as user_id,
    'total_earnings' as metric_type,
    mu.total_earnings as metric_value,
    '{"source": "migration"}' as metric_data,
    DATE_TRUNC('month', mu.join_date) as period_start,
    (DATE_TRUNC('month', mu.join_date) + INTERVAL '1 month' - INTERVAL '1 day') as period_end
FROM mlm_users mu
WHERE mu.total_earnings > 0;

-- 10. Create audit log entries for migration
INSERT INTO mlm_audit_log (
    user_id,
    action,
    entity_type,
    entity_id,
    new_values,
    ip_address,
    user_agent
)
SELECT 
    mu.id as user_id,
    'data_migration' as action,
    'user' as entity_type,
    mu.user_id as entity_id,
    '{"migrated_at": "' || NOW()::text || '", "source": "existing_data"}' as new_values,
    '127.0.0.1' as ip_address,
    'MLM Migration Script' as user_agent
FROM mlm_users mu;

-- 11. Update last activity for all users
UPDATE mlm_users 
SET last_activity = GREATEST(
    COALESCE(last_activity, join_date),
    COALESCE((SELECT MAX(created_at) FROM mlm_commissions WHERE user_id = mlm_users.id), join_date),
    COALESCE((SELECT MAX(created_at) FROM mlm_payouts WHERE user_id = mlm_users.id), join_date),
    COALESCE((SELECT MAX(completed_at) FROM mlm_training WHERE user_id = mlm_users.id), join_date)
);

-- 12. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mlm_users_migration ON mlm_users(user_id);
CREATE INDEX IF NOT EXISTS idx_mlm_genealogy_migration ON mlm_genealogy(user_id, sponsor_id);
CREATE INDEX IF NOT EXISTS idx_mlm_commissions_migration ON mlm_commissions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_mlm_payouts_migration ON mlm_payouts(user_id, created_at);

-- 13. Update statistics
ANALYZE mlm_users;
ANALYZE mlm_genealogy;
ANALYZE mlm_commissions;
ANALYZE mlm_payouts;
ANALYZE mlm_training;
ANALYZE mlm_notifications;
ANALYZE mlm_analytics;

-- Migration completed
SELECT 
    'Migration completed successfully' as status,
    COUNT(*) as total_users_migrated
FROM mlm_users;
