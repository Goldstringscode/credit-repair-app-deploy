# 🧪 Compliance Testing Guide

This guide covers comprehensive testing of all compliance features in the Credit Repair App.

## 📋 Overview

The compliance testing system includes:
- **Interactive Test Page**: `/test-compliance` - Manual testing interface
- **Status Dashboard**: `/test-compliance/status` - Real-time monitoring
- **Command Line Tests**: `npm run test:compliance` - Automated testing
- **API Health Checks**: Automated endpoint validation

## 🚀 Quick Start

### 1. Interactive Testing
```bash
# Start the development server
npm run dev

# Navigate to the test page
http://localhost:3000/test-compliance
```

### 2. Command Line Testing
```bash
# Run all compliance tests
npm run test:compliance

# Test against staging environment
npm run test:compliance:staging

# Test against production environment
npm run test:compliance:prod

# Test with custom parameters
node scripts/test-compliance.js --url https://api.example.com --user custom-user-123
```

### 3. Status Monitoring
```bash
# View real-time compliance status
http://localhost:3000/test-compliance/status
```

## 🧪 Test Categories

### GDPR (General Data Protection Regulation)
- **Data Export**: Test user data export functionality
- **Data Deletion**: Test right to be forgotten
- **Consent Withdrawal**: Test consent management
- **Request Management**: Test GDPR request handling

**Test Endpoints:**
- `POST /api/compliance/gdpr` - Submit GDPR requests
- `GET /api/compliance/gdpr?userId={id}` - Get user requests

**Expected Behaviors:**
- Data export returns complete user data
- Data deletion removes all user information
- Consent withdrawal updates user preferences
- Requests are tracked and audited

### FCRA (Fair Credit Reporting Act)
- **Dispute Submission**: Test credit dispute process
- **Free Report Requests**: Test annual free credit reports
- **Rights Information**: Test consumer rights disclosure

**Test Endpoints:**
- `POST /api/compliance/fcra` - Submit disputes/reports
- `GET /api/compliance/fcra?action=rights` - Get rights info

**Expected Behaviors:**
- Disputes are properly formatted and submitted
- Free reports are provided within 30 days
- Rights information is accurate and complete

### CCPA (California Consumer Privacy Act)
- **Right to Know**: Test data collection disclosure
- **Right to Delete**: Test data deletion requests
- **Data Categories**: Test data categorization

**Test Endpoints:**
- `POST /api/compliance/ccpa` - Submit CCPA requests
- `GET /api/compliance/ccpa?action=data-categories` - Get data categories

**Expected Behaviors:**
- Data collection is transparently disclosed
- Deletion requests are processed within 45 days
- Data categories are clearly defined

### HIPAA (Health Insurance Portability and Accountability Act)
- **Data Access**: Test health data access controls
- **Data Amendment**: Test health data correction
- **Rights Information**: Test patient rights

**Test Endpoints:**
- `POST /api/compliance/hipaa` - Submit HIPAA requests
- `GET /api/compliance/hipaa?action=rights` - Get rights info

**Expected Behaviors:**
- Health data access is properly controlled
- Amendments are tracked and audited
- Patient rights are clearly communicated

### PCI DSS (Payment Card Industry Data Security Standard)
- **Card Addition**: Test secure card storage
- **Transaction Processing**: Test secure payments
- **Compliance Monitoring**: Test security standards

**Test Endpoints:**
- `POST /api/compliance/pci` - Process card operations
- `GET /api/compliance/pci?action=compliance` - Get compliance status

**Expected Behaviors:**
- Card data is encrypted and tokenized
- Transactions are processed securely
- Compliance standards are maintained

### Data Retention
- **Record Creation**: Test data retention tracking
- **Policy Management**: Test retention policies
- **Expired Data Processing**: Test data cleanup

**Test Endpoints:**
- `POST /api/compliance/retention` - Create retention records
- `GET /api/compliance/retention?action=policies` - Get policies
- `PUT /api/compliance/retention` - Process expired data

**Expected Behaviors:**
- Data retention is properly tracked
- Policies are enforced automatically
- Expired data is securely deleted

## 🔧 Test Configuration

### Environment Variables
```bash
# Test Configuration
TEST_BASE_URL=http://localhost:3000
TEST_USER_ID=test-user-123

# Compliance Settings
GDPR_ENABLED=true
FCRA_ENABLED=true
CCPA_ENABLED=true
HIPAA_ENABLED=true
PCI_ENABLED=true
DATA_RETENTION_ENABLED=true
AUDIT_LOGGING_ENABLED=true

# External Services
LOGGING_SERVICE_URL=https://logs.example.com
LOGGING_SERVICE_TOKEN=your-token-here
COMPLIANCE_WEBHOOK_URL=https://webhook.example.com
```

### Test Data
The test suite uses standardized test data:
```javascript
{
  userId: 'test-user-123',
  email: 'test@example.com',
  cardNumber: '4111111111111111',
  expiryMonth: 12,
  expiryYear: 2025,
  cvv: '123',
  cardholderName: 'Test User',
  amount: 100.00,
  currency: 'USD',
  merchantId: 'merchant-123'
}
```

## 📊 Test Results

### Success Criteria
- **API Response**: All endpoints return expected status codes
- **Data Integrity**: Responses contain expected data structure
- **Performance**: Tests complete within acceptable time limits
- **Security**: Sensitive data is properly handled

### Test Metrics
- **Total Tests**: 15+ compliance tests
- **Success Rate**: Target 100% pass rate
- **Response Time**: < 2 seconds per test
- **Coverage**: All compliance frameworks tested

### Common Issues
1. **Rate Limiting**: Tests may be throttled by rate limiting middleware
2. **Authentication**: Some tests require valid authentication tokens
3. **Data Dependencies**: Tests may depend on existing data in the system
4. **Environment**: Tests may behave differently in different environments

## 🛠️ Troubleshooting

### Test Failures
```bash
# Check API server status
curl http://localhost:3000/api/health

# Check specific endpoint
curl http://localhost:3000/api/compliance/gdpr?action=health

# View detailed logs
npm run dev 2>&1 | grep -i compliance
```

### Common Solutions
1. **Start the server**: Ensure `npm run dev` is running
2. **Check environment**: Verify all required environment variables are set
3. **Clear cache**: Clear browser cache and localStorage
4. **Check logs**: Review console logs for error messages

### Debug Mode
```bash
# Enable debug logging
DEBUG=compliance:* npm run dev

# Run tests with verbose output
node scripts/test-compliance.js --verbose
```

## 📈 Monitoring

### Real-time Status
The compliance status dashboard provides:
- **Overall Score**: Aggregate compliance percentage
- **Framework Status**: Individual framework health
- **Test Results**: Recent test execution results
- **Auto-refresh**: Automatic status updates

### Alerts
- **Failed Tests**: Immediate notification of test failures
- **Low Compliance**: Alerts when compliance drops below threshold
- **System Issues**: Notifications for system-level problems

## 🔄 Continuous Integration

### GitHub Actions
```yaml
name: Compliance Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:compliance
```

### Pre-commit Hooks
```bash
# Install pre-commit hook
npm install --save-dev husky
npx husky add .husky/pre-commit "npm run test:compliance"
```

## 📚 Additional Resources

- **Compliance Dashboard**: `/compliance` - Main compliance interface
- **API Documentation**: `/api/docs` - API endpoint documentation
- **Security Tests**: `/test-security` - Security feature testing
- **Environment Setup**: `env-template.txt` - Environment configuration

## 🆘 Support

For issues with compliance testing:
1. Check this guide for common solutions
2. Review the test logs for specific error messages
3. Verify environment configuration
4. Contact the development team with detailed error information

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Maintainer**: Development Team
