# MLM Billing System

A comprehensive billing and payment system designed specifically for the Multi-Level Marketing (MLM) functionality of the Credit Repair App. This system handles subscription management, commission tracking, and payout processing for MLM users.

## 🏗️ System Architecture

### Core Components

1. **MLM Billing Dashboard** (`/mlm/billing`)
   - Subscription management
   - Payment method management
   - Earnings tracking
   - Payout history

2. **Payment Processing**
   - Stripe integration for secure payments
   - MLM-specific payment intents
   - Subscription management
   - Webhook handling

3. **Commission System**
   - Real-time commission calculation
   - Multiple commission types
   - Rank-based commission rates
   - Payout processing

4. **Database Schema**
   - MLM users and genealogy
   - Payment and commission tracking
   - Rank and plan management

## 📋 Features

### MLM Subscription Plans

| Plan | Price | Commission Rate | Features |
|------|-------|----------------|----------|
| **MLM Starter** | $49.99/month | 30% | Basic dashboard, team tools, email support |
| **MLM Professional** | $99.99/month | 35% | Advanced analytics, custom pages, priority support |
| **MLM Enterprise** | $199.99/month | 40% | Unlimited members, white-label, API access |

### Commission Types

1. **Direct Referral** - Earn on direct signups
2. **Unilevel** - Earn on team member activity
3. **Fast Start Bonus** - Extra commission for new recruits
4. **Matching Bonus** - Earn on downline commissions
5. **Leadership Bonus** - Monthly team performance bonuses
6. **Rank Advancement** - Bonuses for rank promotions
7. **Infinity Bonus** - Lifetime earnings on all downline

### MLM Ranks

| Rank | Level | Commission Rate | Requirements |
|------|-------|----------------|--------------|
| **Associate** | 1 | 30% | New member |
| **Consultant** | 2 | 35% | $500 PV, $1,000 TV, 2 downlines |
| **Manager** | 3 | 40% | $1,000 PV, $5,000 TV, 5 downlines |
| **Director** | 4 | 45% | $2,000 PV, $15,000 TV, 10 downlines |
| **Executive** | 5 | 50% | $3,000 PV, $50,000 TV, 25 downlines |
| **Presidential** | 6 | 55% | $5,000 PV, $150,000 TV, 50 downlines |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account with API keys
- Supabase project

### Installation

1. **Install Dependencies**
   ```bash
   npm install stripe @stripe/stripe-js
   ```

2. **Environment Variables**
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Database Setup**
   ```bash
   # Run the MLM billing schema
   psql -d your_database -f scripts/mlm-billing-schema.sql
   ```

4. **Stripe Webhook Setup**
   - Create webhook endpoint: `https://yourdomain.com/api/mlm/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `invoice.payment_succeeded`, `customer.subscription.*`

## 📁 File Structure

```
app/mlm/billing/
├── page.tsx                          # Main billing dashboard
├── components/
│   ├── mlm-subscription-manager.tsx  # Subscription management
│   ├── mlm-payment-methods.tsx       # Payment method management
│   └── mlm-payment-processor.tsx     # Payment processing
├── api/
│   ├── create-payment-intent/        # Stripe payment intent
│   ├── create-subscription/          # Subscription creation
│   └── webhooks/stripe/              # Stripe webhook handler
└── scripts/
    ├── mlm-billing-schema.sql        # Database schema
    └── test-mlm-billing.js           # Test suite
```

## 🔧 API Endpoints

### Payment Processing

#### Create Payment Intent
```http
POST /api/mlm/create-payment-intent
Content-Type: application/json

{
  "planType": "mlm_professional",
  "mlmCode": "MLM123456",
  "sponsorId": "user_123"
}
```

#### Create Subscription
```http
POST /api/mlm/create-subscription
Content-Type: application/json

{
  "planType": "mlm_professional",
  "paymentMethodId": "pm_1234567890",
  "mlmCode": "MLM123456",
  "sponsorId": "user_123"
}
```

### Webhook Events

The system handles the following Stripe webhook events:

- `payment_intent.succeeded` - Payment completed
- `payment_intent.payment_failed` - Payment failed
- `invoice.payment_succeeded` - Subscription payment succeeded
- `invoice.payment_failed` - Subscription payment failed
- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Subscription updated
- `customer.subscription.deleted` - Subscription cancelled

## 💰 Commission Calculation

### Direct Referral Commission
```javascript
commission = saleAmount * userCommissionRate
```

### Unilevel Commission
```javascript
commission = saleAmount * (userCommissionRate * levelRate)
// levelRate decreases with depth: 0.1, 0.08, 0.06, etc.
```

### Fast Start Bonus
```javascript
bonus = saleAmount * 0.1 // 10% extra for first 30 days
```

## 🧪 Testing

### Run Test Suite
```bash
node scripts/test-mlm-billing.js
```

### Test Coverage
- User authentication
- Payment intent creation
- Subscription management
- Webhook processing
- Commission calculations
- Rank advancement

## 📊 Database Schema

### Key Tables

- `mlm_users` - MLM user profiles and subscription info
- `mlm_genealogy` - Sponsor/downline relationships
- `mlm_payments` - Payment history
- `mlm_commissions` - Commission earnings
- `mlm_payouts` - Payout records
- `mlm_ranks` - Rank definitions and requirements
- `mlm_plans` - Subscription plan details

### Key Functions

- `calculate_mlm_commission()` - Calculate commission amounts
- `update_mlm_earnings()` - Update user earnings
- `check_mlm_rank_advancement()` - Check for rank promotions

## 🔒 Security Features

- Stripe PCI compliance
- Encrypted payment data
- JWT authentication
- Webhook signature verification
- Role-based access control

## 📈 Analytics & Reporting

The billing system provides comprehensive analytics:

- Monthly recurring revenue (MRR)
- Commission payouts
- Rank distribution
- Churn rates
- Conversion metrics

## 🚨 Error Handling

- Payment failure recovery
- Subscription retry logic
- Commission calculation validation
- Database transaction rollbacks

## 🔄 Maintenance

### Daily Tasks
- Process pending commissions
- Update rank calculations
- Send payment reminders

### Weekly Tasks
- Generate payout reports
- Update team statistics
- Clean up expired data

### Monthly Tasks
- Process monthly payouts
- Update rank requirements
- Generate financial reports

## 📞 Support

For technical support or questions about the MLM billing system:

1. Check the test suite for common issues
2. Review webhook logs for payment failures
3. Verify Stripe dashboard for transaction status
4. Check database logs for commission calculations

## 🔮 Future Enhancements

- Mobile app integration
- Advanced analytics dashboard
- Automated rank advancement
- Multi-currency support
- Tax reporting tools
- Advanced payout methods

## 📝 License

This MLM billing system is part of the Credit Repair App and is proprietary software.

---

**Note**: This system is designed specifically for MLM operations and includes features like commission tracking, rank advancement, and genealogy management that are essential for multi-level marketing businesses.
