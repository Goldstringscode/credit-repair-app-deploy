# SMS Test Script for CreditAI Pro
# This script tests the SMS system using PowerShell

Write-Host "📱 Testing SMS System..." -ForegroundColor Cyan
Write-Host ""

# Test SMS API endpoint
$testBody = @{
    action = "send_sms"
    to = "+1234567890"  # Replace with your phone number
    message = "Test message from CreditAI Pro SMS system"
} | ConvertTo-Json

Write-Host "🔌 Testing SMS API endpoint..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/sms" -Method POST -Body $testBody -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "✅ SMS API is working!" -ForegroundColor Green
        Write-Host "   Message ID: $($response.messageId)" -ForegroundColor Gray
    } else {
        Write-Host "❌ SMS API error: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Failed to connect to SMS API:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure your development server is running:" -ForegroundColor Yellow
    Write-Host "   npm run dev" -ForegroundColor White
}

Write-Host ""
Write-Host "📋 To test with your own phone number:" -ForegroundColor Cyan
Write-Host "1. Replace '+1234567890' with your phone number" -ForegroundColor White
Write-Host "2. Run this script again" -ForegroundColor White
Write-Host "3. Check your phone for the test message" -ForegroundColor White

Write-Host ""
Write-Host "🌐 Or visit the SMS Dashboard:" -ForegroundColor Cyan
Write-Host "   http://localhost:3000/dashboard/sms" -ForegroundColor White
