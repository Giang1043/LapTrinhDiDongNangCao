import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/index.dart';
import '../services/api_service.dart';

// Theme Provider
class ThemeProvider extends ChangeNotifier {
  bool _isDarkMode = false;

  bool get isDarkMode => _isDarkMode;

  ThemeProvider() {
    _loadThemePreference();
  }

  Future<void> _loadThemePreference() async {
    final prefs = await SharedPreferences.getInstance();
    _isDarkMode = prefs.getBool('isDarkMode') ?? false;
    notifyListeners();
  }

  Future<void> toggleTheme() async {
    _isDarkMode = !_isDarkMode;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('isDarkMode', _isDarkMode);
    notifyListeners();
  }
}

// Auth Provider
class AuthProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  User? _currentUser;
  bool _isLoading = false;
  String? _error;

  User? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _apiService.isAuthenticated;

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.login(email, password);
      _currentUser = User.fromJson(response['user']);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _apiService.logout();
    _currentUser = null;
    notifyListeners();
  }
}

// Orders Provider
class OrdersProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  List<Order> _orders = [];
  Order? _selectedOrder;
  bool _isLoading = false;
  String? _error;
  int _currentPage = 1;

  List<Order> get orders => _orders;
  Order? get selectedOrder => _selectedOrder;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchOrders({int page = 1}) async {
    _isLoading = true;
    _error = null;
    _currentPage = page;
    notifyListeners();

    try {
      _orders = await _apiService.getOrders(page: page);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> selectOrder(String orderId) async {
    _isLoading = true;
    notifyListeners();

    try {
      _selectedOrder = await _apiService.getOrderDetail(orderId);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateOrderStatus(String orderId, String status) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _apiService.updateOrderStatus(orderId, status);
      await fetchOrders(page: _currentPage);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      rethrow; // Re-throw to allow caller to handle error
    }
  }
}

// Products Provider
class ProductsProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  List<Product> _products = [];
  List<Category> _categories = [];
  bool _isLoading = false;
  String? _error;

  List<Product> get products => _products;
  List<Category> get categories => _categories;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchProducts({int page = 1}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _products = await _apiService.getProducts(page: page);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchCategories() async {
    try {
      _categories = await _apiService.getCategories();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> createProduct(Product product) async {
    _isLoading = true;
    notifyListeners();

    try {
      await _apiService.createProduct(product);
      await fetchProducts();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateProduct(String productId, Product product) async {
    try {
      await _apiService.updateProduct(productId, product);
      await fetchProducts();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> deleteProduct(String productId) async {
    try {
      await _apiService.deleteProduct(productId);
      await fetchProducts();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> createCategory(Category category) async {
    _isLoading = true;
    notifyListeners();

    try {
      await _apiService.createCategory(category);
      await fetchCategories();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateCategory(String categoryId, Category category) async {
    try {
      await _apiService.updateCategory(categoryId, category);
      await fetchCategories();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> deleteCategory(String categoryId) async {
    try {
      await _apiService.deleteCategory(categoryId);
      await fetchCategories();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }
}

// Users Provider
class UsersProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  List<User> _users = [];
  bool _isLoading = false;
  String? _error;

  List<User> get users => _users;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchUsers({int page = 1}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    print('🔄 UsersProvider: Fetching users...');

    try {
      _users = await _apiService.getUsers(page: page);
      print('✅ UsersProvider: Loaded ${_users.length} users');
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      print('❌ UsersProvider: Error - $e');
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> deactivateUser(String userId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _apiService.deactivateUser(userId);
      await fetchUsers();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      rethrow; // Re-throw to allow caller to handle error
    }
  }

  Future<void> reactivateUser(String userId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _apiService.reactivateUser(userId);
      await fetchUsers();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      rethrow; // Re-throw to allow caller to handle error
    }
  }
}

// Dashboard Provider
class DashboardProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  DashboardStats? _stats;
  bool _isLoading = false;
  String? _error;

  DashboardStats? get stats => _stats;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchStats() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _stats = await _apiService.getDashboardStats();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }
}
