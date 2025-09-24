-- MLM Communication & Messaging System - Fresh Schema
-- This schema handles existing objects gracefully

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing views and triggers if they exist to avoid conflicts
-- Fix any existing columns with problematic decimal precision
DO $$ 
DECLARE
    col_record RECORD;
BEGIN
    -- Check for columns with DECIMAL(5,4) precision that could cause overflow
    FOR col_record IN 
        SELECT table_name, column_name
        FROM information_schema.columns 
        WHERE data_type = 'numeric' 
        AND numeric_precision = 5 
        AND numeric_scale = 4
        AND table_schema = 'public'
    LOOP
        -- Alter the column to have better precision
        EXECUTE format('ALTER TABLE %I ALTER COLUMN %I TYPE DECIMAL(7,2)', 
                      col_record.table_name, col_record.column_name);
    END LOOP;
END $$;

-- Drop all views that might depend on MLM communication tables
DO $$ 
DECLARE
    view_name TEXT;
BEGIN
    -- Get all views that depend on our tables using the correct system tables
    FOR view_name IN 
        SELECT DISTINCT n.nspname||'.'||c.relname as full_name
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        JOIN pg_depend d ON d.objid = c.oid
        JOIN pg_class ref_c ON ref_c.oid = d.refobjid
        WHERE c.relkind = 'v'  -- views only
        AND n.nspname = 'public'
        AND ref_c.relname IN ('mlm_users', 'mlm_communication_channels', 'mlm_messages', 'mlm_communication_analytics', 'mlm_teams', 'mlm_direct_messages', 'mlm_communication_templates', 'mlm_communication_events', 'mlm_message_attachments', 'mlm_communication_permissions')
    LOOP
        EXECUTE 'DROP VIEW IF EXISTS ' || view_name || ' CASCADE';
    END LOOP;
    
    -- Also drop any views with MLM-related names
    FOR view_name IN 
        SELECT DISTINCT n.nspname||'.'||c.relname as full_name
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relkind = 'v'  -- views only
        AND n.nspname = 'public'
        AND (c.relname LIKE '%mlm%' OR c.relname LIKE '%communication%')
    LOOP
        EXECUTE 'DROP VIEW IF EXISTS ' || view_name || ' CASCADE';
    END LOOP;
END $$;

-- Drop existing triggers and functions if they exist
DROP TRIGGER IF EXISTS update_mlm_users_updated_at ON mlm_users;
DROP TRIGGER IF EXISTS update_mlm_teams_updated_at ON mlm_teams;
DROP TRIGGER IF EXISTS update_mlm_communication_channels_updated_at ON mlm_communication_channels;
DROP TRIGGER IF EXISTS update_mlm_messages_updated_at ON mlm_messages;
DROP TRIGGER IF EXISTS update_mlm_direct_messages_updated_at ON mlm_direct_messages;
DROP TRIGGER IF EXISTS update_mlm_communication_templates_updated_at ON mlm_communication_templates;
DROP TRIGGER IF EXISTS update_mlm_communication_analytics_updated_at ON mlm_communication_analytics;
DROP TRIGGER IF EXISTS update_mlm_communication_events_updated_at ON mlm_communication_events;
DROP TRIGGER IF EXISTS update_mlm_message_attachments_updated_at ON mlm_message_attachments;
DROP TRIGGER IF EXISTS update_mlm_communication_permissions_updated_at ON mlm_communication_permissions;

-- Check if the updated_at trigger function exists, if not create it
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create mlm_users table (if not exists)
CREATE TABLE IF NOT EXISTS mlm_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mlm_id VARCHAR(50) UNIQUE,
    rank VARCHAR(50) DEFAULT 'associate',
    status VARCHAR(20) DEFAULT 'active',
    personal_volume DECIMAL(10,2) DEFAULT 0.00,
    team_volume DECIMAL(10,2) DEFAULT 0.00,
    total_volume DECIMAL(10,2) DEFAULT 0.00,
    commission_rate DECIMAL(7,2) DEFAULT 0.00,
    sponsor_id UUID REFERENCES mlm_users(id),
    upline_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist (for existing tables)
DO $$ 
BEGIN
    -- Add mlm_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_users' AND column_name = 'mlm_id') THEN
        ALTER TABLE mlm_users ADD COLUMN mlm_id VARCHAR(50) UNIQUE;
    END IF;
    
    -- Add rank column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_users' AND column_name = 'rank') THEN
        ALTER TABLE mlm_users ADD COLUMN rank VARCHAR(50) DEFAULT 'associate';
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_users' AND column_name = 'status') THEN
        ALTER TABLE mlm_users ADD COLUMN status VARCHAR(20) DEFAULT 'active';
    END IF;
    
    -- Add personal_volume column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_users' AND column_name = 'personal_volume') THEN
        ALTER TABLE mlm_users ADD COLUMN personal_volume DECIMAL(10,2) DEFAULT 0.00;
    END IF;
    
    -- Add team_volume column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_users' AND column_name = 'team_volume') THEN
        ALTER TABLE mlm_users ADD COLUMN team_volume DECIMAL(10,2) DEFAULT 0.00;
    END IF;
    
    -- Add total_volume column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_users' AND column_name = 'total_volume') THEN
        ALTER TABLE mlm_users ADD COLUMN total_volume DECIMAL(10,2) DEFAULT 0.00;
    END IF;
    
    -- Add commission_rate column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_users' AND column_name = 'commission_rate') THEN
        ALTER TABLE mlm_users ADD COLUMN commission_rate DECIMAL(7,2) DEFAULT 0.00;
    END IF;
    
    -- Add sponsor_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_users' AND column_name = 'sponsor_id') THEN
        ALTER TABLE mlm_users ADD COLUMN sponsor_id UUID REFERENCES mlm_users(id);
    END IF;
    
    -- Add upline_path column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_users' AND column_name = 'upline_path') THEN
        ALTER TABLE mlm_users ADD COLUMN upline_path TEXT;
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_users' AND column_name = 'created_at') THEN
        ALTER TABLE mlm_users ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_users' AND column_name = 'updated_at') THEN
        ALTER TABLE mlm_users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create mlm_ranks table (if not exists)
CREATE TABLE IF NOT EXISTS mlm_ranks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    level INTEGER NOT NULL,
    min_personal_volume DECIMAL(10,2) DEFAULT 0.00,
    min_team_volume DECIMAL(10,2) DEFAULT 0.00,
    commission_rate DECIMAL(7,2) DEFAULT 0.00,
    benefits JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to mlm_ranks if they don't exist
DO $$ 
BEGIN
    -- Add name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_ranks' AND column_name = 'name') THEN
        ALTER TABLE mlm_ranks ADD COLUMN name VARCHAR(50);
        -- Add unique constraint separately
        ALTER TABLE mlm_ranks ADD CONSTRAINT mlm_ranks_name_unique UNIQUE (name);
        -- Set NOT NULL constraint
        ALTER TABLE mlm_ranks ALTER COLUMN name SET NOT NULL;
    END IF;
    
    -- Add level column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_ranks' AND column_name = 'level') THEN
        ALTER TABLE mlm_ranks ADD COLUMN level INTEGER NOT NULL;
    END IF;
    
    -- Add min_personal_volume column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_ranks' AND column_name = 'min_personal_volume') THEN
        ALTER TABLE mlm_ranks ADD COLUMN min_personal_volume DECIMAL(10,2) DEFAULT 0.00;
    END IF;
    
    -- Add min_team_volume column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_ranks' AND column_name = 'min_team_volume') THEN
        ALTER TABLE mlm_ranks ADD COLUMN min_team_volume DECIMAL(10,2) DEFAULT 0.00;
    END IF;
    
    -- Add commission_rate column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_ranks' AND column_name = 'commission_rate') THEN
        ALTER TABLE mlm_ranks ADD COLUMN commission_rate DECIMAL(7,2) DEFAULT 0.00;
    END IF;
    
    -- Add benefits column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_ranks' AND column_name = 'benefits') THEN
        ALTER TABLE mlm_ranks ADD COLUMN benefits JSONB DEFAULT '{}';
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_ranks' AND column_name = 'created_at') THEN
        ALTER TABLE mlm_ranks ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_ranks' AND column_name = 'updated_at') THEN
        ALTER TABLE mlm_ranks ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create mlm_teams table
CREATE TABLE IF NOT EXISTS mlm_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    leader_id UUID NOT NULL REFERENCES mlm_users(id) ON DELETE CASCADE,
    team_code VARCHAR(20) UNIQUE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mlm_communication_channels table
CREATE TABLE IF NOT EXISTS mlm_communication_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- 'team', 'global', 'direct', 'announcement', 'achievement', 'custom'
    scope VARCHAR(20) NOT NULL, -- 'global', 'team', 'direct'
    created_by UUID NOT NULL REFERENCES mlm_users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES mlm_teams(id) ON DELETE CASCADE,
    is_private BOOLEAN DEFAULT false,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to mlm_communication_channels if they don't exist
DO $$ 
BEGIN
    -- Add name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_channels' AND column_name = 'name') THEN
        ALTER TABLE mlm_communication_channels ADD COLUMN name VARCHAR(100) NOT NULL;
    END IF;
    
    -- Add description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_channels' AND column_name = 'description') THEN
        ALTER TABLE mlm_communication_channels ADD COLUMN description TEXT;
    END IF;
    
    -- Add type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_channels' AND column_name = 'type') THEN
        ALTER TABLE mlm_communication_channels ADD COLUMN type VARCHAR(50) NOT NULL;
    END IF;
    
    -- Add scope column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_channels' AND column_name = 'scope') THEN
        ALTER TABLE mlm_communication_channels ADD COLUMN scope VARCHAR(20) NOT NULL;
    END IF;
    
    -- Add created_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_channels' AND column_name = 'created_by') THEN
        ALTER TABLE mlm_communication_channels ADD COLUMN created_by UUID NOT NULL REFERENCES mlm_users(id) ON DELETE CASCADE;
    END IF;
    
    -- Add team_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_channels' AND column_name = 'team_id') THEN
        ALTER TABLE mlm_communication_channels ADD COLUMN team_id UUID REFERENCES mlm_teams(id) ON DELETE CASCADE;
    END IF;
    
    -- Add is_private column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_channels' AND column_name = 'is_private') THEN
        ALTER TABLE mlm_communication_channels ADD COLUMN is_private BOOLEAN DEFAULT false;
    END IF;
    
    -- Add settings column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_channels' AND column_name = 'settings') THEN
        ALTER TABLE mlm_communication_channels ADD COLUMN settings JSONB DEFAULT '{}';
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_channels' AND column_name = 'created_at') THEN
        ALTER TABLE mlm_communication_channels ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_channels' AND column_name = 'updated_at') THEN
        ALTER TABLE mlm_communication_channels ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create mlm_messages table
CREATE TABLE IF NOT EXISTS mlm_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES mlm_communication_channels(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES mlm_users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'image', 'file', 'announcement', 'achievement'
    priority VARCHAR(10) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    parent_id UUID REFERENCES mlm_messages(id) ON DELETE CASCADE,
    is_edited BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to mlm_messages if they don't exist
DO $$ 
BEGIN
    -- Add channel_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_messages' AND column_name = 'channel_id') THEN
        ALTER TABLE mlm_messages ADD COLUMN channel_id UUID NOT NULL REFERENCES mlm_communication_channels(id) ON DELETE CASCADE;
    END IF;
    
    -- Add sender_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_messages' AND column_name = 'sender_id') THEN
        ALTER TABLE mlm_messages ADD COLUMN sender_id UUID NOT NULL REFERENCES mlm_users(id) ON DELETE CASCADE;
    END IF;
    
    -- Add content column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_messages' AND column_name = 'content') THEN
        ALTER TABLE mlm_messages ADD COLUMN content TEXT NOT NULL;
    END IF;
    
    -- Add message_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_messages' AND column_name = 'message_type') THEN
        ALTER TABLE mlm_messages ADD COLUMN message_type VARCHAR(20) DEFAULT 'text';
    END IF;
    
    -- Add priority column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_messages' AND column_name = 'priority') THEN
        ALTER TABLE mlm_messages ADD COLUMN priority VARCHAR(10) DEFAULT 'normal';
    END IF;
    
    -- Add parent_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_messages' AND column_name = 'parent_id') THEN
        ALTER TABLE mlm_messages ADD COLUMN parent_id UUID REFERENCES mlm_messages(id) ON DELETE CASCADE;
    END IF;
    
    -- Add is_edited column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_messages' AND column_name = 'is_edited') THEN
        ALTER TABLE mlm_messages ADD COLUMN is_edited BOOLEAN DEFAULT false;
    END IF;
    
    -- Add is_deleted column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_messages' AND column_name = 'is_deleted') THEN
        ALTER TABLE mlm_messages ADD COLUMN is_deleted BOOLEAN DEFAULT false;
    END IF;
    
    -- Add metadata column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_messages' AND column_name = 'metadata') THEN
        ALTER TABLE mlm_messages ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_messages' AND column_name = 'created_at') THEN
        ALTER TABLE mlm_messages ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_messages' AND column_name = 'updated_at') THEN
        ALTER TABLE mlm_messages ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create mlm_message_reactions table
CREATE TABLE IF NOT EXISTS mlm_message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES mlm_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES mlm_users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL, -- 'like', 'love', 'laugh', 'wow', 'sad', 'angry', 'custom'
    custom_emoji VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id, reaction_type)
);

-- Create mlm_message_reads table
CREATE TABLE IF NOT EXISTS mlm_message_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES mlm_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES mlm_users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- Create mlm_channel_members table
CREATE TABLE IF NOT EXISTS mlm_channel_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES mlm_communication_channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES mlm_users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member', -- 'admin', 'moderator', 'member'
    notification_settings JSONB DEFAULT '{}',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(channel_id, user_id)
);

-- Create mlm_direct_messages table
CREATE TABLE IF NOT EXISTS mlm_direct_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES mlm_users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES mlm_users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sender_id, recipient_id, created_at)
);

-- Create mlm_communication_templates table
CREATE TABLE IF NOT EXISTS mlm_communication_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'welcome', 'announcement', 'achievement', 'reminder', 'custom'
    subject VARCHAR(200),
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]', -- Array of variable names that can be replaced
    created_by UUID NOT NULL REFERENCES mlm_users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to mlm_communication_templates if they don't exist
DO $$ 
BEGIN
    -- Add name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_templates' AND column_name = 'name') THEN
        ALTER TABLE mlm_communication_templates ADD COLUMN name VARCHAR(100);
        -- Add unique constraint separately
        ALTER TABLE mlm_communication_templates ADD CONSTRAINT mlm_communication_templates_name_unique UNIQUE (name);
        -- Set NOT NULL constraint
        ALTER TABLE mlm_communication_templates ALTER COLUMN name SET NOT NULL;
    END IF;
    
    -- Add category column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_templates' AND column_name = 'category') THEN
        ALTER TABLE mlm_communication_templates ADD COLUMN category VARCHAR(50) NOT NULL;
    END IF;
    
    -- Add subject column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_templates' AND column_name = 'subject') THEN
        ALTER TABLE mlm_communication_templates ADD COLUMN subject VARCHAR(200);
    END IF;
    
    -- Add content column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_templates' AND column_name = 'content') THEN
        ALTER TABLE mlm_communication_templates ADD COLUMN content TEXT NOT NULL;
    END IF;
    
    -- Add variables column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_templates' AND column_name = 'variables') THEN
        ALTER TABLE mlm_communication_templates ADD COLUMN variables JSONB DEFAULT '[]';
    END IF;
    
    -- Add created_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_templates' AND column_name = 'created_by') THEN
        ALTER TABLE mlm_communication_templates ADD COLUMN created_by UUID NOT NULL REFERENCES mlm_users(id) ON DELETE CASCADE;
    END IF;
    
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_templates' AND column_name = 'is_active') THEN
        ALTER TABLE mlm_communication_templates ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- Add usage_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_templates' AND column_name = 'usage_count') THEN
        ALTER TABLE mlm_communication_templates ADD COLUMN usage_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add is_system column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_templates' AND column_name = 'is_system') THEN
        ALTER TABLE mlm_communication_templates ADD COLUMN is_system BOOLEAN DEFAULT false;
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_templates' AND column_name = 'created_at') THEN
        ALTER TABLE mlm_communication_templates ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_templates' AND column_name = 'updated_at') THEN
        ALTER TABLE mlm_communication_templates ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create mlm_communication_analytics table
CREATE TABLE IF NOT EXISTS mlm_communication_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES mlm_communication_channels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES mlm_users(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL, -- 'message_count', 'reaction_count', 'read_count', 'engagement_score'
    metric_value DECIMAL(10,2) NOT NULL,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to mlm_communication_analytics if they don't exist
DO $$ 
BEGIN
    -- Add channel_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_analytics' AND column_name = 'channel_id') THEN
        ALTER TABLE mlm_communication_analytics ADD COLUMN channel_id UUID REFERENCES mlm_communication_channels(id) ON DELETE CASCADE;
    END IF;
    
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_analytics' AND column_name = 'user_id') THEN
        ALTER TABLE mlm_communication_analytics ADD COLUMN user_id UUID REFERENCES mlm_users(id) ON DELETE CASCADE;
    END IF;
    
    -- Add metric_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_analytics' AND column_name = 'metric_type') THEN
        ALTER TABLE mlm_communication_analytics ADD COLUMN metric_type VARCHAR(50) NOT NULL;
    END IF;
    
    -- Add metric_value column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_analytics' AND column_name = 'metric_value') THEN
        ALTER TABLE mlm_communication_analytics ADD COLUMN metric_value DECIMAL(10,2) NOT NULL;
    END IF;
    
    -- Add period_start column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_analytics' AND column_name = 'period_start') THEN
        ALTER TABLE mlm_communication_analytics ADD COLUMN period_start TIMESTAMP WITH TIME ZONE NOT NULL;
    END IF;
    
    -- Add period_end column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_analytics' AND column_name = 'period_end') THEN
        ALTER TABLE mlm_communication_analytics ADD COLUMN period_end TIMESTAMP WITH TIME ZONE NOT NULL;
    END IF;
    
    -- Add metadata column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_analytics' AND column_name = 'metadata') THEN
        ALTER TABLE mlm_communication_analytics ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_analytics' AND column_name = 'created_at') THEN
        ALTER TABLE mlm_communication_analytics ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_analytics' AND column_name = 'updated_at') THEN
        ALTER TABLE mlm_communication_analytics ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create mlm_communication_events table
CREATE TABLE IF NOT EXISTS mlm_communication_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL, -- 'message_sent', 'reaction_added', 'channel_joined', 'user_mentioned'
    resource_type VARCHAR(50) NOT NULL, -- 'message', 'channel', 'user', 'team'
    resource_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES mlm_users(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES mlm_communication_channels(id) ON DELETE CASCADE,
    message_id UUID REFERENCES mlm_messages(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to mlm_communication_events if they don't exist
DO $$ 
BEGIN
    -- Add event_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_events' AND column_name = 'event_type') THEN
        ALTER TABLE mlm_communication_events ADD COLUMN event_type VARCHAR(50) NOT NULL;
    END IF;
    
    -- Add resource_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_events' AND column_name = 'resource_type') THEN
        ALTER TABLE mlm_communication_events ADD COLUMN resource_type VARCHAR(50) NOT NULL;
    END IF;
    
    -- Add resource_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_events' AND column_name = 'resource_id') THEN
        ALTER TABLE mlm_communication_events ADD COLUMN resource_id UUID NOT NULL;
    END IF;
    
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_events' AND column_name = 'user_id') THEN
        ALTER TABLE mlm_communication_events ADD COLUMN user_id UUID NOT NULL REFERENCES mlm_users(id) ON DELETE CASCADE;
    END IF;
    
    -- Add channel_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_events' AND column_name = 'channel_id') THEN
        ALTER TABLE mlm_communication_events ADD COLUMN channel_id UUID REFERENCES mlm_communication_channels(id) ON DELETE CASCADE;
    END IF;
    
    -- Add message_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_events' AND column_name = 'message_id') THEN
        ALTER TABLE mlm_communication_events ADD COLUMN message_id UUID REFERENCES mlm_messages(id) ON DELETE CASCADE;
    END IF;
    
    -- Add metadata column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_events' AND column_name = 'metadata') THEN
        ALTER TABLE mlm_communication_events ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_events' AND column_name = 'created_at') THEN
        ALTER TABLE mlm_communication_events ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create mlm_message_attachments table
CREATE TABLE IF NOT EXISTS mlm_message_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES mlm_messages(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to mlm_message_attachments if they don't exist
DO $$ 
BEGIN
    -- Add message_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_message_attachments' AND column_name = 'message_id') THEN
        ALTER TABLE mlm_message_attachments ADD COLUMN message_id UUID NOT NULL REFERENCES mlm_messages(id) ON DELETE CASCADE;
    END IF;
    
    -- Add file_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_message_attachments' AND column_name = 'file_name') THEN
        ALTER TABLE mlm_message_attachments ADD COLUMN file_name VARCHAR(255) NOT NULL;
    END IF;
    
    -- Add file_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_message_attachments' AND column_name = 'file_type') THEN
        ALTER TABLE mlm_message_attachments ADD COLUMN file_type VARCHAR(50) NOT NULL;
    END IF;
    
    -- Add file_size column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_message_attachments' AND column_name = 'file_size') THEN
        ALTER TABLE mlm_message_attachments ADD COLUMN file_size BIGINT NOT NULL;
    END IF;
    
    -- Add file_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_message_attachments' AND column_name = 'file_url') THEN
        ALTER TABLE mlm_message_attachments ADD COLUMN file_url TEXT NOT NULL;
    END IF;
    
    -- Add thumbnail_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_message_attachments' AND column_name = 'thumbnail_url') THEN
        ALTER TABLE mlm_message_attachments ADD COLUMN thumbnail_url TEXT;
    END IF;
    
    -- Add metadata column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_message_attachments' AND column_name = 'metadata') THEN
        ALTER TABLE mlm_message_attachments ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_message_attachments' AND column_name = 'created_at') THEN
        ALTER TABLE mlm_message_attachments ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create mlm_communication_permissions table
CREATE TABLE IF NOT EXISTS mlm_communication_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES mlm_users(id) ON DELETE CASCADE,
    permission_type VARCHAR(50) NOT NULL, -- 'can_send_messages', 'can_create_channels', 'can_manage_team', 'can_send_announcements'
    resource_type VARCHAR(50), -- 'global', 'team', 'channel'
    resource_id UUID, -- ID of the specific resource
    granted_by UUID REFERENCES mlm_users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to mlm_communication_permissions if they don't exist
DO $$ 
BEGIN
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_permissions' AND column_name = 'user_id') THEN
        ALTER TABLE mlm_communication_permissions ADD COLUMN user_id UUID NOT NULL REFERENCES mlm_users(id) ON DELETE CASCADE;
    END IF;
    
    -- Add permission_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_permissions' AND column_name = 'permission_type') THEN
        ALTER TABLE mlm_communication_permissions ADD COLUMN permission_type VARCHAR(50) NOT NULL;
    END IF;
    
    -- Add resource_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_permissions' AND column_name = 'resource_type') THEN
        ALTER TABLE mlm_communication_permissions ADD COLUMN resource_type VARCHAR(50);
    END IF;
    
    -- Add resource_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_permissions' AND column_name = 'resource_id') THEN
        ALTER TABLE mlm_communication_permissions ADD COLUMN resource_id UUID;
    END IF;
    
    -- Add granted_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_permissions' AND column_name = 'granted_by') THEN
        ALTER TABLE mlm_communication_permissions ADD COLUMN granted_by UUID REFERENCES mlm_users(id) ON DELETE CASCADE;
    END IF;
    
    -- Add expires_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_permissions' AND column_name = 'expires_at') THEN
        ALTER TABLE mlm_communication_permissions ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_permissions' AND column_name = 'created_at') THEN
        ALTER TABLE mlm_communication_permissions ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mlm_communication_permissions' AND column_name = 'updated_at') THEN
        ALTER TABLE mlm_communication_permissions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mlm_users_user_id ON mlm_users(user_id);
CREATE INDEX IF NOT EXISTS idx_mlm_users_mlm_id ON mlm_users(mlm_id);
CREATE INDEX IF NOT EXISTS idx_mlm_users_sponsor_id ON mlm_users(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_mlm_users_rank ON mlm_users(rank);
CREATE INDEX IF NOT EXISTS idx_mlm_users_status ON mlm_users(status);

CREATE INDEX IF NOT EXISTS idx_mlm_teams_leader_id ON mlm_teams(leader_id);
CREATE INDEX IF NOT EXISTS idx_mlm_teams_team_code ON mlm_teams(team_code);

CREATE INDEX IF NOT EXISTS idx_mlm_channels_type ON mlm_communication_channels(type);
CREATE INDEX IF NOT EXISTS idx_mlm_channels_scope ON mlm_communication_channels(scope);
CREATE INDEX IF NOT EXISTS idx_mlm_channels_team_id ON mlm_communication_channels(team_id);
CREATE INDEX IF NOT EXISTS idx_mlm_channels_created_by ON mlm_communication_channels(created_by);

CREATE INDEX IF NOT EXISTS idx_mlm_messages_channel_id ON mlm_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_mlm_messages_sender_id ON mlm_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_mlm_messages_created_at ON mlm_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_mlm_messages_parent_id ON mlm_messages(parent_id);
CREATE INDEX IF NOT EXISTS idx_mlm_messages_type ON mlm_messages(message_type);

CREATE INDEX IF NOT EXISTS idx_mlm_reactions_message_id ON mlm_message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_mlm_reactions_user_id ON mlm_message_reactions(user_id);

CREATE INDEX IF NOT EXISTS idx_mlm_reads_message_id ON mlm_message_reads(message_id);
CREATE INDEX IF NOT EXISTS idx_mlm_reads_user_id ON mlm_message_reads(user_id);

CREATE INDEX IF NOT EXISTS idx_mlm_channel_members_channel_id ON mlm_channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_mlm_channel_members_user_id ON mlm_channel_members(user_id);

CREATE INDEX IF NOT EXISTS idx_mlm_direct_messages_sender_id ON mlm_direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_mlm_direct_messages_recipient_id ON mlm_direct_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_mlm_direct_messages_created_at ON mlm_direct_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_mlm_templates_category ON mlm_communication_templates(category);
CREATE INDEX IF NOT EXISTS idx_mlm_templates_created_by ON mlm_communication_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_mlm_templates_is_active ON mlm_communication_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_mlm_analytics_channel_id ON mlm_communication_analytics(channel_id);
CREATE INDEX IF NOT EXISTS idx_mlm_analytics_user_id ON mlm_communication_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_mlm_analytics_metric_type ON mlm_communication_analytics(metric_type);
CREATE INDEX IF NOT EXISTS idx_mlm_analytics_period ON mlm_communication_analytics(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_mlm_events_event_type ON mlm_communication_events(event_type);
CREATE INDEX IF NOT EXISTS idx_mlm_events_user_id ON mlm_communication_events(user_id);
CREATE INDEX IF NOT EXISTS idx_mlm_events_channel_id ON mlm_communication_events(channel_id);
CREATE INDEX IF NOT EXISTS idx_mlm_events_created_at ON mlm_communication_events(created_at);

CREATE INDEX IF NOT EXISTS idx_mlm_attachments_message_id ON mlm_message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_mlm_attachments_file_type ON mlm_message_attachments(file_type);

CREATE INDEX IF NOT EXISTS idx_mlm_permissions_user_id ON mlm_communication_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_mlm_permissions_type ON mlm_communication_permissions(permission_type);
CREATE INDEX IF NOT EXISTS idx_mlm_permissions_resource ON mlm_communication_permissions(resource_type, resource_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_mlm_users_updated_at
    BEFORE UPDATE ON mlm_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mlm_teams_updated_at
    BEFORE UPDATE ON mlm_teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mlm_communication_channels_updated_at
    BEFORE UPDATE ON mlm_communication_channels
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mlm_messages_updated_at
    BEFORE UPDATE ON mlm_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mlm_direct_messages_updated_at
    BEFORE UPDATE ON mlm_direct_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mlm_communication_templates_updated_at
    BEFORE UPDATE ON mlm_communication_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mlm_communication_analytics_updated_at
    BEFORE UPDATE ON mlm_communication_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mlm_communication_events_updated_at
    BEFORE UPDATE ON mlm_communication_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mlm_message_attachments_updated_at
    BEFORE UPDATE ON mlm_message_attachments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mlm_communication_permissions_updated_at
    BEFORE UPDATE ON mlm_communication_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create views for common queries
CREATE OR REPLACE VIEW mlm_user_communication_stats AS
SELECT 
    u.id as user_id,
    u.mlm_id,
    u.rank,
    COUNT(DISTINCT m.id) as total_messages,
    COUNT(DISTINCT mr.id) as total_reactions,
    COUNT(DISTINCT cm.channel_id) as channels_joined,
    MAX(m.created_at) as last_message_at
FROM mlm_users u
LEFT JOIN mlm_messages m ON u.id = m.sender_id
LEFT JOIN mlm_message_reactions mr ON u.id = mr.user_id
LEFT JOIN mlm_channel_members cm ON u.id = cm.user_id
GROUP BY u.id, u.mlm_id, u.rank;

CREATE OR REPLACE VIEW mlm_channel_activity AS
SELECT 
    c.id as channel_id,
    c.name,
    c.type,
    c.scope,
    COUNT(DISTINCT m.id) as message_count,
    COUNT(DISTINCT cm.user_id) as member_count,
    MAX(m.created_at) as last_activity_at
FROM mlm_communication_channels c
LEFT JOIN mlm_messages m ON c.id = m.channel_id
LEFT JOIN mlm_channel_members cm ON c.id = cm.channel_id
GROUP BY c.id, c.name, c.type, c.scope;

-- Insert default MLM ranks (only if table exists and has proper constraints)
DO $$ 
BEGIN
    -- Check if the table exists and has the name column with unique constraint
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mlm_ranks') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mlm_ranks' AND column_name = 'name')
       AND EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'mlm_ranks' AND constraint_type = 'UNIQUE' AND constraint_name LIKE '%name%') THEN
        
        INSERT INTO mlm_ranks (name, level, min_personal_volume, min_team_volume, commission_rate, benefits) VALUES
        ('Associate', 1, 0.00, 0.00, 5.00, '{"basic_training": true, "starter_kit": true}'),
        ('Bronze', 2, 100.00, 500.00, 10.00, '{"advanced_training": true, "marketing_materials": true}'),
        ('Silver', 3, 500.00, 2500.00, 15.00, '{"leadership_training": true, "bonus_commissions": true}'),
        ('Gold', 4, 1000.00, 10000.00, 20.00, '{"mentor_program": true, "exclusive_events": true}'),
        ('Platinum', 5, 2500.00, 25000.00, 25.00, '{"executive_training": true, "profit_sharing": true}'),
        ('Diamond', 6, 5000.00, 50000.00, 30.00, '{"master_training": true, "equity_sharing": true}'),
        ('Crown', 7, 10000.00, 100000.00, 35.00, '{"elite_status": true, "board_position": true}')
        ON CONFLICT (name) DO NOTHING;
    END IF;
END $$;

-- Insert default communication templates (only if tables exist and have proper constraints)
DO $$ 
DECLARE
    system_user_id UUID;
BEGIN
    -- Check if the templates table exists and has the name column with unique constraint
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mlm_communication_templates') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mlm_communication_templates' AND column_name = 'name')
       AND EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'mlm_communication_templates' AND constraint_type = 'UNIQUE' AND constraint_name LIKE '%name%') THEN
        
        -- Get the first available user ID, or create a system user if none exists
        SELECT id INTO system_user_id FROM mlm_users LIMIT 1;
        
        IF system_user_id IS NOT NULL THEN
            INSERT INTO mlm_communication_templates (name, category, subject, content, variables, created_by, is_system) VALUES
            ('Welcome New Team Member', 'welcome', 'Welcome to {{team_name}}!', 'Welcome {{member_name}}! 🎉 We''re excited to have you join {{team_name}}. Your sponsor {{sponsor_name}} will be your guide as you start your journey with us.', '["member_name", "team_name", "sponsor_name"]', system_user_id, true),
            ('Achievement Celebration', 'achievement', 'Congratulations on {{achievement_type}}!', 'Congratulations {{member_name}}! 🏆 You''ve achieved {{achievement_type}} and earned {{reward_amount}}. Keep up the amazing work!', '["member_name", "achievement_type", "reward_amount"]', system_user_id, true),
            ('Monthly Reminder', 'reminder', 'Monthly Check-in - {{month}}', 'Hi {{member_name}}, this is your monthly check-in for {{month}}. Your current rank is {{current_rank}} and you''re {{progress_percentage}}% towards your next goal!', '["member_name", "month", "current_rank", "progress_percentage"]', system_user_id, true)
            ON CONFLICT (name) DO NOTHING;
        END IF;
    END IF;
END $$;
