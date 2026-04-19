import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/index.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({Key? key}) : super(key: key);

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> with SingleTickerProviderStateMixin {
  bool _notificationsEnabled = true;
  late AnimationController _animationController;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textTheme = Theme.of(context).textTheme;
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: Text('Cài đặt', style: textTheme.headlineSmall),
        elevation: 0,
        scrolledUnderElevation: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(height: 12),
            
            // Notifications Section
            _SectionHeader(title: 'THÔNG BÁO', isDark: isDark),
            _SettingItem(
              context: context,
              icon: Icons.notifications_outlined,
              title: 'Bật thông báo',
              subtitle: 'Nhận thông báo về đơn hàng và cập nhật khác',
              isDark: isDark,
              trailing: _AnimatedSwitch(
                value: _notificationsEnabled,
                onChanged: (value) {
                  setState(() => _notificationsEnabled = value);
                },
              ),
            ),
            SizedBox(height: 24),
            
            // Display Section
            _SectionHeader(title: 'HIỂN THỊ', isDark: isDark),
            Consumer<ThemeProvider>(
              builder: (context, themeProvider, _) {
                return _SettingItem(
                  context: context,
                  icon: Icons.dark_mode_outlined,
                  title: 'Chế độ tối',
                  subtitle: 'Sử dụng giao diện tối vào ban đêm',
                  isDark: isDark,
                  trailing: _AnimatedSwitch(
                    value: themeProvider.isDarkMode,
                    onChanged: (value) {
                      themeProvider.toggleTheme();
                    },
                  ),
                );
              },
            ),
            SizedBox(height: 24),
            
            // Info Section
            _SectionHeader(title: 'THÔNG TIN', isDark: isDark),
            _InfoCard(
              isDark: isDark,
              colorScheme: colorScheme,
              textTheme: textTheme,
            ),
            SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}

// Section Header Widget
class _SectionHeader extends StatelessWidget {
  final String title;
  final bool isDark;

  const _SectionHeader({
    required this.title,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.bold,
          color: isDark ? Color(0xFFA0A0A0) : Color(0xFF757575),
          letterSpacing: 1.2,
        ),
      ),
    );
  }
}

// Setting Item Widget
class _SettingItem extends StatelessWidget {
  final BuildContext context;
  final IconData icon;
  final String title;
  final String subtitle;
  final bool isDark;
  final Widget trailing;

  const _SettingItem({
    required this.context,
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.isDark,
    required this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {},
        splashColor: colorScheme.primary.withOpacity(0.1),
        highlightColor: colorScheme.primary.withOpacity(0.05),
        child: Container(
          margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: colorScheme.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  icon,
                  color: colorScheme.primary,
                  size: 24,
                ),
              ),
              SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w500,
                        color: isDark ? Color(0xFFE0E0E0) : Color(0xFF212121),
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      subtitle,
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark ? Color(0xFFA0A0A0) : Color(0xFF757575),
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(width: 12),
              trailing,
            ],
          ),
        ),
      ),
    );
  }
}

// Animated Switch Widget
class _AnimatedSwitch extends StatefulWidget {
  final bool value;
  final ValueChanged<bool> onChanged;

  const _AnimatedSwitch({
    required this.value,
    required this.onChanged,
  });

  @override
  State<_AnimatedSwitch> createState() => _AnimatedSwitchState();
}

class _AnimatedSwitchState extends State<_AnimatedSwitch>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
      value: widget.value ? 1.0 : 0.0,
    );
  }

  @override
  void didUpdateWidget(_AnimatedSwitch oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.value != oldWidget.value) {
      if (widget.value) {
        _controller.forward();
      } else {
        _controller.reverse();
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    
    return GestureDetector(
      onTap: () => widget.onChanged(!widget.value),
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return Container(
            width: 52,
            height: 32,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              color: Color.lerp(
                Color(0xFF2C2C2C),
                colorScheme.primary,
                _controller.value,
              ),
              border: Border.all(
                color: Color.lerp(
                  Color(0xFF3C3C3C),
                  colorScheme.primary,
                  _controller.value,
                ) ??
                    Colors.transparent,
                width: 0,
              ),
            ),
            child: Stack(
              alignment: Alignment.center,
              children: [
                Positioned(
                  left: 4 + (24 * _controller.value),
                  child: Container(
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: _controller.value > 0.5
                          ? Colors.white
                          : Color(0xFF666666),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black26,
                          blurRadius: 4,
                          offset: Offset(0, 2),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

// Info Card Widget
class _InfoCard extends StatelessWidget {
  final bool isDark;
  final ColorScheme colorScheme;
  final TextTheme textTheme;

  const _InfoCard({
    required this.isDark,
    required this.colorScheme,
    required this.textTheme,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDark ? Color(0xFF2C2C2C) : Color(0xFFE0E0E0),
          width: 1,
        ),
      ),
      child: Column(
        children: [
          _InfoRow(
            label: 'Phiên bản ứng dụng',
            value: '1.0.0',
            isDark: isDark,
            colorScheme: colorScheme,
            showBorder: true,
          ),
          _InfoRow(
            label: 'Ngôn ngữ',
            value: 'Tiếng Việt',
            isDark: isDark,
            colorScheme: colorScheme,
            showBorder: false,
          ),
        ],
      ),
    );
  }
}

// Info Row Widget
class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isDark;
  final ColorScheme colorScheme;
  final bool showBorder;

  const _InfoRow({
    required this.label,
    required this.value,
    required this.isDark,
    required this.colorScheme,
    required this.showBorder,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: isDark ? Color(0xFFE0E0E0) : Color(0xFF212121),
                ),
              ),
              Text(
                value,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: colorScheme.primary,
                  letterSpacing: 0.3,
                ),
              ),
            ],
          ),
        ),
        if (showBorder)
          Container(
            color: isDark ? Color(0xFF2C2C2C) : Color(0xFFE0E0E0),
            height: 1,
          ),
      ],
    );
  }
}
