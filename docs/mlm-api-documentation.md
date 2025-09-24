# MLM System API Documentation

## Overview

The MLM (Multi-Level Marketing) System API provides comprehensive endpoints for managing all aspects of a multi-level marketing business, including user management, commission processing, team structure, analytics, and more.

## Base URL

```
Production: https://api.creditrepairmlm.com/v1
Staging: https://staging-api.creditrepairmlm.com/v1
Development: http://localhost:3000/api
```

## Authentication

All API requests require authentication using a Bearer token in the Authorization header:

```http
Authorization: Bearer <your_access_token>
```

## Rate Limiting

API requests are rate limited to prevent abuse:
- **General endpoints**: 100 requests per minute
- **Analytics endpoints**: 50 requests per minute
- **Commission endpoints**: 20 requests per minute
- **Payout endpoints**: 10 requests per minute

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "timestamp": "2024-01-20T10:30:00Z",
  "requestId": "req_123456789"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-20T10:30:00Z",
  "requestId": "req_123456789"
}
```

## Endpoints

### User Management

#### Get User Profile
```http
GET /users/{userId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "mlmCode": "CR001",
    "rank": {
      "id": "manager",
      "name": "Manager",
      "level": 3
    },
    "status": "active",
    "personalVolume": 1250,
    "teamVolume": 8500,
    "totalEarnings": 12450,
    "currentMonthEarnings": 2100,
    "activeDownlines": 8,
    "totalDownlines": 23
  }
}
```

#### Update User Profile
```http
PUT /users/{userId}
```

**Request Body:**
```json
{
  "personalInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "billingInfo": {
    "address": {
      "street": "123 Main St",
      "city": "Anytown",
      "state": "CA",
      "zipCode": "12345",
      "country": "US"
    }
  }
}
```

### Team Management

#### Get Team Structure
```http
GET /teams/{userId}/structure?depth=5
```

**Query Parameters:**
- `depth` (optional): Maximum depth to retrieve (default: 5, max: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "root": {
      "id": "user_123",
      "name": "John Doe",
      "rank": "Manager",
      "volume": 1250,
      "children": [
        {
          "id": "user_456",
          "name": "Jane Smith",
          "rank": "Consultant",
          "volume": 800,
          "children": []
        }
      ]
    },
    "stats": {
      "totalMembers": 23,
      "activeMembers": 18,
      "totalVolume": 8500,
      "averageVolume": 370
    }
  }
}
```

#### Get Team Statistics
```http
GET /teams/{userId}/stats?period=30
```

**Query Parameters:**
- `period` (optional): Number of days to analyze (default: 30)

### Commission Management

#### Get Commission History
```http
GET /commissions?userId={userId}&startDate=2024-01-01&endDate=2024-01-31
```

**Query Parameters:**
- `userId` (required): User ID
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)
- `status` (optional): Filter by status (pending, paid, cancelled)
- `type` (optional): Filter by type (direct_referral, unilevel, binary, etc.)

**Response:**
```json
{
  "success": true,
  "data": {
    "commissions": [
      {
        "id": "comm_001",
        "type": "direct_referral",
        "amount": 225.00,
        "percentage": 0.30,
        "baseAmount": 750.00,
        "status": "paid",
        "createdAt": "2024-01-15T10:30:00Z",
        "fromUser": {
          "id": "user_456",
          "name": "Jane Smith"
        }
      }
    ],
    "summary": {
      "total": 1250.00,
      "pending": 150.00,
      "paid": 1100.00,
      "count": 8
    }
  }
}
```

#### Calculate Commission
```http
POST /commissions/calculate
```

**Request Body:**
```json
{
  "buyerId": "user_456",
  "amount": 750.00,
  "productType": "credit_repair_package",
  "commissionType": "unilevel"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "commissions": [
      {
        "userId": "user_123",
        "type": "direct_referral",
        "amount": 225.00,
        "percentage": 0.30,
        "level": 1
      },
      {
        "userId": "user_789",
        "type": "unilevel",
        "amount": 37.50,
        "percentage": 0.05,
        "level": 2
      }
    ],
    "totalCommission": 262.50
  }
}
```

### Payout Management

#### Get Payout History
```http
GET /payouts?userId={userId}&status=pending
```

**Query Parameters:**
- `userId` (required): User ID
- `status` (optional): Filter by status (pending, processing, completed, failed)

**Response:**
```json
{
  "success": true,
  "data": {
    "payouts": [
      {
        "id": "payout_001",
        "amount": 500.00,
        "currency": "USD",
        "method": "bank_account",
        "status": "pending",
        "requestedAt": "2024-01-20T10:30:00Z",
        "estimatedCompletion": "2024-01-23T10:30:00Z"
      }
    ],
    "availableBalance": 1250.00,
    "pendingAmount": 500.00
  }
}
```

#### Request Payout
```http
POST /payouts
```

**Request Body:**
```json
{
  "userId": "user_123",
  "amount": 500.00,
  "payoutMethodId": "method_001",
  "commissionIds": ["comm_001", "comm_002"],
  "notes": "Monthly payout request"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "payout_001",
    "amount": 500.00,
    "status": "processing",
    "estimatedCompletion": "2024-01-23T10:30:00Z",
    "fees": 5.00,
    "netAmount": 495.00
  }
}
```

### Analytics

#### Get User Analytics
```http
GET /analytics/users/{userId}?period=monthly&metrics=sales,team,earnings
```

**Query Parameters:**
- `period` (optional): Time period (daily, weekly, monthly, quarterly, yearly)
- `metrics` (optional): Comma-separated list of metrics to include

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "monthly",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "metrics": {
      "sales": {
        "total": 1250,
        "growth": 0.15,
        "trend": "increasing"
      },
      "team": {
        "totalMembers": 23,
        "activeMembers": 18,
        "retentionRate": 0.78
      },
      "earnings": {
        "total": 2100,
        "growth": 0.20,
        "trend": "increasing"
      }
    }
  }
}
```

#### Get Predictive Insights
```http
GET /analytics/users/{userId}/predictions
```

**Response:**
```json
{
  "success": true,
  "data": {
    "predictions": {
      "nextMonthEarnings": 2520,
      "rankAdvancementProbability": 0.85,
      "teamGrowthForecast": 28,
      "churnRisk": 0.15
    },
    "recommendations": [
      {
        "action": "Focus on rank advancement",
        "priority": "high",
        "description": "You are close to advancing to the next rank",
        "expectedImpact": 25
      }
    ]
  }
}
```

### Notifications

#### Get Notifications
```http
GET /notifications?userId={userId}&unreadOnly=true
```

**Query Parameters:**
- `userId` (required): User ID
- `unreadOnly` (optional): Return only unread notifications (default: false)
- `limit` (optional): Maximum number of notifications to return (default: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_001",
        "type": "commission_earned",
        "title": "Commission Earned!",
        "message": "You earned $225.00 from a direct referral commission",
        "isRead": false,
        "priority": "normal",
        "createdAt": "2024-01-20T10:30:00Z"
      }
    ],
    "unreadCount": 3
  }
}
```

#### Mark Notification as Read
```http
PUT /notifications/{notificationId}/read
```

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

### Mobile Integration

#### Register Device
```http
POST /mobile/devices
```

**Request Body:**
```json
{
  "userId": "user_123",
  "deviceToken": "device_token_here",
  "platform": "ios",
  "appVersion": "1.2.3",
  "osVersion": "17.0",
  "timezone": "America/New_York"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "device_001",
    "userId": "user_123",
    "platform": "ios",
    "isActive": true,
    "pushEnabled": true
  }
}
```

#### Send Push Notification
```http
POST /mobile/notifications
```

**Request Body:**
```json
{
  "userId": "user_123",
  "title": "New Commission!",
  "body": "You earned $150.00 from team sales",
  "data": {
    "type": "commission",
    "amount": 150.00
  },
  "priority": "normal",
  "category": "earnings"
}
```

### AI Features

#### Get AI Recommendations
```http
GET /ai/recommendations/{userId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "id": "rec_001",
        "type": "recruitment",
        "priority": "high",
        "title": "Focus on Direct Recruitment",
        "description": "Your team size is below optimal. Focus on recruiting 2-3 new members this month.",
        "action": "Implement targeted recruitment strategy",
        "expectedImpact": 25,
        "confidence": 0.85
      }
    ],
    "performanceProfile": {
      "strengths": ["Strong personal sales", "Effective team building"],
      "weaknesses": ["Low team retention", "Limited training"],
      "personalityType": "Sales-focused",
      "learningStyle": "Visual"
    }
  }
}
```

#### Process Chatbot Query
```http
POST /ai/chatbot
```

**Request Body:**
```json
{
  "userId": "user_123",
  "query": "How can I increase my team size?"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "Based on your current team size of 8 members, I recommend focusing on recruiting 2-3 new members this month through targeted outreach and referral programs.",
    "confidence": 0.85,
    "suggestedActions": [
      "Identify prospects",
      "Improve recruitment process",
      "Follow up with leads"
    ],
    "relatedTopics": [
      "Team building",
      "Leadership",
      "Communication"
    ],
    "sentiment": "positive"
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_TOKEN` | Invalid or expired authentication token |
| `USER_NOT_FOUND` | User does not exist |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| `INVALID_REQUEST` | Request data is invalid or missing required fields |
| `RATE_LIMIT_EXCEEDED` | Rate limit exceeded |
| `PAYOUT_INSUFFICIENT_BALANCE` | Insufficient balance for payout |
| `COMMISSION_CALCULATION_ERROR` | Error calculating commission |
| `TEAM_STRUCTURE_ERROR` | Error processing team structure |
| `NOTIFICATION_SEND_ERROR` | Error sending notification |
| `AI_PROCESSING_ERROR` | Error processing AI request |

## Webhooks

The MLM system supports webhooks for real-time notifications:

### Webhook Events

- `user.registered` - New user registration
- `user.rank_advanced` - User rank advancement
- `commission.earned` - Commission earned
- `payout.processed` - Payout processed
- `team.member_added` - Team member added
- `notification.sent` - Notification sent

### Webhook Payload

```json
{
  "event": "commission.earned",
  "timestamp": "2024-01-20T10:30:00Z",
  "data": {
    "userId": "user_123",
    "amount": 225.00,
    "type": "direct_referral",
    "commissionId": "comm_001"
  }
}
```

## SDKs and Libraries

### JavaScript/Node.js
```bash
npm install @creditrepairmlm/sdk
```

```javascript
import { MLMClient } from '@creditrepairmlm/sdk'

const client = new MLMClient({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.creditrepairmlm.com/v1'
})

const user = await client.users.get('user_123')
const commissions = await client.commissions.list({ userId: 'user_123' })
```

### Python
```bash
pip install creditrepairmlm-sdk
```

```python
from creditrepairmlm import MLMClient

client = MLMClient(api_key='your_api_key')

user = client.users.get('user_123')
commissions = client.commissions.list(user_id='user_123')
```

### PHP
```bash
composer require creditrepairmlm/sdk
```

```php
use CreditRepairMLM\MLMClient;

$client = new MLMClient('your_api_key');

$user = $client->users->get('user_123');
$commissions = $client->commissions->list(['userId' => 'user_123']);
```

## Testing

### Sandbox Environment

Use the sandbox environment for testing:
- **Base URL**: `https://sandbox-api.creditrepairmlm.com/v1`
- **Test API Key**: `sandbox_test_key_123456789`

### Postman Collection

Download our Postman collection for easy API testing:
[Download Collection](https://api.creditrepairmlm.com/docs/postman-collection.json)

### API Testing Tools

- **Swagger UI**: https://api.creditrepairmlm.com/docs
- **Insomnia**: Import our Insomnia collection
- **curl Examples**: Available in our documentation

## Support

- **Documentation**: https://docs.creditrepairmlm.com
- **API Status**: https://status.creditrepairmlm.com
- **Support Email**: api-support@creditrepairmlm.com
- **Discord Community**: https://discord.gg/creditrepairmlm

## Changelog

### v1.2.0 (2024-01-20)
- Added AI-powered recommendations
- Enhanced mobile integration
- Improved analytics endpoints
- Added webhook support

### v1.1.0 (2024-01-15)
- Added commission calculation endpoints
- Enhanced payout processing
- Improved team management
- Added notification system

### v1.0.0 (2024-01-01)
- Initial API release
- Basic user management
- Team structure endpoints
- Analytics foundation
