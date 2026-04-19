# FoodApp Admin - Flutter Admin Dashboard

## Overview
Complete Flutter admin application for managing the FoodApp backend. Features include:
- Order management
- Product management  
- User management
- Real-time statistics dashboard

## Project Structure

```
admin_app/
├── lib/
│   ├── config/
│   │   └── api_config.dart         # API configuration
│   ├── models/
│   │   └── index.dart              # Data models
│   ├── services/
│   │   └── api_service.dart        # API client (Dio)
│   ├── providers/
│   │   └── index.dart              # State management
│   ├── screens/
│   │   ├── login_screen.dart       # Login
│   │   ├── home_screen.dart        # Dashboard
│   │   ├── dashboard_screen.dart   # Statistics
│   │   ├── orders_screen.dart      # Orders
│   │   ├── products_screen.dart    # Products
│   │   └── users_screen.dart       # Users
│   └── main.dart                   # Entry point
└── pubspec.yaml                    # Dependencies
```

## Features

### 1. Authentication
- Email/Password login
- JWT token management  
- Token persistence

### 2. Dashboard
- Order statistics
- User statistics
- Product count
- Revenue tracking

### 3. Order Management
- List all orders
- View order details
- Update order status
- Filter by status

### 4. Product Management
- Add products
- Edit products
- Delete products
- Manage categories

### 5. User Management
- List all users
- Deactivate users
- View user details
- Filter users

## Setup

1. Navigate to admin_app:
   ```bash
   cd admin_app
   ```

2. Get dependencies:
   ```bash
   flutter pub get
   ```

3. Run the app:
   ```bash
   flutter run
   ```

## Login Credentials (Demo)

- **Email**: admin@test.com
- **Password**: admin123

## API Base URL

- Development: `http://localhost:3000/api/v1`
- Change in: `lib/config/api_config.dart`

## Backend Endpoints

### Admin API
- `GET /admin/dashboard` - Dashboard statistics
- `GET /admin/orders` - List orders
- `GET /admin/orders/:orderId` - Order detail
- `PUT /admin/orders/:orderId/status` - Update status
- `GET /admin/users` - List users
- `PUT /admin/users/:userId/deactivate` - Deactivate user
- `GET /admin/products` - List products
- `POST /admin/products` - Create product
- `PUT /admin/products/:productId` - Update product
- `DELETE /admin/products/:productId` - Delete product
- `GET /admin/categories` - List categories
- `POST /admin/categories` - Create category

## Technologies

- **Flutter**: UI framework
- **Dio**: HTTP client
- **Provider**: State management
- **SharedPreferences**: Local storage
- **Intl**: Date formatting
- **FL Chart**: Analytics charts

## Troubleshooting

### Can't connect to backend
- Verify backend running on localhost:3000
- Check API config in api_config.dart
- Ensure CORS enabled on backend

### Login fails
- Verify credentials: admin@test.com / admin123
- Check database has admin user
- Verify network connectivity

## Next Steps

- [ ] Implement analytics charts
- [ ] Add export functionality
- [ ] Real-time notifications
- [ ] Dark mode support
- [ ] Advanced filtering

For more info, see backend at: `c:\FoodAppSQL\backend\`
