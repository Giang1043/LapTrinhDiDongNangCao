import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/index.dart';
import '../providers/index.dart';
import '../widgets/form_dialogs.dart';

class UsersScreen extends StatefulWidget {
  const UsersScreen({Key? key}) : super(key: key);

  @override
  State<UsersScreen> createState() => _UsersScreenState();
}

class _UsersScreenState extends State<UsersScreen> {
  final _searchController = TextEditingController();
  String _filterRole = 'all';
  String _filterStatus = 'active';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<UsersProvider>().fetchUsers();
    });
  }

  void _confirmDeactivate(User user) {
    showDialog(
      context: context,
      builder: (context) => ConfirmDialog(
        title: 'Vô hiệu hóa tài khoản',
        message: 'Bạn chắc chắn muốn vô hiệu hóa tài khoản của "${user.fullName}"?',
        confirmText: 'Vô hiệu hóa',
        onConfirm: () async {
          try {
            await context.read<UsersProvider>().deactivateUser(user.id);
            if (mounted) {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('✓ Đã vô hiệu hóa tài khoản'),
                  backgroundColor: Colors.green,
                ),
              );
            }
          } catch (e) {
            if (mounted) {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('✗ Lỗi: ${e.toString().replaceFirst('Exception: ', '')}'),
                  backgroundColor: Colors.red,
                ),
              );
            }
          }
        },
      ),
    );
  }

  void _confirmReactivate(User user) {
    showDialog(
      context: context,
      builder: (context) => ConfirmDialog(
        title: 'Kích hoạt lại tài khoản',
        message: 'Bạn chắc chắn muốn kích hoạt lại tài khoản của "${user.fullName}"?',
        confirmText: 'Kích hoạt',
        onConfirm: () async {
          try {
            await context.read<UsersProvider>().reactivateUser(user.id);
            if (mounted) {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('✓ Đã kích hoạt lại tài khoản'),
                  backgroundColor: Colors.green,
                ),
              );
            }
          } catch (e) {
            if (mounted) {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('✗ Lỗi: ${e.toString().replaceFirst('Exception: ', '')}'),
                  backgroundColor: Colors.red,
                ),
              );
            }
          }
        },
      ),
    );
  }

  void _showUserDetails(User user) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Chi tiết người dùng'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildDetailRow('Tên:', user.fullName),
              _buildDetailRow('Email:', user.email),
              _buildDetailRow('Số điện thoại:', user.phone),
              _buildDetailRow('Vai trò:', user.role == 'admin' ? 'Quản trị viên' : 'Khách hàng'),
              _buildDetailRow('Trạng thái:', user.isActive ? 'Hoạt động' : 'Vô hiệu hóa'),
              _buildDetailRow('Ngày tạo:', user.createdAt.toString().split('.')[0]),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Đóng'),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF757575))),
          SizedBox(height: 4),
          Text(value, style: TextStyle(fontSize: 14)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Quản lý người dùng'),
        backgroundColor: Colors.white,
        foregroundColor: Color(0xFF212121),
        elevation: 1,
      ),
      backgroundColor: Color(0xFFFAFAFA),
      body: Consumer<UsersProvider>(
        builder: (context, usersProvider, _) {
          if (usersProvider.isLoading) {
            return Center(child: CircularProgressIndicator());
          }

          // Show error if any
          if (usersProvider.error != null && usersProvider.users.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.error_outline, size: 64, color: Colors.red),
                  SizedBox(height: 16),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 32),
                    child: Text(
                      'Lỗi: ${usersProvider.error}',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.red),
                    ),
                  ),
                  SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => context.read<UsersProvider>().fetchUsers(),
                    child: Text('Thử lại'),
                  ),
                ],
              ),
            );
          }

          var filteredUsers = usersProvider.users;

          if (_filterRole != 'all') {
            filteredUsers = filteredUsers
                .where((user) => user.role == _filterRole)
                .toList();
          }

          if (_filterStatus == 'active') {
            filteredUsers = filteredUsers
                .where((user) => user.isActive)
                .toList();
          } else if (_filterStatus == 'inactive') {
            filteredUsers = filteredUsers
                .where((user) => !user.isActive)
                .toList();
          }

          if (_searchController.text.isNotEmpty) {
            filteredUsers = filteredUsers
                .where((user) =>
                    user.fullName.toLowerCase().contains(_searchController.text.toLowerCase()) ||
                    user.email.toLowerCase().contains(_searchController.text.toLowerCase()))
                .toList();
          }

          return SingleChildScrollView(
            child: Column(
              children: [
                Padding(
                  padding: EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      TextField(
                        controller: _searchController,
                        onChanged: (_) => setState(() {}),
                        decoration: InputDecoration(
                          hintText: 'Tìm kiếm theo tên hoặc email...',
                          prefixIcon: Icon(Icons.search, color: Color(0xFF1976D2)),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          contentPadding: EdgeInsets.symmetric(vertical: 12),
                        ),
                      ),
                      SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: DropdownButton<String>(
                              value: _filterRole,
                              isExpanded: true,
                              items: [
                                DropdownMenuItem(value: 'all', child: Text('Tất cả vai trò')),
                                DropdownMenuItem(value: 'admin', child: Text('Quản trị viên')),
                                DropdownMenuItem(value: 'customer', child: Text('Khách hàng')),
                              ],
                              onChanged: (value) => setState(() => _filterRole = value ?? 'all'),
                            ),
                          ),
                          SizedBox(width: 12),
                          Expanded(
                            child: DropdownButton<String>(
                              value: _filterStatus,
                              isExpanded: true,
                              items: [
                                DropdownMenuItem(value: 'all', child: Text('Tất cả')),
                                DropdownMenuItem(value: 'active', child: Text('Hoạt động')),
                                DropdownMenuItem(value: 'inactive', child: Text('Vô hiệu hóa')),
                              ],
                              onChanged: (value) => setState(() => _filterStatus = value ?? 'active'),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                if (filteredUsers.isEmpty)
                  Padding(
                    padding: EdgeInsets.all(32),
                    child: Column(
                      children: [
                        Icon(Icons.people_outline, size: 64, color: Color(0xFFBDBDBD)),
                        SizedBox(height: 16),
                        Text('Không có người dùng'),
                      ],
                    ),
                  )
                else
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    child: Column(
                      children: [
                        ...filteredUsers.map((user) {
                          return Card(
                            margin: EdgeInsets.only(bottom: 12),
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: user.isActive ? Color(0xFF1976D2) : Color(0xFFBDBDBD),
                                child: Icon(
                                  user.role == 'admin' ? Icons.admin_panel_settings : Icons.person,
                                  color: Colors.white,
                                ),
                              ),
                              title: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    user.fullName,
                                    style: TextStyle(fontWeight: FontWeight.bold),
                                  ),
                                  SizedBox(height: 4),
                                  Text(
                                    user.email,
                                    style: TextStyle(fontSize: 12, color: Color(0xFF757575)),
                                  ),
                                ],
                              ),
                              subtitle: Chip(
                                label: Text(
                                  user.isActive ? 'Hoạt động' : 'Vô hiệu hóa',
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                backgroundColor: user.isActive ? Colors.green : Colors.red,
                              ),
                              trailing: PopupMenuButton(
                                itemBuilder: (context) {
                                  final currentUser = context.read<AuthProvider>().currentUser;
                                  final isSelf = user.id == currentUser?.id;
                                  return [
                                    PopupMenuItem(
                                      child: Row(
                                        children: [Icon(Icons.info, size: 18), SizedBox(width: 8), Text('Chi tiết')],
                                      ),
                                      value: 'details',
                                    ),
                                    if (user.isActive && !isSelf)
                                      PopupMenuItem(
                                        child: Row(
                                          children: [
                                            Icon(Icons.block, size: 18, color: Colors.red),
                                            SizedBox(width: 8),
                                            Text('Vô hiệu hóa', style: TextStyle(color: Colors.red))
                                          ],
                                        ),
                                        value: 'deactivate',
                                      )
                                    else if (!user.isActive)
                                      PopupMenuItem(
                                        child: Row(
                                          children: [
                                            Icon(Icons.check_circle, size: 18, color: Colors.green),
                                            SizedBox(width: 8),
                                            Text('Kích hoạt', style: TextStyle(color: Colors.green))
                                          ],
                                        ),
                                        value: 'reactivate',
                                      ),
                                  ];
                                },
                                onSelected: (value) {
                                  if (value == 'details') {
                                    _showUserDetails(user);
                                  } else if (value == 'deactivate') {
                                    _confirmDeactivate(user);
                                  } else if (value == 'reactivate') {
                                    _confirmReactivate(user);
                                  }
                                },
                              ),
                            ),
                          );
                        }).toList(),
                        SizedBox(height: 16),
                      ],
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}
