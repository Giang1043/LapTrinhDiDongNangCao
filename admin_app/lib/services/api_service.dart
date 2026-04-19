import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import '../models/index.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();

  factory ApiService() {
    return _instance;
  }

  ApiService._internal();

  late Dio _dio;
  String? _token;

  Future<void> init() async {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConfig.localBaseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        contentType: Headers.jsonContentType,
      ),
    );

    // Load saved token
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('auth_token');
    print('🔐 ApiService: Token loaded: ${_token != null ? _token!.substring(0, 20) + '...' : 'null'}');

    // Add interceptors
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          if (_token != null) {
            print('🔐 ApiService: Adding token to request: ${options.path}');
            options.headers['Authorization'] = 'Bearer $_token';
          } else {
            print('⚠️ ApiService: No token available for request: ${options.path}');
          }
          return handler.next(options);
        },
        onError: (error, handler) {
          print('❌ ApiService: Error - ${error.message}');
          if (error.response?.statusCode == 401) {
            // Token expired
            logout();
          }
          return handler.next(error);
        },
      ),
    );
  }

  // Auth endpoints
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await _dio.post(
        ApiConfig.authLogin,
        data: {
          'email': email,
          'password': password,
        },
      );

      if (response.statusCode == 200) {
        _token = response.data['token'];
        
        // Save token
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', _token!);

        return response.data;
      }
      throw Exception('Login failed');
    } on DioException catch (e) {
      throw Exception(e.response?.data['error'] ?? 'Login error');
    }
  }

  Future<void> logout() async {
    try {
      await _dio.post(ApiConfig.authLogout);
    } catch (e) {
      print('Logout error: $e');
    } finally {
      _token = null;
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('auth_token');
    }
  }

  // Admin - Orders
  Future<List<Order>> getOrders({int page = 1, int limit = 20}) async {
    try {
      final response = await _dio.get(
        ApiConfig.adminOrders,
        queryParameters: {'page': page, 'limit': limit},
      );

      // Handle both wrapped and direct data formats
      List<dynamic> ordersData = response.data['data'] as List? ?? [];
      
      List<Order> orders = [];
      for (var order in ordersData) {
        try {
          Map<String, dynamic> orderMap = order as Map<String, dynamic>;
          orders.add(Order.fromJson(orderMap));
        } catch (e) {
          print('✗ Error parsing order: $e');
          print('  Order data: $order');
        }
      }

      print('✓ Orders fetched: ${orders.length}');
      return orders;
    } on DioException catch (e) {
      print('✗ Error fetching orders: ${e.message}');
      print('  Response: ${e.response?.data}');
      throw Exception('Failed to fetch orders: ${e.message}');
    } catch (e) {
      print('✗ Unexpected error in getOrders: $e');
      throw Exception('Unexpected error: $e');
    }
  }

  Future<Order> getOrderDetail(String orderId) async {
    try {
      final response = await _dio.get('${ApiConfig.adminOrders}/$orderId');
      return Order.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw Exception('Failed to fetch order: ${e.message}');
    }
  }

  Future<void> updateOrderStatus(String orderId, String status) async {
    try {
      await _dio.put(
        '${ApiConfig.adminOrders}/$orderId/status',
        data: {'status': status},
      );
    } on DioException catch (e) {
      throw Exception('Failed to update order: ${e.message}');
    }
  }

  // Admin - Users
  Future<List<User>> getUsers({int page = 1, int limit = 20}) async {
    try {
      final response = await _dio.get(
        ApiConfig.adminUsers,
        queryParameters: {'page': page, 'limit': limit},
      );

      List<dynamic> usersData = response.data['data'] as List? ?? [];
      
      List<User> users = usersData
          .map((user) => User.fromJson(user as Map<String, dynamic>))
          .toList();

      print('✓ Users fetched: ${users.length}');
      return users;
    } on DioException catch (e) {
      print('✗ Error fetching users: ${e.message}');
      throw Exception('Failed to fetch users: ${e.message}');
    }
  }

  Future<void> deactivateUser(String userId) async {
    try {
      await _dio.put(
        '${ApiConfig.adminUsers}/$userId/deactivate',
      );
    } on DioException catch (e) {
      throw Exception('Failed to deactivate user: ${e.message}');
    }
  }

  // Admin - Products
  Future<List<Product>> getProducts({int page = 1, int limit = 20}) async {
    try {
      final response = await _dio.get(
        ApiConfig.adminProducts,
        queryParameters: {'page': page, 'limit': limit},
      );

      List<dynamic> productsData = response.data['data'] as List? ?? [];
      
      List<Product> products = productsData
          .map((product) => Product.fromJson(product as Map<String, dynamic>))
          .toList();

      print('✓ Products fetched: ${products.length}');
      return products;
    } on DioException catch (e) {
      print('✗ Error fetching products: ${e.message}');
      throw Exception('Failed to fetch products: ${e.message}');
    }
  }

  Future<void> createProduct(Product product) async {
    try {
      await _dio.post(
        ApiConfig.adminProducts,
        data: product.toJson(),
      );
    } on DioException catch (e) {
      throw Exception('Failed to create product: ${e.message}');
    }
  }

  Future<void> updateProduct(String productId, Product product) async {
    try {
      await _dio.put(
        '${ApiConfig.adminProducts}/$productId',
        data: product.toJson(),
      );
    } on DioException catch (e) {
      throw Exception('Failed to update product: ${e.message}');
    }
  }

  Future<void> deleteProduct(String productId) async {
    try {
      await _dio.delete('${ApiConfig.adminProducts}/$productId');
    } on DioException catch (e) {
      throw Exception('Failed to delete product: ${e.message}');
    }
  }

  // Admin - Categories
  Future<List<Category>> getCategories() async {
    try {
      final response = await _dio.get(ApiConfig.adminCategories);

      List<dynamic> categoriesData = response.data['data'] as List? ?? [];
      
      List<Category> categories = categoriesData
          .map((category) => Category.fromJson(category as Map<String, dynamic>))
          .toList();

      print('✓ Categories fetched: ${categories.length}');
      return categories;
    } on DioException catch (e) {
      print('✗ Error fetching categories: ${e.message}');
      throw Exception('Failed to fetch categories: ${e.message}');
    }
  }

  Future<void> createCategory(Category category) async {
    try {
      await _dio.post(
        ApiConfig.adminCategories,
        data: category.toJson(),
      );
    } on DioException catch (e) {
      throw Exception('Failed to create category: ${e.message}');
    }
  }

  Future<void> updateCategory(String categoryId, Category category) async {
    try {
      await _dio.put(
        '${ApiConfig.adminCategories}/$categoryId',
        data: category.toJson(),
      );
    } on DioException catch (e) {
      throw Exception('Failed to update category: ${e.message}');
    }
  }

  Future<void> deleteCategory(String categoryId) async {
    try {
      await _dio.delete('${ApiConfig.adminCategories}/$categoryId');
    } on DioException catch (e) {
      throw Exception('Failed to delete category: ${e.message}');
    }
  }

  // Admin - Users advanced
  Future<void> reactivateUser(String userId) async {
    try {
      await _dio.put(
        '${ApiConfig.adminUsers}/$userId/reactivate',
      );
    } on DioException catch (e) {
      throw Exception('Failed to reactivate user: ${e.message}');
    }
  }

  // Admin - Dashboard stats
  Future<DashboardStats> getDashboardStats() async {
    try {
      final response = await _dio.get(ApiConfig.adminDashboard);
      return DashboardStats.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw Exception('Failed to fetch stats: ${e.message}');
    }
  }

  bool get isAuthenticated => _token != null;
  String? get token => _token;
}
