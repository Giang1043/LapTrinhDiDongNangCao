import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../models/index.dart';
import '../providers/index.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({Key? key}) : super(key: key);

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  String _selectedStatus = 'all';
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<OrdersProvider>().fetchOrders();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFFAFAFA),
      body: Consumer<OrdersProvider>(
        builder: (context, ordersProvider, _) {
          if (ordersProvider.isLoading) {
            return Center(child: CircularProgressIndicator());
          }

          // Filter orders by status
          List<Order> filteredOrders = ordersProvider.orders;
          if (_selectedStatus != 'all') {
            filteredOrders = filteredOrders
                .where((order) => order.status.toLowerCase() == _selectedStatus)
                .toList();
          }

          // Filter by search
          if (_searchController.text.isNotEmpty) {
            filteredOrders = filteredOrders
                .where((order) =>
                    order.orderNumber.toLowerCase().contains(
                        _searchController.text.toLowerCase()))
                .toList();
          }

          return RefreshIndicator(
            onRefresh: () => context.read<OrdersProvider>().fetchOrders(),
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Search field
                        TextField(
                          controller: _searchController,
                          onChanged: (_) => setState(() {}),
                          decoration: InputDecoration(
                            hintText: 'Tìm kiếm đơn hàng...',
                            prefixIcon: Icon(Icons.search,
                                color: Color(0xFF1976D2)),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide:
                                  BorderSide(color: Color(0xFFE0E0E0)),
                            ),
                            contentPadding:
                                EdgeInsets.symmetric(vertical: 12),
                          ),
                        ),
                        SizedBox(height: 16),
                        
                        // Status filter chips
                        SizedBox(
                          height: 40,
                          child: ListView(
                            scrollDirection: Axis.horizontal,
                            children: [
                              _buildStatusChip(
                                label: 'Tất cả',
                                status: 'all',
                                color: Color(0xFF757575),
                              ),
                              SizedBox(width: 8),
                              _buildStatusChip(
                                label: 'Chờ xử lý',
                                status: 'pending',
                                color: Color(0xFFFFC107),
                              ),
                              SizedBox(width: 8),
                              _buildStatusChip(
                                label: 'Đang chuẩn bị',
                                status: 'preparing',
                                color: Color(0xFF2196F3),
                              ),
                              SizedBox(width: 8),
                              _buildStatusChip(
                                label: 'Đang giao',
                                status: 'shipping',
                                color: Color(0xFFFF9800),
                              ),
                              SizedBox(width: 8),
                              _buildStatusChip(
                                label: 'Đã giao',
                                status: 'delivered',
                                color: Color(0xFF4CAF50),
                              ),
                              SizedBox(width: 8),
                              _buildStatusChip(
                                label: 'Đã hủy',
                                status: 'cancelled',
                                color: Color(0xFFF44336),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  
                  // Orders list
                  if (filteredOrders.isEmpty)
                    Padding(
                      padding: EdgeInsets.all(32),
                      child: Center(
                        child: Column(
                          children: [
                            Icon(Icons.shopping_cart_outlined,
                                size: 64,
                                color: Color(0xFFBDBDBD)),
                            SizedBox(height: 16),
                            Text(
                              'Không có đơn hàng',
                              style: TextStyle(
                                fontSize: 16,
                                color: Color(0xFF757575),
                              ),
                            ),
                          ],
                        ),
                      ),
                    )
                  else
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 16),
                      child: Column(
                        children: [
                          ...filteredOrders.map((order) {
                            return _OrderCard(
                              order: order,
                              onTap: () => _showOrderDetail(context, order),
                            );
                          }).toList(),
                          SizedBox(height: 16),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildStatusChip({
    required String label,
    required String status,
    required Color color,
  }) {
    bool isSelected = _selectedStatus == status;
    return FilterChip(
      label: Text(
        label,
        style: TextStyle(
          fontSize: 12,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
          color: isSelected ? Colors.white : color,
        ),
      ),
      backgroundColor: isSelected ? color : color.withOpacity(0.1),
      selected: isSelected,
      onSelected: (selected) {
        setState(() => _selectedStatus = status);
      },
    );
  }

  void _showOrderDetail(BuildContext context, Order order) {
    showModalBottomSheet(
      context: context,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => _OrderDetailSheet(order: order),
    );
  }
}

class _OrderCard extends StatelessWidget {
  final Order order;
  final VoidCallback onTap;

  const _OrderCard({
    required this.order,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.only(bottom: 12),
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Đơn #${order.orderNumber}',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF212121),
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        DateFormat('dd/MM/yyyy HH:mm')
                            .format(order.createdAt),
                        style: TextStyle(
                          fontSize: 12,
                          color: Color(0xFF757575),
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: _getStatusColor(order.status).withOpacity(0.15),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    _getStatusLabel(order.status),
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: _getStatusColor(order.status),
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${(order.totalAmount).toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')} ₫',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1976D2),
                  ),
                ),
                ElevatedButton(
                  onPressed: onTap,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xFF1976D2),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  ),
                  child: Text(
                    'Chi tiết',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return Color(0xFFFFC107);
      case 'preparing':
        return Color(0xFF2196F3);
      case 'shipping':
        return Color(0xFFFF9800);
      case 'delivered':
        return Color(0xFF4CAF50);
      case 'cancelled':
        return Color(0xFFF44336);
      default:
        return Color(0xFF757575);
    }
  }

  String _getStatusLabel(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Chờ xử lý';
      case 'preparing':
        return 'Đang chuẩn bị';
      case 'shipping':
        return 'Đang giao';
      case 'delivered':
        return 'Đã giao';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  }
}

class _OrderDetailSheet extends StatelessWidget {
  final Order order;

  const _OrderDetailSheet({required this.order});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Chi tiết đơn hàng',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF212121),
                ),
              ),
              GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Icon(Icons.close),
              ),
            ],
          ),
          SizedBox(height: 16),
          _DetailRow(
            label: 'Mã đơn',
            value: '#${order.orderNumber}',
          ),
          _DetailRow(
            label: 'Trạng thái',
            value: _getStatusLabel(order.status),
            valueColor: _getStatusColor(order.status),
          ),
          _DetailRow(
            label: 'Ngày tạo',
            value: DateFormat('dd/MM/yyyy HH:mm').format(order.createdAt),
          ),
          _DetailRow(
            label: 'Tổng tiền',
            value:
                '${(order.totalAmount).toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')} ₫',
            valueColor: Color(0xFF1976D2),
          ),
          SizedBox(height: 16),
          Text(
            'Sản phẩm',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: Color(0xFF212121),
            ),
          ),
          SizedBox(height: 8),
          ...order.items.map((item) => Padding(
            padding: EdgeInsets.symmetric(vertical: 6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    '${item.productName} x${item.quantity}',
                    style: TextStyle(fontSize: 13, color: Color(0xFF212121)),
                  ),
                ),
                Text(
                  '${(item.price * item.quantity).toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')} ₫',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1976D2),
                  ),
                ),
              ],
            ),
          )),
          SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: Color(0xFF1976D2),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: Text(
                'Đóng',
                style: TextStyle(color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return Color(0xFFFFC107);
      case 'preparing':
        return Color(0xFF2196F3);
      case 'shipping':
        return Color(0xFFFF9800);
      case 'delivered':
        return Color(0xFF4CAF50);
      case 'cancelled':
        return Color(0xFFF44336);
      default:
        return Color(0xFF757575);
    }
  }

  String _getStatusLabel(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Chờ xử lý';
      case 'preparing':
        return 'Đang chuẩn bị';
      case 'shipping':
        return 'Đang giao';
      case 'delivered':
        return 'Đã giao';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  final Color? valueColor;

  const _DetailRow({
    required this.label,
    required this.value,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              color: Color(0xFF757575),
              fontSize: 13,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 13,
              color: valueColor ?? Color(0xFF212121),
            ),
          ),
        ],
      ),
    );
  }
}
