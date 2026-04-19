#!/usr/bin/env pwsh

# Test User 1 and User 2 with proper user isolation

Write-Host "╔════════════════════════════════════════════════════════════╗"
Write-Host "║         FOODAPP API - USER ISOLATION TEST                  ║"
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Login User 1
Write-Host "`n[1] Logging in User 1 (hieu@test.com)..." -ForegroundColor Green
$body = @{email="hieu@test.com"; password="123456"} | ConvertTo-Json
$login1 = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
$user1Data = $login1.Content | ConvertFrom-Json
$token1 = $user1Data.token
$userId1 = $user1Data.userId
Write-Host "✅ User 1 logged in: $userId1"

# Login User 2
Write-Host "`n[2] Logging in User 2 (customer@test.com)..." -ForegroundColor Green
$body = @{email="customer@test.com"; password="pass1234"} | ConvertTo-Json
$login2 = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
$user2Data = $login2.Content | ConvertFrom-Json
$token2 = $user2Data.token
$userId2 = $user2Data.userId
Write-Host "✅ User 2 logged in: $userId2"

# User 1 adds item to cart
Write-Host "`n[3] User 1: Adding Product 1 (qty=2) to cart..." -ForegroundColor Green
$body = @{productId="1"; quantity=2} | ConvertTo-Json
$addCart1 = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/cart/add" -Method POST -Headers @{"Authorization"="Bearer $token1"} -ContentType "application/json" -Body $body -UseBasicParsing
$cart1 = $addCart1.Content | ConvertFrom-Json
Write-Host "✅ User 1 cart items: $($cart1.data.Count)"

# User 2 adds item to cart
Write-Host "`n[4] User 2: Adding Product 1 (qty=3) to cart..." -ForegroundColor Green
$body = @{productId="1"; quantity=3} | ConvertTo-Json
$addCart2 = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/cart/add" -Method POST -Headers @{"Authorization"="Bearer $token2"} -ContentType "application/json" -Body $body -UseBasicParsing
$cart2 = $addCart2.Content | ConvertFrom-Json
Write-Host "✅ User 2 cart items: $($cart2.data.Count)"

# User 1 get cart
Write-Host "`n[5] User 1: Getting their cart..." -ForegroundColor Cyan
$getCart1 = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/cart" -Method GET -Headers @{"Authorization"="Bearer $token1"} -UseBasicParsing
$user1Cart = $getCart1.Content | ConvertFrom-Json
Write-Host "✅ User 1 sees:" -ForegroundColor Cyan
Write-Host "   - Items: $($user1Cart.data.itemCount)"
if ($user1Cart.data.items.Count -gt 0) {
    Write-Host "   - Quantity of Product 1: $($user1Cart.data.items[0].quantity)"
}

# User 2 get cart
Write-Host "`n[6] User 2: Getting their cart..." -ForegroundColor Cyan
$getCart2 = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/cart" -Method GET -Headers @{"Authorization"="Bearer $token2"} -UseBasicParsing
$user2Cart = $getCart2.Content | ConvertFrom-Json
Write-Host "✅ User 2 sees:" -ForegroundColor Cyan
Write-Host "   - Items: $($user2Cart.data.itemCount)"
if ($user2Cart.data.items.Count -gt 0) {
    Write-Host "   - Quantity of Product 1: $($user2Cart.data.items[0].quantity)"
}

# Verification
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║                    ISOLATION RESULTS                        ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow

if ($user1Cart.data.items[0].quantity -eq 2 -and $user2Cart.data.items[0].quantity -eq 3) {
    Write-Host "✅ PASS: USER ISOLATION WORKING!" -ForegroundColor Green
    Write-Host "   User 1 sees qty: 2 (correct)"
    Write-Host "   User 2 sees qty: 3 (correct)"
} else {
    Write-Host "❌ FAIL: USER ISOLATION BROKEN!" -ForegroundColor Red
    Write-Host "   User 1 sees qty: $($user1Cart.data.items[0].quantity)"
    Write-Host "   User 2 sees qty: $($user2Cart.data.items[0].quantity)"
}

Write-Host "`n"
