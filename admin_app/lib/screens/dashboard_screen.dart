import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/index.dart';

typedef OnNavigate = void Function(int);

class DashboardScreen extends StatefulWidget {
  final OnNavigate? onNavigate;

  const DashboardScreen({Key? key, this.onNavigate}) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    // Load stats when screen is displayed
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DashboardProvider>().fetchStats();
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textSecondary = isDark ? Color(0xFFA0A0A0) : Color(0xFF757575);
    
    return RefreshIndicator(
      onRefresh: () => context.read<DashboardProvider>().fetchStats(),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Consumer<DashboardProvider>(
            builder: (context, dashboardProvider, _) {
              if (dashboardProvider.isLoading) {
                return const Center(
                  child: CircularProgressIndicator(),
                );
              }

              final stats = dashboardProvider.stats;
              if (stats == null) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error, size: 48, color: Colors.red),
                      const SizedBox(height: 16),
                      Text(dashboardProvider.error ?? 'Failed to load stats'),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () =>
                            dashboardProvider.fetchStats(),
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                );
              }

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Welcome message
                  Consumer<AuthProvider>(
                    builder: (context, authProvider, _) {
                      return Text(
                        'Welcome back, ${authProvider.currentUser?.fullName ?? 'Admin'}!',
                        style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.5,
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Here\'s what\'s happening with your store today.',
                    style: TextStyle(
                      fontSize: 14,
                      color: textSecondary,
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Stats Grid
                  GridView.count(
                    crossAxisCount: 2,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    children: [
                      _StatCard(
                        title: 'Total Orders',
                        value: stats.totalOrders.toString(),
                        subtitle: '${stats.ordersToday} today',
                        icon: Icons.receipt_long,
                        color: Colors.blue,
                      ),
                      _StatCard(
                        title: 'Total Users',
                        value: stats.totalUsers.toString(),
                        subtitle: '${stats.newUsersToday} new today',
                        icon: Icons.people,
                        color: Colors.green,
                      ),
                      _StatCard(
                        title: 'Products',
                        value: stats.totalProducts.toString(),
                        subtitle: 'In catalog',
                        icon: Icons.inventory,
                        color: Colors.orange,
                      ),
                      _StatCard(
                        title: 'Revenue',
                        value: '${(stats.totalRevenue / 1000000).toStringAsFixed(1)}M',
                        subtitle: 'VNĐ Total',
                        icon: Icons.trending_up,
                        color: Colors.purple,
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),

                  // Quick actions
                  Text(
                    'Quick Actions',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.3,
                    ),
                  ),
                  const SizedBox(height: 16),
                  GridView.count(
                    crossAxisCount: 2,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    children: [
                      _ActionCard(
                        title: 'View Orders',
                        icon: Icons.receipt_long,
                        color: Colors.blue,
                        onTap: () {
                          widget.onNavigate?.call(3); // OrdersScreen index
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Đang tải danh sách đơn hàng...')),
                          );
                        },
                      ),
                      _ActionCard(
                        title: 'Manage Products',
                        icon: Icons.inventory,
                        color: Colors.orange,
                        onTap: () {
                          widget.onNavigate?.call(1); // ProductsScreen index
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Đang tải quản lý sản phẩm...')),
                          );
                        },
                      ),
                      _ActionCard(
                        title: 'View Users',
                        icon: Icons.people,
                        color: Colors.green,
                        onTap: () {
                          widget.onNavigate?.call(5); // UsersScreen index
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Đang tải danh sách người dùng...')),
                          );
                        },
                      ),
                      _ActionCard(
                        title: 'Settings',
                        icon: Icons.settings,
                        color: Colors.grey,
                        onTap: () {
                          widget.onNavigate?.call(7); // SettingsScreen index
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Đang tải cài đặt...')),
                          );
                        },
                      ),
                    ],
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final String subtitle;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.title,
    required this.value,
    required this.subtitle,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgCard = isDark ? Color(0xFF1E1E1E) : Colors.white;
    final textPrimary = isDark ? Color(0xFFE0E0E0) : Color(0xFF212121);
    final textSecondary = isDark ? Color(0xFFA0A0A0) : Color(0xFF757575);
    final dividerColor = isDark ? Color(0xFF2C2C2C) : Color(0xFFE0E0E0);
    
    return Container(
      decoration: BoxDecoration(
        color: bgCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: dividerColor, width: 1),
        boxShadow: [
          BoxShadow(
            color: isDark 
              ? Colors.black.withOpacity(0.3)
              : Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      padding: const EdgeInsets.all(16.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Icon Container with gradient background
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          
          // Stats Info
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontSize: 12,
                  color: textSecondary,
                  fontWeight: FontWeight.w500,
                  letterSpacing: 0.3,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                value,
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w700,
                  color: textPrimary,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                subtitle,
                style: TextStyle(
                  fontSize: 11,
                  color: textSecondary,
                  fontWeight: FontWeight.w400,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ActionCard extends StatefulWidget {
  final String title;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _ActionCard({
    required this.title,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  State<_ActionCard> createState() => _ActionCardState();
}

class _ActionCardState extends State<_ActionCard> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  
  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 150),
      vsync: this,
    );
  }
  
  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgCard = isDark ? Color(0xFF1E1E1E) : Colors.white;
    final textPrimary = isDark ? Color(0xFFE0E0E0) : Color(0xFF212121);
    final dividerColor = isDark ? Color(0xFF2C2C2C) : Color(0xFFE0E0E0);
    
    return GestureDetector(
      onTapDown: (_) {
        _controller.forward();
      },
      onTapUp: (_) {
        _controller.reverse();
        widget.onTap();
      },
      onTapCancel: () {
        _controller.reverse();
      },
      child: ScaleTransition(
        scale: Tween<double>(begin: 1.0, end: 0.96).animate(
          CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
        ),
        child: Container(
          decoration: BoxDecoration(
            color: bgCard,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: dividerColor, width: 1),
            boxShadow: [
              BoxShadow(
                color: isDark 
                  ? Colors.black.withOpacity(0.3)
                  : Colors.black.withOpacity(0.05),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: widget.onTap,
              borderRadius: BorderRadius.circular(16),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Icon with background
                    Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(
                        color: widget.color.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Icon(
                        widget.icon,
                        size: 28,
                        color: widget.color,
                      ),
                    ),
                    const SizedBox(height: 12),
                    // Title
                    Text(
                      widget.title,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: textPrimary,
                        letterSpacing: 0.2,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
