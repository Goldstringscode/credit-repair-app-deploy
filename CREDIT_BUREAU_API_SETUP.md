# Credit Bureau API Setup Guide

This guide explains how to set up real credit bureau API integrations for production use.

## 🔑 Required API Keys

### 1. Experian API
- **Provider**: Experian Connect API
- **Documentation**: https://developer.experian.com/
- **Environment Variables**:
  ```bash
  EXPERIAN_API_KEY=your-experian-api-key
  EXPERIAN_SECRET_KEY=your-experian-secret-key
  EXPERIAN_ENVIRONMENT=sandbox  # or 'production'
  EXPERIAN_BASE_URL=https://sandbox.experian.com/api
  ```

### 2. Equifax API
- **Provider**: Equifax Credit Report API
- **Documentation**: https://developer.equifax.com/
- **Environment Variables**:
  ```bash
  EQUIFAX_API_KEY=your-equifax-api-key
  EQUIFAX_SECRET_KEY=your-equifax-secret-key
  EQUIFAX_ENVIRONMENT=sandbox  # or 'production'
  EQUIFAX_BASE_URL=https://sandbox.equifax.com/api
  ```

### 3. TransUnion API
- **Provider**: TransUnion CreditVision API
- **Documentation**: https://developer.transunion.com/
- **Environment Variables**:
  ```bash
  TRANSUNION_API_KEY=your-transunion-api-key
  TRANSUNION_SECRET_KEY=your-transunion-secret-key
  TRANSUNION_ENVIRONMENT=sandbox  # or 'production'
  TRANSUNION_BASE_URL=https://sandbox.transunion.com/api
  ```

## 🚀 Setup Instructions

### Step 1: Apply for API Access
1. Visit each bureau's developer portal
2. Create developer accounts
3. Apply for API access (may require business verification)
4. Complete compliance requirements (FCRA, etc.)

### Step 2: Configure Environment Variables
Add the API keys to your `.env.local` file:

```bash
# Credit Bureau APIs
EXPERIAN_API_KEY=your-actual-key-here
EXPERIAN_SECRET_KEY=your-actual-secret-here
EXPERIAN_ENVIRONMENT=sandbox
EXPERIAN_BASE_URL=https://sandbox.experian.com/api

EQUIFAX_API_KEY=your-actual-key-here
EQUIFAX_SECRET_KEY=your-actual-secret-here
EQUIFAX_ENVIRONMENT=sandbox
EQUIFAX_BASE_URL=https://sandbox.equifax.com/api

TRANSUNION_API_KEY=your-actual-key-here
TRANSUNION_SECRET_KEY=your-actual-secret-here
TRANSUNION_ENVIRONMENT=sandbox
TRANSUNION_BASE_URL=https://sandbox.transunion.com/api
```

### Step 3: Test API Integration
Use the test endpoint to verify API connections:

```bash
# Test with real APIs
curl "http://localhost:3000/api/credit-monitoring/scores?real=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test with mock APIs (default)
curl "http://localhost:3000/api/credit-monitoring/scores" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔒 Security & Compliance

### FCRA Compliance
- All API calls must be logged
- User consent required before pulling credit data
- Data retention policies must be followed
- Secure storage of sensitive information

### Data Protection
- Encrypt all PII data at rest
- Use HTTPS for all API communications
- Implement proper access controls
- Regular security audits

### Rate Limiting
- Respect bureau API rate limits
- Implement exponential backoff
- Cache responses when appropriate
- Monitor API usage

## 📊 Monitoring & Logging

### API Call Logging
All credit bureau API calls are automatically logged to the database:

```sql
-- View API call logs
SELECT 
  bureau,
  endpoint,
  success,
  response_time_ms,
  created_at
FROM credit_bureau_api_logs
WHERE user_id = 'user-id-here'
ORDER BY created_at DESC;
```

### Error Handling
- Automatic retry logic for transient failures
- Detailed error logging
- Fallback to mock data when APIs are unavailable
- User-friendly error messages

## 🧪 Testing

### Sandbox Testing
1. Use sandbox environment for development
2. Test with sample data provided by bureaus
3. Verify all API endpoints work correctly
4. Test error scenarios

### Production Testing
1. Start with limited user base
2. Monitor API performance and errors
3. Gradually increase usage
4. Implement monitoring alerts

## 💰 Cost Considerations

### API Pricing
- **Experian**: ~$0.50-2.00 per credit pull
- **Equifax**: ~$0.75-2.50 per credit pull
- **TransUnion**: ~$0.60-2.25 per credit pull

### Optimization Strategies
- Cache credit scores for 24-48 hours
- Only pull full reports when necessary
- Use score-only pulls for monitoring
- Implement smart refresh logic

## 🔧 Configuration Options

### API Behavior
```typescript
// Enable/disable real APIs
const useRealAPI = process.env.NODE_ENV === 'production'

// Fallback to mock data
const fallbackToMock = true

// Cache duration (in hours)
const cacheDuration = 24
```

### Error Handling
```typescript
// Retry configuration
const retryAttempts = 3
const retryDelay = 1000 // milliseconds

// Timeout configuration
const apiTimeout = 30000 // 30 seconds
```

## 📈 Performance Optimization

### Caching Strategy
- Cache credit scores for 24 hours
- Cache credit reports for 7 days
- Use Redis for distributed caching
- Implement cache invalidation

### Database Optimization
- Index frequently queried fields
- Partition large tables by date
- Regular database maintenance
- Monitor query performance

## 🚨 Troubleshooting

### Common Issues
1. **API Key Invalid**: Check environment variables
2. **Rate Limit Exceeded**: Implement backoff logic
3. **Network Timeouts**: Increase timeout values
4. **Data Format Errors**: Validate API responses

### Debug Mode
Enable debug logging:

```bash
DEBUG=credit-monitoring:* npm run dev
```

### Health Checks
Monitor API health:

```bash
curl http://localhost:3000/api/health/credit-bureaus
```

## 📞 Support

### Bureau Support
- **Experian**: support@experian.com
- **Equifax**: developer-support@equifax.com
- **TransUnion**: developer-support@transunion.com

### Internal Support
- Check application logs
- Review API call logs
- Monitor error rates
- Contact development team

## 🔄 Updates & Maintenance

### Regular Tasks
- Monitor API usage and costs
- Update API keys before expiration
- Review and update compliance policies
- Test API integrations monthly

### Version Updates
- Monitor bureau API version changes
- Update integration code as needed
- Test thoroughly before deployment
- Maintain backward compatibility
