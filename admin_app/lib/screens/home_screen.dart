import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/index.dart';
import 'dashboard_screen.dart';
import 'orders_screen.dart';
import 'products_screen.dart';
import 'users_screen.dart';
import 'categories_screen.dart';
import 'profile_screen.dart';
import 'settings_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    // Load initial data with delay to ensure token is initialized
    WidgetsBinding.instance.addPostFrameCallback((_) {
      // Only load non-dashboard data - Dashboard will load on-demand
      context.read<ProductsProvider>().fetchProducts();
      context.read<ProductsProvider>().fetchCategories();
      context.read<OrdersProvider>().fetchOrders();
      context.read<UsersProvider>().fetchUsers();
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accentColor = isDark ? Color(0xFF6366F1) : Color(0xFF1976D2);
    final textColor = isDark ? Color(0xFFE0E0E0) : Color(0xFF212121);
    
    return Scaffold(
      key: _scaffoldKey,
      appBar: AppBar(
        backgroundColor: Theme.of(context).appBarTheme.backgroundColor,
        elevation: Theme.of(context).appBarTheme.elevation ?? 0,
        scrolledUnderElevation: 0,
        surfaceTintColor: Colors.transparent,
        leading: Container(
          margin: const EdgeInsets.only(left: 8),
          child: IconButton(
            icon: Icon(Icons.menu, color: accentColor, size: 26),
            onPressed: () => _scaffoldKey.currentState?.openDrawer(),
            splashRadius: 24,
          ),
        ),
        title: Text(
          _getTitleForIndex(_selectedIndex),
          style: TextStyle(
            color: accentColor,
            fontSize: 18,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.3,
          ),
        ),
        centerTitle: true,
        actions: [
          // Theme toggle button
          Consumer<ThemeProvider>(
            builder: (context, themeProvider, _) {
              return Tooltip(
                message: themeProvider.isDarkMode ? 'Light Mode' : 'Dark Mode',
                child: Container(
                  margin: const EdgeInsets.only(right: 8),
                  child: IconButton(
                    icon: Icon(
                      themeProvider.isDarkMode ? Icons.light_mode : Icons.dark_mode,
                      color: accentColor,
                      size: 22,
                    ),
                    onPressed: () => themeProvider.toggleTheme(),
                    splashRadius: 24,
                  ),
                ),
              );
            },
          ),
          // Profile button
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: Consumer<AuthProvider>(
              builder: (context, authProvider, _) {
                return GestureDetector(
                  onTap: () {
                    setState(() => _selectedIndex = 7);
                  },
                  child: Tooltip(
                    message: 'Hồ sơ cá nhân',
                    child: Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: accentColor,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: accentColor.withOpacity(0.3),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.admin_panel_settings,
                        color: Colors.white,
                        size: 20,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
      drawer: _buildDrawer(),
      body: _buildContent(),
    );
  }

  Widget _buildDrawer() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? Color(0xFF121212) : Colors.white;
    final cardBg = isDark ? Color(0xFF1E1E1E) : Color(0xFFF5F5F5);
    final dividerColor = isDark ? Color(0xFF2C2C2C) : Color(0xFFE0E0E0);
    final textPrimary = isDark ? Color(0xFFE0E0E0) : Color(0xFF212121);
    final textSecondary = isDark ? Color(0xFFA0A0A0) : Color(0xFF757575);
    final accentColor = isDark ? Color(0xFF6366F1) : Color(0xFF1976D2);
    
    return Drawer(
      backgroundColor: bgColor,
      shape: const RoundedRectangleBorder(),
      child: Column(
        children: [
          // Enhanced Drawer Header with gradient background
          Container(
            decoration: BoxDecoration(
              color: cardBg,
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(16),
                bottomRight: Radius.circular(16),
              ),
              border: Border(
                bottom: BorderSide(color: dividerColor, width: 1),
              ),
            ),
            padding: const EdgeInsets.fromLTRB(16, 24, 16, 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // App Icon & Name
                Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: accentColor,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.restaurant, color: Colors.white, size: 24),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Food App',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                              color: textPrimary,
                              letterSpacing: 0.5,
                            ),
                          ),
                          Text(
                            'Admin Panel',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w500,
                              color: textSecondary,
                              letterSpacing: 0.3,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                // Subtitle
                Text(
                  'Quản lý nhà hàng',
                  style: TextStyle(
                    fontSize: 12,
                    color: textSecondary,
                    fontWeight: FontWeight.w400,
                  ),
                ),
              ],
            ),
          ),
          
          // Menu items
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
              children: [
                _buildSectionLabel('MENU'),
                _buildDrawerItem(
                  icon: Icons.dashboard,
                  label: 'Dashboard',
                  index: 0,
                  accentColor: accentColor,
                  isDark: isDark,
                ),
                _buildDrawerItem(
                  icon: Icons.inventory_2,
                  label: 'Sản phẩm',
                  index: 1,
                  accentColor: accentColor,
                  isDark: isDark,
                ),
                _buildDrawerItem(
                  icon: Icons.category,
                  label: 'Danh mục',
                  index: 2,
                  accentColor: accentColor,
                  isDark: isDark,
                ),
                _buildDrawerItem(
                  icon: Icons.receipt_long,
                  label: 'Đơn hàng',
                  index: 3,
                  accentColor: accentColor,
                  isDark: isDark,
                ),
                _buildDrawerItem(
                  icon: Icons.local_offer,
                  label: 'Mã giảm giá',
                  index: 4,
                  accentColor: accentColor,
                  isDark: isDark,
                ),
                _buildDrawerItem(
                  icon: Icons.people,
                  label: 'Người dùng',
                  index: 5,
                  accentColor: accentColor,
                  isDark: isDark,
                ),
                const SizedBox(height: 8),
                _buildSectionLabel('SYSTEM'),
                _buildDrawerItem(
                  icon: Icons.person,
                  label: 'Hồ sơ',
                  index: 6,
                  accentColor: accentColor,
                  isDark: isDark,
                ),
                _buildDrawerItem(
                  icon: Icons.settings,
                  label: 'Cài đặt',
                  index: 7,
                  accentColor: accentColor,
                  isDark: isDark,
                ),
              ],
            ),
          ),
          
          // Logout button at bottom
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              border: Border(
                top: BorderSide(color: dividerColor, width: 1),
              ),
            ),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.red.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: ListTile(
                leading: Icon(Icons.logout, color: Colors.red, size: 20),
                title: Text(
                  'Đăng xuất',
                  style: TextStyle(
                    color: Colors.red,
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                onTap: () {
                  showDialog(
                    context: context,
                    builder: (ctx) => AlertDialog(
                      backgroundColor: cardBg,
                      title: Text('Đăng xuất?', style: TextStyle(color: textPrimary)),
                      content: Text('Bạn chắc chắn muốn đăng xuất?', style: TextStyle(color: textSecondary)),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(ctx),
                          child: Text('Hủy', style: TextStyle(color: accentColor)),
                        ),
                        TextButton(
                          onPressed: () {
                            Navigator.pop(ctx);
                            context.read<AuthProvider>().logout();
                          },
                          child: const Text('Đăng xuất', style: TextStyle(color: Colors.red)),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildSectionLabel(String label) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textSecondary = isDark ? Color(0xFFA0A0A0) : Color(0xFF757575);
    
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: textSecondary,
          letterSpacing: 1,
        ),
      ),
    );
  }

  Widget _buildDrawerItem({
    required IconData icon,
    required String label,
    required int index,
    required Color accentColor,
    required bool isDark,
  }) {
    bool isSelected = _selectedIndex == index;
    final textPrimary = isDark ? Color(0xFFE0E0E0) : Color(0xFF212121);
    final textSecondary = isDark ? Color(0xFFA0A0A0) : Color(0xFF757575);
    final bgSelected = isDark 
      ? accentColor.withOpacity(0.15) 
      : accentColor.withOpacity(0.08);
    
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () {
            setState(() => _selectedIndex = index);
            Navigator.pop(context);
          },
          child: Container(
            decoration: BoxDecoration(
              color: isSelected ? bgSelected : Colors.transparent,
              borderRadius: BorderRadius.circular(12),
              border: isSelected
                ? Border.all(color: accentColor, width: 1)
                : null,
            ),
            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
            child: Row(
              children: [
                Icon(
                  icon,
                  color: isSelected ? accentColor : textSecondary,
                  size: 22,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    label,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                      color: isSelected ? accentColor : textPrimary,
                      letterSpacing: 0.2,
                    ),
                  ),
                ),
                if (isSelected)
                  Container(
                    width: 4,
                    height: 20,
                    decoration: BoxDecoration(
                      color: accentColor,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  String _getTitleForIndex(int index) {
    switch (index) {
      case 0:
        return 'Dashboard';
      case 1:
        return 'Quản lý Sản phẩm';
      case 2:
        return 'Danh mục sản phẩm';
      case 3:
        return 'Quản lý Đơn hàng';
      case 4:
        return 'Mã giảm giá';
      case 5:
        return 'Người dùng';
      case 6:
        return 'Hồ sơ cá nhân';
      case 7:
        return 'Cài đặt';
      default:
        return 'FoodApp Admin';
    }
  }

  Widget _buildContent() {
    switch (_selectedIndex) {
      case 0:
        return DashboardScreen(
          onNavigate: (index) {
            setState(() => _selectedIndex = index);
          },
        );
      case 1:
        return const ProductsScreen();
      case 2:
        return CategoriesScreen();
      case 3:
        return const OrdersScreen();
      case 4:
        return Center(
          child: Text('Mã giảm giá chưa được triển khai'),
        );
      case 5:
        return const UsersScreen();
      case 6:
        return ProfileScreen();
      case 7:
        return SettingsScreen();
      default:
        return const DashboardScreen();
    }
  }
}
