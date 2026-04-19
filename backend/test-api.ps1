#!/usr/bin/env pwsh

Write-Host "========== TESTING FOODAPP BACKEND ==========" -ForegroundColor Cyan
Write-Host ""

# Test 1: Products
Write-Host "[TEST 1] GET /api/v1/products/categories" -ForegroundColor Green
$cat = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/products/categories" -Method GET -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json
Write-Host "✅ Categories: $($cat.data.Count) items loaded" -ForegroundColor Green

# Test 2: Featured Products
Write-Host "`n[TEST 2] GET /api/v1/products/featured" -ForegroundColor Green
$featured = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/products/featured" -Method GET -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json
Write-Host "✅ Featured products: $($featured.data.Count) items" -ForegroundColor Green

# Test 3: All Products
Write-Host "`n[TEST 3] GET /api/v1/products" -ForegroundColor Green
$products = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/products" -Method GET -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json
Write-Host "✅ Products: $($products.data.products.Count) items" -ForegroundColor Green

# Test 4: Login User 1
Write-Host "`n[TEST 4] POST /api/v1/auth/login (User 1)" -ForegroundColor Green
$body1 = @{email="hieu@test.com"; password="123456"} | ConvertTo-Json
$resp1 = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $body1 -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json
$token1 = $resp1.token
Write-Host "✅ User 1 logged in: $($resp1.userId)" -ForegroundColor Green

# Test 5: Login User 2
Write-Host "`n[TEST 5] POST /api/v1/auth/login (User 2)" -ForegroundColor Green
$body2 = @{email="customer@test.com"; password="pass1234"} | ConvertTo-Json
$resp2 = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $body2 -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json
$token2 = $resp2.token
Write-Host "✅ User 2 logged in: $($resp2.userId)" -ForegroundColor Green

# Test 6: User 1 Add to Cart
Write-Host "`n[TEST 6] POST /api/v1/cart/add (User 1, qty=2)" -ForegroundColor Green
$addBody = @{productId="1"; quantity=2} | ConvertTo-Json
$add1 = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/cart/add" -Method POST -Headers @{"Authorization"="Bearer $token1"} -ContentType "application/json" -Body $addBody -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json
Write-Host "✅ Added to cart, total: $($add1.data.total) VNĐ" -ForegroundColor Green

# Test 7: User 2 Add to Cart (same product, different qty)
Write-Host "`n[TEST 7] POST /api/v1/cart/add (User 2, qty=3)" -ForegroundColor Green
$addBody = @{productId="1"; quantity=3} | ConvertTo-Json
$add2 = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/cart/add" -Method POST -Headers @{"Authorization"="Bearer $token2"} -ContentType "application/json" -Body $addBody -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json
Write-Host "✅ Added to cart, total: $($add2.data.total) VNĐ" -ForegroundColor Green

# Test 8: User 1 Get Cart
Write-Host "`n[TEST 8] GET /api/v1/cart (User 1)" -ForegroundColor Green
$get1 = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/cart" -Method GET -Headers @{"Authorization"="Bearer $token1"} -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json
$qty1 = $get1.data.items[0].quantity
Write-Host "✅ User 1 cart: $qty1 items of product 1" -ForegroundColor Green

# Test 9: User 2 Get Cart
Write-Host "`n[TEST 9] GET /api/v1/cart (User 2)" -ForegroundColor Green
$get2 = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/cart" -Method GET -Headers @{"Authorization"="Bearer $token2"} -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json
$qty2 = $get2.data.items[0].quantity
Write-Host "✅ User 2 cart: $qty2 items of product 1" -ForegroundColor Green

# Verification
Write-Host "`n" -ForegroundColor Yellow
Write-Host "========== USER ISOLATION TEST ==========" -ForegroundColor Yellow
if ($qty1 -eq 2 -and $qty2 -eq 3) {
    Write-Host "✅ PASS: USER ISOLATION WORKING!" -ForegroundColor Green
    Write-Host "   User 1 sees qty: 2 ✓"
    Write-Host "   User 2 sees qty: 3 ✓"
    Write-Host "   Different users see different cart items!"
} else {
    Write-Host "❌ FAIL: User 1 qty=$qty1 (expected 2), User 2 qty=$qty2 (expected 3)" -ForegroundColor Red
}

Write-Host "`n"
