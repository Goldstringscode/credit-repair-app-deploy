"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ExternalLink, Copy, Database, Mail, CreditCard, Key } from 'lucide-react'
import { useState } from "react"

export default function SetupGuidePage() {
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(label)
    setTimeout(() => setCopiedText(null), 2000)
  }

  const sqlSchema = `-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    date_of_birth DATE,
    ssn_last_four VARCHAR(4),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(10),
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    subscription_tier VARCHAR(50) DEFAULT 'free',
    subscription_status VARCHAR(50) DEFAULT 'inactive',
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create credit_reports table
CREATE TABLE IF NOT EXISTS credit_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bureau VARCHAR(50) NOT NULL,
    report_data JSONB,
    credit_score INTEGER,
    report_date DATE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN DEFAULT FALSE
);

-- Create disputes table
CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    credit_report_id UUID REFERENCES credit_reports(id),
    dispute_type VARCHAR(100) NOT NULL,
    account_name VARCHAR(255),
    account_number VARCHAR(100),
    dispute_reason TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    bureau VARCHAR(50) NOT NULL,
    submitted_date DATE,
    expected_resolution_date DATE,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create letters table
CREATE TABLE IF NOT EXISTS letters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    dispute_id UUID REFERENCES disputes(id),
    letter_type VARCHAR(100) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    recipient_address TEXT,
    letter_content TEXT NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_date DATE,
    tracking_number VARCHAR(100),
    delivery_status VARCHAR(50) DEFAULT 'pending'
);

-- Create user_usage table
CREATE TABLE IF NOT EXISTS user_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    feature VARCHAR(100) NOT NULL,
    usage_count INTEGER DEFAULT 0,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    month_year VARCHAR(7) NOT NULL,
    UNIQUE(user_id, feature, month_year)
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    plan_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create credit_monitoring table
CREATE TABLE IF NOT EXISTS credit_monitoring (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    monitoring_enabled BOOLEAN DEFAULT FALSE,
    last_check TIMESTAMP,
    alerts_enabled BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_credit_reports_user_id ON credit_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_disputes_user_id ON disputes(user_id);
CREATE INDEX IF NOT EXISTS idx_letters_user_id ON letters(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_monitoring_user_id ON credit_monitoring(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_disputes_updated_at ON disputes;
CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON disputes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_credit_monitoring_updated_at ON credit_monitoring;
CREATE TRIGGER update_credit_monitoring_updated_at BEFORE UPDATE ON credit_monitoring FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Setup Guide</h1>
          <p className="text-gray-600">
            Follow these steps to configure your Credit Repair AI application
          </p>
        </div>

        <div className="space-y-6">
          {/* Step 1: Supabase Database */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Database className="h-6 w-6 text-blue-500" />
                Step 1: Set up Supabase Database
                <Badge variant="destructive">Required</Badge>
              </CardTitle>
              <CardDescription>
                Create your database and run the schema to set up all required tables
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">1. Create Supabase Project</h4>
                <p className="text-sm text-gray-600">
                  Go to{" "}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    supabase.com <ExternalLink className="h-3 w-3" />
                  </a>{" "}
                  and create a new project
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">2. Get Your Credentials</h4>
                <p className="text-sm text-gray-600">
                  In your Supabase project, go to Settings → API and copy:
                </p>
                <ul className="text-sm text-gray-600 ml-4 space-y-1">
                  <li>• Project URL</li>
                  <li>• anon/public key</li>
                  <li>• service_role key (keep this secret!)</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">3. Run Database Schema</h4>
                <p className="text-sm text-gray-600 mb-2">
                  In your Supabase project, go to SQL Editor and run this schema:
                </p>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto max-h-64 relative">
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2 text-xs"
                    onClick={() => copyToClipboard(sqlSchema, "SQL Schema")}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    {copiedText === "SQL Schema" ? "Copied!" : "Copy"}
                  </Button>
                  <pre className="whitespace-pre-wrap">{sqlSchema}</pre>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">How to run the schema:</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Copy the SQL code above</li>
                  <li>2. Go to your Supabase project dashboard</li>
                  <li>3. Click "SQL Editor" in the left sidebar</li>
                  <li>4. Click "New Query"</li>
                  <li>5. Paste the SQL code</li>
                  <li>6. Click "Run" button</li>
                  <li>7. You should see "Success. No rows returned" message</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Resend Email */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Mail className="h-6 w-6 text-green-500" />
                Step 2: Set up Resend Email Service
                <Badge variant="destructive">Required</Badge>
              </CardTitle>
              <CardDescription>Configure email service for user authentication and notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">1. Create Resend Account</h4>
                <p className="text-sm text-gray-600">
                  Go to{" "}
                  <a
                    href="https://resend.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    resend.com <ExternalLink className="h-3 w-3" />
                  </a>{" "}
                  and create a free account
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">2. Get API Key</h4>
                <p className="text-sm text-gray-600">
                  In your Resend dashboard, go to API Keys and create a new key
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">For Development:</h4>
                <p className="text-sm text-green-800">
                  You can use <code className="bg-green-100 px-1 rounded">onboarding@resend.dev</code> as your FROM_EMAIL
                  for testing without setting up a custom domain.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: JWT Secret */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Key className="h-6 w-6 text-purple-500" />
                Step 3: Generate JWT Secret
                <Badge variant="destructive">Required</Badge>
              </CardTitle>
              <CardDescription>Create a secure secret for user authentication tokens</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Generate Secure Secret</h4>
                <p className="text-sm text-gray-600 mb-2">Run this command in your terminal:</p>
                <div className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm relative">
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2 text-xs"
                    onClick={() =>
                      copyToClipboard(
                        'node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
                        "JWT Command"
                      )
                    }
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    {copiedText === "JWT Command" ? "Copied!" : "Copy"}
                  </Button>
                  <code>node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"</code>
                </div>
                <p className="text-sm text-gray-600">
                  This will output a secure 64-character string. Copy it and use it as your JWT_SECRET.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 4: Stripe (Optional) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-orange-500" />
                Step 4: Set up Stripe (Optional)
                <Badge variant="secondary">Optional</Badge>
              </CardTitle>
              <CardDescription>Configure payment processing for premium features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">1. Create Stripe Account</h4>
                <p className="text-sm text-gray-600">
                  Go to{" "}
                  <a
                    href="https://stripe.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    stripe.com <ExternalLink className="h-3 w-3" />
                  </a>{" "}
                  and create an account
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">2. Get Test Keys</h4>
                <p className="text-sm text-gray-600">
                  In your Stripe dashboard, make sure you're in "Test mode" and go to Developers → API keys
                </p>
                <ul className="text-sm text-gray-600 ml-4 space-y-1">
                  <li>• Copy the Publishable key (starts with pk_test_)</li>
                  <li>• Copy the Secret key (starts with sk_test_)</li>
                </ul>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-2">Note:</h4>
                <p className="text-sm text-orange-800">
                  Stripe is optional. You can skip this step and add payment processing later. The app will work without
                  it.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 5: Test Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                Step 5: Test Your Setup
              </CardTitle>
              <CardDescription>Verify all services are working correctly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                After setting up all the services above, test your configuration:
              </p>
              <Button asChild>
                <a href="/test-setup">Run Setup Tests</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button asChild size="lg">
            <a href="/test-setup">Test My Setup</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
