import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/index.dart';
import '../providers/index.dart';

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFFAFAFA),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddProductDialog(context),
        backgroundColor: Color(0xFF1976D2),
        icon: Icon(Icons.add),
        label: Text('Thêm'),
      ),
      body: Consumer<ProductsProvider>(
        builder: (context, productsProvider, _) {
          if (productsProvider.isLoading) {
            return Center(child: CircularProgressIndicator());
          }

          // Filter and sort products
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
          
          // Sort
          switch (_sortBy) {
            case 'price':
              filteredProducts.sort((a, b) => a.price.compareTo(b.price));
              break;
            case 'name':
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
                      // Search field
                      TextField(
                        controller: _searchController,
                        onChanged: (_) => setState(() {}),
                        decoration: InputDecoration(
                          hintText: 'Tìm kiếm sản phẩm...',
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
                      
                      // Filter and Sort row
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
                                setState(
                                    () => _selectedCategory = value ?? 'all');
                              },
                            ),
                          ),
                          SizedBox(width: 12),
                          Expanded(
                            child: DropdownButton<String>(
                              value: _sortBy,
                              isExpanded: true,
                              items: [
                                DropdownMenuItem(
                                  value: 'name',
                                  child: Text('Tên (A-Z)'),
                                ),
                                DropdownMenuItem(
                                  value: 'price',
                                  child: Text('Giá (thấp)'),
                                ),
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
                
                // Products list
                if (filteredProducts.isEmpty)
                  Padding(
                    padding: EdgeInsets.all(32),
                    child: Center(
                      child: Column(
                        children: [
                          Icon(Icons.inventory_outlined,
                              size: 64,
                              color: Color(0xFFBDBDBD)),
                          SizedBox(height: 16),
                          Text(
                            'Không có sản phẩm',
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
                        ...filteredProducts.map((product) {
                          return _ProductCard(
                            product: product,
                            onDelete: () =>
                                _confirmDelete(context, product),
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

  void _showAddProductDialog(BuildContext context) {
    final categories = context.read<ProductsProvider>().categories;
    String? selectedCategory = categories.isNotEmpty ? categories[0].id : null;
    
    final nameController = TextEditingController();
    final descController = TextEditingController();
    final priceController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Thêm Sản phẩm'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: InputDecoration(
                  labelText: 'Tên sản phẩm',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
              SizedBox(height: 12),
              TextField(
                controller: descController,
                decoration: InputDecoration(
                  labelText: 'Mô tả',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                maxLines: 3,
              ),
              SizedBox(height: 12),
              TextField(
                controller: priceController,
                decoration: InputDecoration(
                  labelText: 'Giá (VNĐ)',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                keyboardType: TextInputType.number,
              ),
              SizedBox(height: 12),
              StatefulBuilder(
                builder: (context, setState) => DropdownButtonFormField<String>(
                  value: selectedCategory,
                  decoration: InputDecoration(
                    labelText: 'Danh mục',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  items: categories
                      .map((cat) => DropdownMenuItem(
                            value: cat.id,
                            child: Text(cat.name),
                          ))
                      .toList(),
                  onChanged: (value) => selectedCategory = value,
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Hủy'),
          ),
          ElevatedButton(
            onPressed: () {
              if (nameController.text.isEmpty ||
                  priceController.text.isEmpty ||
                  selectedCategory == null) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Vui lòng điền tất cả các trường')),
                );
                return;
              }
              
              final product = Product(
                id: '',
                name: nameController.text,
                description: descController.text,
                categoryId: selectedCategory!,
                price: double.tryParse(priceController.text) ?? 0,
                imageUrl: '',
                isActive: true,
                isFeatured: false,
                rating: 0,
              );
              context.read<ProductsProvider>().createProduct(product);
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Color(0xFF1976D2),
            ),
            child: Text('Thêm'),
          ),
        ],
      ),
    );
  }

  void _confirmDelete(BuildContext context, Product product) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Xóa Sản phẩm'),
        content: Text(
          'Bạn có chắc chắn muốn xóa "${product.name}"?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Hủy'),
          ),
          ElevatedButton(
            onPressed: () {
              context.read<ProductsProvider>().deleteProduct(product.id);
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Color(0xFFF44336),
            ),
            child: Text('Xóa'),
          ),
        ],
      ),
    );
  }
}

class _ProductCard extends StatelessWidget {
  final Product product;
  final VoidCallback onDelete;

  const _ProductCard({
    required this.product,
    required this.onDelete,
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
        padding: EdgeInsets.all(12),
        child: Row(
          children: [
            // Product image placeholder
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: Color(0xFFE0E0E0),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                Icons.image_outlined,
                color: Color(0xFF757575),
                size: 40,
              ),
            ),
            SizedBox(width: 12),
            
            // Product info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF212121),
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  SizedBox(height: 4),
                  Text(
                    '${(product.price).toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')} ₫',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1976D2),
                    ),
                  ),
                  if (product.rating > 0)
                    Padding(
                      padding: EdgeInsets.only(top: 4),
                      child: Row(
                        children: [
                          Icon(Icons.star, size: 12, color: Color(0xFFFFC107)),
                          SizedBox(width: 4),
                          Text(
                            product.rating.toStringAsFixed(1),
                            style: TextStyle(
                              fontSize: 12,
                              color: Color(0xFF757575),
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
            SizedBox(width: 8),
            
            // Action buttons
            Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                  icon: Icon(Icons.edit, color: Color(0xFF1976D2)),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Chỉnh sửa chưa được triển khai')),
                    );
                  },
                ),
                IconButton(
                  icon: Icon(Icons.delete, color: Color(0xFFF44336)),
                  onPressed: onDelete,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
