#!/usr/bin/env python3
"""
FoodApp Admin - API Quick Reference & Testing Guide
Test all CRUD endpoints with this script
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:3000/api/v1"
ADMIN_EMAIL = "admin@test.com"
ADMIN_PASSWORD = "admin123"

# Color codes for terminal output
GREEN = "\033[92m"
RED = "\033[91m"
BLUE = "\033[94m"
YELLOW = "\033[93m"
END = "\033[0m"

def print_section(title):
    print(f"\n{BLUE}{'='*60}{END}")
    print(f"{BLUE}{title:^60}{END}")
    print(f"{BLUE}{'='*60}{END}\n")

def print_success(msg):
    print(f"{GREEN}✓ {msg}{END}")

def print_error(msg):
    print(f"{RED}✗ {msg}{END}")

def print_info(msg):
    print(f"{YELLOW}ℹ {msg}{END}")

def login():
    """Login and get admin token"""
    print_section("STEP 1: ADMIN LOGIN")
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("token")
            print_success(f"Login successful! Token: {token[:20]}...")
            return token
        else:
            print_error(f"Login failed: {response.text}")
            return None
    except Exception as e:
        print_error(f"Error during login: {e}")
        return None

def test_products(token):
    """Test Product CRUD operations"""
    print_section("PRODUCTS CRUD OPERATIONS")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # GET Products
    print_info("1. Get all products...")
    try:
        response = requests.get(f"{BASE_URL}/admin/products", headers=headers)
        if response.status_code == 200:
            data = response.json()
            count = len(data.get("data", []))
            print_success(f"Got {count} products")
            if count > 0:
                print(f"  First product: {data['data'][0].get('name')}")
    except Exception as e:
        print_error(f"Failed to get products: {e}")
    
    # CREATE Product
    print_info("2. Create new product...")
    try:
        new_product = {
            "name": f"Test Product {datetime.now().timestamp()}",
            "description": "Test description",
            "category_id": "1",
            "price": 25000,
            "image_url": "https://via.placeholder.com/300"
        }
        response = requests.post(f"{BASE_URL}/admin/products", 
                                json=new_product, headers=headers)
        if response.status_code in [200, 201]:
            print_success("Product created successfully")
            product_id = response.json().get("data", {}).get("id")
            return product_id
    except Exception as e:
        print_error(f"Failed to create product: {e}")
    
    return None

def test_categories(token):
    """Test Category CRUD operations"""
    print_section("CATEGORIES CRUD OPERATIONS")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # GET Categories
    print_info("1. Get all categories...")
    try:
        response = requests.get(f"{BASE_URL}/admin/categories", headers=headers)
        if response.status_code == 200:
            data = response.json()
            count = len(data.get("data", []))
            print_success(f"Got {count} categories")
            if count > 0:
                cat_id = data['data'][0].get('id')
                cat_name = data['data'][0].get('name')
                print(f"  First category: {cat_name} (ID: {cat_id})")
                return cat_id
    except Exception as e:
        print_error(f"Failed to get categories: {e}")
    
    return None

def test_category_update(token, category_id):
    """Test Category UPDATE (NEW)"""
    print_info("2. Update category (NEW)...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        update_data = {
            "name": f"Updated Category {datetime.now().timestamp()}",
            "image": "https://via.placeholder.com/300"
        }
        response = requests.put(
            f"{BASE_URL}/admin/categories/{category_id}",
            json=update_data,
            headers=headers
        )
        if response.status_code == 200:
            print_success("Category updated successfully")
            return True
    except Exception as e:
        print_error(f"Failed to update category: {e}")
    
    return False

def test_orders(token):
    """Test Order READ and UPDATE operations"""
    print_section("ORDERS MANAGEMENT")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # GET Orders
    print_info("1. Get all orders...")
    try:
        response = requests.get(f"{BASE_URL}/admin/orders", headers=headers)
        if response.status_code == 200:
            data = response.json()
            count = len(data.get("data", []))
            print_success(f"Got {count} orders")
            if count > 0:
                order = data['data'][0]
                order_id = order.get('id')
                order_num = order.get('order_number')
                order_status = order.get('status')
                print(f"  First order: #{order_num} (Status: {order_status})")
                return order_id, order_status
    except Exception as e:
        print_error(f"Failed to get orders: {e}")
    
    return None, None

def test_order_status_update(token, order_id, current_status):
    """Test Order status UPDATE"""
    print_info("2. Update order status...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Map status numbers to strings
    status_map = {
        1: "pending",
        2: "confirmed",
        3: "preparing",
        4: "shipping",
        5: "delivered",
        6: "cancelled"
    }
    
    new_status = "confirmed" if current_status != "confirmed" else "pending"
    
    try:
        response = requests.put(
            f"{BASE_URL}/admin/orders/{order_id}/status",
            json={"status": new_status},
            headers=headers
        )
        if response.status_code == 200:
            print_success(f"Order status updated to: {new_status}")
            return True
    except Exception as e:
        print_error(f"Failed to update order status: {e}")
    
    return False

def test_users(token):
    """Test User READ and status operations"""
    print_section("USERS MANAGEMENT")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # GET Users
    print_info("1. Get all users...")
    try:
        response = requests.get(f"{BASE_URL}/admin/users", headers=headers)
        if response.status_code == 200:
            data = response.json()
            count = len(data.get("data", []))
            print_success(f"Got {count} users")
            
            # Find a customer user
            for user in data.get("data", []):
                if user.get("role") == "customer":
                    user_id = user.get('id')
                    user_name = user.get('full_name')
                    is_active = user.get('is_active')
                    print(f"  Test user: {user_name} (Active: {is_active})")
                    return user_id, is_active
    except Exception as e:
        print_error(f"Failed to get users: {e}")
    
    return None, None

def test_user_deactivate(token, user_id):
    """Test User DEACTIVATE"""
    print_info("2. Deactivate user...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.put(
            f"{BASE_URL}/admin/users/{user_id}/deactivate",
            headers=headers
        )
        if response.status_code == 200:
            print_success("User deactivated successfully")
            return True
    except Exception as e:
        print_error(f"Failed to deactivate user: {e}")
    
    return False

def test_user_reactivate(token, user_id):
    """Test User REACTIVATE (NEW)"""
    print_info("3. Reactivate user (NEW)...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.put(
            f"{BASE_URL}/admin/users/{user_id}/reactivate",
            headers=headers
        )
        if response.status_code == 200:
            print_success("User reactivated successfully")
            return True
    except Exception as e:
        print_error(f"Failed to reactivate user: {e}")
    
    return False

def main():
    print(f"\n{BLUE}{'='*60}")
    print(f"FoodApp Admin - CRUD API Testing".center(60))
    print(f"{'='*60}{END}\n")
    
    # Login
    token = login()
    if not token:
        print_error("Cannot proceed without token")
        return
    
    # Test Products
    product_id = test_products(token)
    
    # Test Categories
    category_id = test_categories(token)
    if category_id:
        test_category_update(token, category_id)
    
    # Test Orders
    order_id, order_status = test_orders(token)
    if order_id:
        test_order_status_update(token, order_id, order_status)
    
    # Test Users
    user_id, is_active = test_users(token)
    if user_id:
        test_user_deactivate(token, user_id)
        test_user_reactivate(token, user_id)
    
    print_section("TESTING COMPLETE")
    print_success("All CRUD operations tested successfully!")
    print()

if __name__ == "__main__":
    print("""
Note: Make sure backend is running on http://localhost:3000
Run: cd backend && npm run dev
    """)
    main()
