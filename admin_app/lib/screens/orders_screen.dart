import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/index.dart';
import '../providers/index.dart';
import '../widgets/form_dialogs.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({Key? key}) : super(key: key);

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  final _searchController = TextEditingController();
  String _filterStatus = 'all';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<OrdersProvider>().fetchOrders();
    });
  }

  String _getStatusLabel(String status) {
    const labels = {
      'pending': 'Chờ xử lý',
      'confirmed': 'Đã xác nhận',
      'preparing': 'Đang chuẩn bị',
      'shipping': 'Đang giao',
      'delivered': 'Đã giao',
      'cancelled': 'Đã hủy',
    };
    return labels[status] ?? status;
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'pending':
        return Colors.orange;
      case 'confirmed':
        return Colors.blue;
      case 'preparing':
        return Colors.purple;
      case 'shipping':
        return Colors.cyan;
      case 'delivered':
        return Colors.green;
      case 'cancelled':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  void _showStatusUpdate(Order order) {
    showDialog(
      context: context,
      builder: (context) => StatusUpdateDialog(
        currentStatus: order.status,
        onStatusChange: (newStatus) async {
          try {
            await context.read<OrdersProvider>().updateOrderStatus(order.id, newStatus);
            // Dialog closes automatically via Navigator.pop in dialog
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('✓ Đã cập nhật trạng thái đơn hàng'),
                  backgroundColor: Colors.green,
                ),
              );
            }
          } catch (e) {
            if (mounted) {
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Quản lý đơn hàng'),
        backgroundColor: Colors.white,
        foregroundColor: Color(0xFF212121),
        elevation: 1,
      ),
      backgroundColor: Color(0xFFFAFAFA),
      body: Consumer<OrdersProvider>(
        builder: (context, ordersProvider, _) {
          if (ordersProvider.isLoading) {
            return Center(child: CircularProgressIndicator());
          }

          var filteredOrders = ordersProvider.orders;

          if (_filterStatus != 'all') {
            filteredOrders = filteredOrders
                .where((order) => order.status == _filterStatus)
                .toList();
          }

          if (_searchController.text.isNotEmpty) {
            filteredOrders = filteredOrders
                .where((order) => order.orderNumber
                    .toLowerCase()
                    .contains(_searchController.text.toLowerCase()))
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
                          hintText: 'Tìm kiếm mã đơn hàng...',
                          prefixIcon: Icon(Icons.search, color: Color(0xFF1976D2)),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          contentPadding: EdgeInsets.symmetric(vertical: 12),
                        ),
                      ),
                      SizedBox(height: 16),
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: [
                            _buildFilterChip('all', 'Tất cả'),
                            _buildFilterChip('pending', 'Chờ xử lý'),
                            _buildFilterChip('confirmed', 'Đã xác nhận'),
                            _buildFilterChip('preparing', 'Đang chuẩn bị'),
                            _buildFilterChip('shipping', 'Đang giao'),
                            _buildFilterChip('delivered', 'Đã giao'),
                            _buildFilterChip('cancelled', 'Đã hủy'),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                if (filteredOrders.isEmpty)
                  Padding(
                    padding: EdgeInsets.all(32),
                    child: Column(
                      children: [
                        Icon(Icons.shopping_bag_outlined, size: 64, color: Color(0xFFBDBDBD)),
                        SizedBox(height: 16),
                        Text('Không có đơn hàng'),
                      ],
                    ),
                  )
                else
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    child: Column(
                      children: [
                        ...filteredOrders.map((order) {
                          return Card(
                            margin: EdgeInsets.only(bottom: 12),
                            child: ListTile(
                              leading: Container(
                                padding: EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: _getStatusColor(order.status),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Icon(Icons.receipt, color: Colors.white),
                              ),
                              title: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '#${order.orderNumber}',
                                    style: TextStyle(fontWeight: FontWeight.bold),
                                  ),
                                  SizedBox(height: 4),
                                  Chip(
                                    label: Text(
                                      _getStatusLabel(order.status),
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    backgroundColor: _getStatusColor(order.status),
                                  ),
                                ],
                              ),
                              subtitle: Text('${order.totalAmount.toStringAsFixed(0)} VNĐ'),
                              trailing: PopupMenuButton(
                                itemBuilder: (context) => [
                                  PopupMenuItem(
                                    child: Row(
                                      children: [Icon(Icons.edit, size: 18), SizedBox(width: 8), Text('Cập nhật')],
                                    ),
                                    value: 'update',
                                  ),
                                  PopupMenuItem(
                                    child: Row(
                                      children: [Icon(Icons.visibility, size: 18), SizedBox(width: 8), Text('Chi tiết')],
                                    ),
                                    value: 'details',
                                  ),
                                ],
                                onSelected: (value) {
                                  if (value == 'update') {
                                    _showStatusUpdate(order);
                                  } else if (value == 'details') {
                                    _showOrderDetails(order);
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

  Widget _buildFilterChip(String value, String label) {
    return Padding(
      padding: EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: _filterStatus == value,
        onSelected: (_) => setState(() => _filterStatus = value),
        backgroundColor: Colors.white,
        selectedColor: Color(0xFF1976D2),
        labelStyle: TextStyle(
          color: _filterStatus == value ? Colors.white : Color(0xFF212121),
        ),
      ),
    );
  }

  void _showOrderDetails(Order order) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Chi tiết đơn hàng #${order.orderNumber}'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Trạng thái: ${_getStatusLabel(order.status)}', style: TextStyle(fontWeight: FontWeight.bold)),
              SizedBox(height: 12),
              Text('Ngày tạo: ${order.createdAt.toString().split('.')[0]}'),
              SizedBox(height: 12),
              Text('Tổng tiền: ${order.totalAmount.toStringAsFixed(0)} VNĐ', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1976D2))),
              SizedBox(height: 16),
              Text('Sản phẩm:', style: TextStyle(fontWeight: FontWeight.bold)),
              ...order.items.map((item) {
                return Padding(
                  padding: EdgeInsets.only(top: 8),
                  child: Text('• ${item.productName} x${item.quantity} - ${item.price.toStringAsFixed(0)} VNĐ/cái'),
                );
              }).toList(),
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

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}
