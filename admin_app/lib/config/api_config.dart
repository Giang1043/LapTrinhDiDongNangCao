class ApiConfig {
  // Backend API base URL
  // For Android emulator: use 10.0.2.2 to connect to host machine
  // For iOS simulator: use localhost
  static const String baseUrl = 'http://192.168.1.100:3000/api/v1';
  
  // Local development - Android emulator needs 10.0.2.2 instead of localhost
  static const String localBaseUrl = 'http://10.0.2.2:3000/api/v1';
  
  // Auth endpoints
  static const String authLogin = '/auth/login';
  static const String authRegister = '/auth/register';
  static const String authLogout = '/auth/logout';
  
  // Admin endpoints
  static const String adminDashboard = '/admin/dashboard';
  static const String adminOrders = '/admin/orders';
  static const String adminUsers = '/admin/users';
  static const String adminProducts = '/admin/products';
  static const String adminCategories = '/admin/categories';
  static const String adminAnalytics = '/admin/analytics';
  
  // Public endpoints
  static const String products = '/products';
  static const String categories = '/categories';
  static const String orders = '/orders';
  
  // Get the API base URL based on environment
  static String getBaseUrl() {
    // For Android emulator use localhost mapped to 10.0.2.2
    return localBaseUrl;
  }
}
