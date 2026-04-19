import 'package:flutter/material.dart';
import '../models/index.dart';

// Product Form Dialog
class ProductFormDialog extends StatefulWidget {
  final Product? product; // null for create, existing for edit
  final List<Category> categories;
  final Function(String, String, String, String, double, int?, bool) onSave;

  const ProductFormDialog({
    Key? key,
    this.product,
    required this.categories,
    required this.onSave,
  }) : super(key: key);

  @override
  _ProductFormDialogState createState() => _ProductFormDialogState();
}

class _ProductFormDialogState extends State<ProductFormDialog> {
  late TextEditingController _nameController;
  late TextEditingController _descController;
  late TextEditingController _priceController;
  late TextEditingController _imageController;
  late TextEditingController _stockController;
  String? _selectedCategoryId;
  bool _isFeatured = false;
  final _formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.product?.name ?? '');
    _descController = TextEditingController(text: widget.product?.description ?? '');
    _priceController = TextEditingController(
        text: widget.product?.price.toStringAsFixed(0) ?? '');
    _imageController = TextEditingController(text: widget.product?.imageUrl ?? '');
    _stockController = TextEditingController(
        text: widget.product?.stockQty?.toString() ?? '');
    _selectedCategoryId = widget.product?.categoryId;
    _isFeatured = widget.product?.isFeatured ?? false;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descController.dispose();
    _priceController.dispose();
    _imageController.dispose();
    _stockController.dispose();
    super.dispose();
  }

  String? _validatePrice(String? value) {
    if (value == null || value.isEmpty) {
      return 'Vui lòng nhập giá';
    }
    final price = double.tryParse(value);
    if (price == null || price <= 0) {
      return 'Giá phải lớn hơn 0';
    }
    return null;
  }

  String? _validateName(String? value) {
    if (value == null || value.isEmpty) {
      return 'Vui lòng nhập tên sản phẩm';
    }
    if (value.length < 3) {
      return 'Tên sản phẩm phải ít nhất 3 ký tự';
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Padding(
            padding: EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.product == null ? 'Thêm sản phẩm mới' : 'Cập nhật sản phẩm',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 20),
                
                // Name field
                TextFormField(
                  controller: _nameController,
                  validator: _validateName,
                  decoration: InputDecoration(
                    labelText: 'Tên sản phẩm *',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    prefixIcon: Icon(Icons.shopping_bag),
                  ),
                ),
                SizedBox(height: 12),
                
                // Description field
                TextFormField(
                  controller: _descController,
                  maxLines: 3,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Vui lòng nhập mô tả';
                    }
                    return null;
                  },
                  decoration: InputDecoration(
                    labelText: 'Mô tả *',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    prefixIcon: Icon(Icons.description),
                  ),
                ),
                SizedBox(height: 12),
                
                // Category dropdown
                DropdownButtonFormField<String>(
                  value: _selectedCategoryId,
                  validator: (value) {
                    if (value == null) return 'Vui lòng chọn danh mục';
                    return null;
                  },
                  decoration: InputDecoration(
                    labelText: 'Danh mục *',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  items: widget.categories.map((cat) {
                    return DropdownMenuItem(
                      value: cat.id,
                      child: Text(cat.name),
                    );
                  }).toList(),
                  onChanged: (value) => setState(() => _selectedCategoryId = value),
                ),
                SizedBox(height: 12),
                
                // Price field
                TextFormField(
                  controller: _priceController,
                  keyboardType: TextInputType.number,
                  validator: _validatePrice,
                  decoration: InputDecoration(
                    labelText: 'Giá (VND) *',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    prefixIcon: Icon(Icons.attach_money),
                  ),
                ),
                SizedBox(height: 12),
                
                // Stock field
                TextFormField(
                  controller: _stockController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: 'Số lượng tồn kho',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    prefixIcon: Icon(Icons.inventory_2),
                  ),
                ),
                SizedBox(height: 12),
                
                // Image URL field
                TextFormField(
                  controller: _imageController,
                  decoration: InputDecoration(
                    labelText: 'URL ảnh',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    prefixIcon: Icon(Icons.image),
                    helperText: 'Mặc định: placeholder nếu để trống',
                  ),
                ),
                SizedBox(height: 12),
                
                // Featured checkbox
                CheckboxListTile(
                  value: _isFeatured,
                  onChanged: (value) => setState(() => _isFeatured = value ?? false),
                  title: Text('Sản phẩm nổi bật'),
                  contentPadding: EdgeInsets.zero,
                ),
                SizedBox(height: 20),
                
                // Action buttons
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: Text('Hủy', style: TextStyle(color: Colors.grey)),
                    ),
                    SizedBox(width: 8),
                    ElevatedButton.icon(
                      onPressed: () {
                        if (_formKey.currentState!.validate()) {
                          widget.onSave(
                            _nameController.text,
                            _descController.text,
                            _selectedCategoryId!,
                            _imageController.text.isEmpty
                                ? 'https://via.placeholder.com/300?text=No+Image'
                                : _imageController.text,
                            double.parse(_priceController.text),
                            _stockController.text.isNotEmpty
                                ? int.parse(_stockController.text)
                                : null,
                            _isFeatured,
                          );
                          Navigator.pop(context);
                        }
                      },
                      icon: Icon(Icons.save),
                      label: Text('Lưu'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// Category Form Dialog
class CategoryFormDialog extends StatefulWidget {
  final Category? category;
  final Function(String, String, int) onSave;

  const CategoryFormDialog({
    Key? key,
    this.category,
    required this.onSave,
  }) : super(key: key);

  @override
  _CategoryFormDialogState createState() => _CategoryFormDialogState();
}

class _CategoryFormDialogState extends State<CategoryFormDialog> {
  late TextEditingController _nameController;
  late TextEditingController _imageController;
  late TextEditingController _sortController;
  final _formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.category?.name ?? '');
    _imageController = TextEditingController(text: widget.category?.image ?? '');
    _sortController = TextEditingController(
        text: widget.category?.sortOrder.toString() ?? '0');
  }

  @override
  void dispose() {
    _nameController.dispose();
    _imageController.dispose();
    _sortController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Padding(
            padding: EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.category == null ? 'Thêm danh mục mới' : 'Cập nhật danh mục',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 20),
                
                TextFormField(
                  controller: _nameController,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Vui lòng nhập tên danh mục';
                    }
                    return null;
                  },
                  decoration: InputDecoration(
                    labelText: 'Tên danh mục *',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    prefixIcon: Icon(Icons.category),
                  ),
                ),
                SizedBox(height: 12),
                
                TextFormField(
                  controller: _imageController,
                  decoration: InputDecoration(
                    labelText: 'URL ảnh',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    prefixIcon: Icon(Icons.image),
                  ),
                ),
                SizedBox(height: 12),
                
                TextFormField(
                  controller: _sortController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: 'Thứ tự sắp xếp',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    prefixIcon: Icon(Icons.sort),
                  ),
                ),
                SizedBox(height: 20),
                
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: Text('Hủy', style: TextStyle(color: Colors.grey)),
                    ),
                    SizedBox(width: 8),
                    ElevatedButton.icon(
                      onPressed: () {
                        if (_formKey.currentState!.validate()) {
                          widget.onSave(
                            _nameController.text,
                            _imageController.text.isEmpty
                                ? 'https://via.placeholder.com/200'
                                : _imageController.text,
                            int.tryParse(_sortController.text) ?? 0,
                          );
                          Navigator.pop(context);
                        }
                      },
                      icon: Icon(Icons.save),
                      label: Text('Lưu'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// Confirmation Dialog
class ConfirmDialog extends StatefulWidget {
  final String title;
  final String message;
  final String confirmText;
  final String cancelText;
  final Future<void> Function() onConfirm;

  const ConfirmDialog({
    Key? key,
    required this.title,
    required this.message,
    this.confirmText = 'Xác nhận',
    this.cancelText = 'Hủy',
    required this.onConfirm,
  }) : super(key: key);

  @override
  State<ConfirmDialog> createState() => _ConfirmDialogState();
}

class _ConfirmDialogState extends State<ConfirmDialog> {
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      title: Text(widget.title),
      content: _isLoading
          ? const SizedBox(
              height: 50,
              child: Center(child: CircularProgressIndicator()),
            )
          : Text(widget.message),
      actions: [
        TextButton(
          onPressed: _isLoading ? null : () => Navigator.pop(context),
          child: Text(widget.cancelText),
        ),
        ElevatedButton(
          onPressed: _isLoading ? null : _handleConfirm,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.red,
          ),
          child: _isLoading
              ? const SizedBox(
                  height: 20,
                  width: 20,
                  child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation<Color>(Colors.white)),
                )
              : Text(widget.confirmText, style: const TextStyle(color: Colors.white)),
        ),
      ],
    );
  }

  Future<void> _handleConfirm() async {
    if (_isLoading) return;
    
    setState(() => _isLoading = true);
    try {
      await widget.onConfirm();
      // Schedule pop after current frame is complete to avoid Navigator._history errors
      if (mounted) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted && Navigator.canPop(context)) {
            Navigator.pop(context);
          }
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
}

// Status Update Dialog
class StatusUpdateDialog extends StatefulWidget {
  final String currentStatus;
  final Function(String) onStatusChange;

  const StatusUpdateDialog({
    Key? key,
    required this.currentStatus,
    required this.onStatusChange,
  }) : super(key: key);

  @override
  _StatusUpdateDialogState createState() => _StatusUpdateDialogState();
}

class _StatusUpdateDialogState extends State<StatusUpdateDialog> {
  late String _selectedStatus;

  @override
  void initState() {
    super.initState();
    _selectedStatus = widget.currentStatus;
  }

  @override
  Widget build(BuildContext context) {
    const statuses = ['pending', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled'];
    const statusLabels = {
      'pending': 'Chờ xử lý',
      'confirmed': 'Đã xác nhận',
      'preparing': 'Đang chuẩn bị',
      'shipping': 'Đang giao',
      'delivered': 'Đã giao',
      'cancelled': 'Đã hủy',
    };

    return AlertDialog(
      title: Text('Cập nhật trạng thái đơn hàng'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text('Trạng thái hiện tại: ${statusLabels[_selectedStatus]}'),
          SizedBox(height: 20),
          ...statuses.map((status) {
            return RadioListTile<String>(
              title: Text(statusLabels[status] ?? status),
              value: status,
              groupValue: _selectedStatus,
              onChanged: (value) => setState(() => _selectedStatus = value!),
            );
          }).toList(),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text('Hủy'),
        ),
        ElevatedButton(
          onPressed: () {
            widget.onStatusChange(_selectedStatus);
            Navigator.pop(context);
          },
          child: Text('Cập nhật'),
        ),
      ],
    );
  }
}
