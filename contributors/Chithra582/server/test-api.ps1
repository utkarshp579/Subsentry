Write-Host "Testing SubSentry API..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000"
$headers = @{
    "Authorization" = "Bearer test-token-123"
    "Content-Type" = "application/json"
}

# 1. Test Health
Write-Host "`n[1] Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "✅ Health: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
}

# 2. Get Alert Rules
Write-Host "`n[2] Getting Alert Rules..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/alerts/rules" -Method GET -Headers $headers
    Write-Host "✅ Found $($response.count) alert rules" -ForegroundColor Green
    if ($response.count -gt 0) {
        foreach ($rule in $response.data) {
            Write-Host "   - $($rule.daysBefore) days via: $($rule.channels -join ', ')" -ForegroundColor White
        }
    }
} catch {
    Write-Host "⚠️  No alert rules yet (expected)" -ForegroundColor Yellow
}

# 3. Create Alert Rule
Write-Host "`n[3] Creating Alert Rule..." -ForegroundColor Yellow
$ruleData = @{
    daysBefore = 7
    channels = @("email", "in-app")
    enabled = $true
    notificationTime = "09:00"
    timezone = "UTC"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/alerts/rules" -Method POST -Headers $headers -Body $ruleData
    Write-Host "✅ Alert rule created!" -ForegroundColor Green
    Write-Host "   ID: $($response.data._id)" -ForegroundColor White
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Test Upcoming Renewals
Write-Host "`n[4] Testing Upcoming Renewals..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/alerts/upcoming?days=30" -Method GET -Headers $headers
    Write-Host "✅ Upcoming renewals: $($response.data.length)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  No renewals (expected without data)" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🎉 API Testing Complete!" -ForegroundColor Green