import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/index.dart';
import '../providers/index.dart';
import '../widgets/form_dialogs.dart';

class ProductsScreen extends StatefulWidget {
  const ProductsScreen({Key? key}) : super(key: key);

  @override
  State<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  final _searchController = TextEditingController();
  String _selectedCategory = 'all';
  String _sortBy = 'name';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ProductsProvider>().fetchProducts();
      context.read<ProductsProvider>().fetchCategories();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _showProductForm({Product? product}) {
    final categories = context.read<ProductsProvider>().categories;
    
    showDialog(
      context: context,
      builder: (dialogContext) => ProductFormDialog(
        product: product,
        categories: categories,
        onSave: (name, desc, categoryId, image, price, stock, featured) async {
          final newProduct = Product(
            id: product?.id ?? '',
            name: name,
            description: desc,
            categoryId: categoryId,
            price: price,
            imageUrl: image.isEmpty ? 'https://via.placeholder.com/300' : image,
            isActive: product?.isActive ?? true,
            isFeatured: featured,
            rating: product?.rating ?? 0,
            stockQty: stock,
          );

          try {
            if (product == null) {
              await context.read<ProductsProvider>().createProduct(newProduct);
            } else {
              await context.read<ProductsProvider>().updateProduct(product.id, newProduct);
            }
            
            // Close dialog first, then show snackbar
            if (mounted && Navigator.of(dialogContext).canPop()) {
              Navigator.of(dialogContext).pop();
            }
            
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(product == null ? '✓ Đã thêm sản phẩm' : '✓ Đã cập nhật sản phẩm'),
                  duration: const Duration(seconds: 2),
                ),
              );
            }
          } catch (e) {
            if (mounted && Navigator.of(dialogContext).canPop()) {
              Navigator.of(dialogContext).pop();
            }
            
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('✗ Lỗi: ${e.toString()}'),
                  backgroundColor: Colors.red,
                ),
              );
            }
          }
        },
      ),
    );
  }

  void _confirmDeleteProduct(Product product) {
    showDialog(
      context: context,
      builder: (dialogContext) => ConfirmDialog(
        title: 'Xóa sản phẩm',
        message: 'Bạn chắc chắn muốn xóa "${product.name}"?',
        confirmText: 'Xóa',
        onConfirm: () async {
          try {
            await context.read<ProductsProvider>().deleteProduct(product.id);
            
            // Close dialog first, then show snackbar
            if (mounted && Navigator.of(dialogContext).canPop()) {
              Navigator.of(dialogContext).pop();
            }
            
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('✓ Đã xóa sản phẩm'),
                  backgroundColor: Colors.green,
                ),
              );
            }
          } catch (e) {
            if (mounted && Navigator.of(dialogContext).canPop()) {
              Navigator.of(dialogContext).pop();
            }
            
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('✗ Lỗi: ${e.toString()}'),
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
      backgroundColor: Color(0xFFFAFAFA),
      appBar: AppBar(
        title: Text('Quản lý sản phẩm'),
        backgroundColor: Colors.white,
        foregroundColor: Color(0xFF212121),
        elevation: 1,
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showProductForm(),
        backgroundColor: Color(0xFF1976D2),
        icon: Icon(Icons.add),
        label: Text('Thêm'),
      ),
      body: Consumer<ProductsProvider>(
        builder: (context, productsProvider, _) {
          if (productsProvider.isLoading) {
            return Center(child: CircularProgressIndicator());
          }

          List<Product> filteredProducts = productsProvider.products;
          
          if (_selectedCategory != 'all') {
            filteredProducts = filteredProducts
                .where((p) => p.categoryId == _selectedCategory)
                .toList();
          }
          
          if (_searchController.text.isNotEmpty) {
            filteredProducts = filteredProducts
                .where((p) =>
                    p.name.toLowerCase().contains(
                        _searchController.text.toLowerCase()))
                .toList();
          }
          
          switch (_sortBy) {
            case 'price':
              filteredProducts.sort((a, b) => a.price.compareTo(b.price));
              break;
            default:
              filteredProducts.sort((a, b) => a.name.compareTo(b.name));
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
                          hintText: 'Tìm kiếm sản phẩm...',
                          prefixIcon: Icon(Icons.search, color: Color(0xFF1976D2)),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          contentPadding: EdgeInsets.symmetric(vertical: 12),
                        ),
                      ),
                      SizedBox(height: 16),
                      
                      Row(
                        children: [
                          Expanded(
                            child: DropdownButton<String>(
                              value: _selectedCategory,
                              isExpanded: true,
                              items: [
                                DropdownMenuItem(
                                  value: 'all',
                                  child: Text('Tất cả danh mục'),
                                ),
                                ...productsProvider.categories
                                    .map((cat) => DropdownMenuItem(
                                          value: cat.id,
                                          child: Text(cat.name),
                                        ))
                                    .toList(),
                              ],
                              onChanged: (value) {
                                setState(() => _selectedCategory = value ?? 'all');
                              },
                            ),
                          ),
                          SizedBox(width: 12),
                          Expanded(
                            child: DropdownButton<String>(
                              value: _sortBy,
                              isExpanded: true,
                              items: [
                                DropdownMenuItem(value: 'name', child: Text('Tên (A-Z)')),
                                DropdownMenuItem(value: 'price', child: Text('Giá')),
                              ],
                              onChanged: (value) {
                                setState(() => _sortBy = value ?? 'name');
                              },
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                
                if (filteredProducts.isEmpty)
                  Padding(
                    padding: EdgeInsets.all(32),
                    child: Center(
                      child: Column(
                        children: [
                          Icon(Icons.inventory_outlined, size: 64, color: Color(0xFFBDBDBD)),
                          SizedBox(height: 16),
                          Text('Không có sản phẩm'),
                        ],
                      ),
                    ),
                  )
                else
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    child: Column(
                      children: [
                        ...filteredProducts.map((product) {
                          return Card(
                            margin: EdgeInsets.only(bottom: 12),
                            elevation: 2,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Padding(
                              padding: EdgeInsets.all(12),
                              child: Row(
                                children: [
                                  // Product image
                                  Container(
                                    width: 60,
                                    height: 60,
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(8),
                                      color: Color(0xFFEEEEEE),
                                    ),
                                    child: product.imageUrl.isEmpty || product.imageUrl.contains('placeholder')
                                        ? Icon(Icons.image_not_supported, color: Color(0xFFBDBDBD))
                                        : ClipRRect(
                                            borderRadius: BorderRadius.circular(8),
                                            child: Image.network(
                                              product.imageUrl,
                                              fit: BoxFit.cover,
                                              errorBuilder: (context, error, stackTrace) =>
                                                  Icon(Icons.image_not_supported, color: Color(0xFFBDBDBD)),
                                            ),
                                          ),
                                  ),
                                  SizedBox(width: 12),
                                  
                                  // Product info
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        // Name and featured badge
                                        Row(
                                          children: [
                                            Expanded(
                                              child: Text(
                                                product.name,
                                                style: TextStyle(
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 14,
                                                ),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ),
                                            if (product.isFeatured)
                                              Chip(
                                                label: Text(
                                                  'Nổi bật',
                                                  style: TextStyle(fontSize: 10, color: Colors.white),
                                                ),
                                                backgroundColor: Colors.orange,
                                                padding: EdgeInsets.zero,
                                              ),
                                          ],
                                        ),
                                        SizedBox(height: 4),
                                        
                                        // Price
                                        Text(
                                          '${product.price.toStringAsFixed(0)} VNĐ',
                                          style: TextStyle(
                                            color: Colors.green,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        SizedBox(height: 4),
                                        
                                        // Stock info
                                        if (product.stockQty != null)
                                          Text(
                                            'Tồn kho: ${product.stockQty}',
                                            style: TextStyle(fontSize: 12, color: Colors.grey),
                                          ),
                                      ],
                                    ),
                                  ),
                                  SizedBox(width: 8),
                                  
                                  // Actions
                                  PopupMenuButton(
                                    itemBuilder: (context) => [
                                      PopupMenuItem(
                                        child: Row(
                                          children: [Icon(Icons.edit, size: 18), SizedBox(width: 8), Text('Sửa')],
                                        ),
                                        value: 'edit',
                                      ),
                                      PopupMenuItem(
                                        child: Row(
                                          children: [Icon(Icons.delete, size: 18, color: Colors.red), SizedBox(width: 8), Text('Xóa', style: TextStyle(color: Colors.red))],
                                        ),
                                        value: 'delete',
                                      ),
                                    ],
                                    onSelected: (value) {
                                      if (value == 'edit') {
                                        _showProductForm(product: product);
                                      } else if (value == 'delete') {
                                        _confirmDeleteProduct(product);
                                      }
                                    },
                                  ),
                                ],
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
}
