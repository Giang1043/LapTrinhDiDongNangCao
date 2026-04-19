import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/index.dart';
import '../providers/index.dart';
import '../widgets/form_dialogs.dart';

class CategoriesScreen extends StatefulWidget {
  @override
  _CategoriesScreenState createState() => _CategoriesScreenState();
}

class _CategoriesScreenState extends State<CategoriesScreen> {
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ProductsProvider>().fetchCategories();
    });
  }

  void _showCategoryForm({Category? category}) {
    showDialog(
      context: context,
      builder: (dialogContext) => CategoryFormDialog(
        category: category,
        onSave: (name, image, sortOrder) async {
          final newCategory = Category(
            id: category?.id ?? '',
            name: name,
            image: image.isEmpty ? 'https://via.placeholder.com/300' : image,
            sortOrder: sortOrder,
            isActive: category?.isActive ?? true,
          );

          try {
            if (category == null) {
              await context.read<ProductsProvider>().createCategory(newCategory);
            } else {
              await context.read<ProductsProvider>().updateCategory(category.id, newCategory);
            }
            
            // Close dialog first, then show snackbar
            if (mounted && Navigator.of(dialogContext).canPop()) {
              Navigator.of(dialogContext).pop();
            }
            
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(category == null ? '✓ Đã thêm danh mục' : '✓ Đã cập nhật danh mục'),
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

  void _confirmDelete(Category category) {
    showDialog(
      context: context,
      builder: (dialogContext) => ConfirmDialog(
        title: 'Xóa danh mục',
        message: 'Bạn chắc chắn muốn xóa danh mục "${category.name}"?',
        confirmText: 'Xóa',
        onConfirm: () async {
          try {
            await context.read<ProductsProvider>().deleteCategory(category.id);
            
            // Close dialog first, then show snackbar
            if (mounted && Navigator.of(dialogContext).canPop()) {
              Navigator.of(dialogContext).pop();
            }
            
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('✓ Đã xóa danh mục'),
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
      appBar: AppBar(
        title: Text('Quản lý danh mục'),
        backgroundColor: Colors.white,
        foregroundColor: Color(0xFF212121),
        elevation: 1,
      ),
      backgroundColor: Color(0xFFFAFAFA),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showCategoryForm(),
        backgroundColor: Color(0xFF1976D2),
        icon: Icon(Icons.add),
        label: Text('Thêm'),
      ),
      body: Consumer<ProductsProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading) {
            return Center(child: CircularProgressIndicator());
          }

          var categories = provider.categories;
          if (_searchController.text.isNotEmpty) {
            categories = categories
                .where((cat) => cat.name
                    .toLowerCase()
                    .contains(_searchController.text.toLowerCase()))
                .toList();
          }

          return SingleChildScrollView(
            child: Column(
              children: [
                Padding(
                  padding: EdgeInsets.all(16),
                  child: TextField(
                    controller: _searchController,
                    onChanged: (_) => setState(() {}),
                    decoration: InputDecoration(
                      hintText: 'Tìm kiếm danh mục...',
                      prefixIcon: Icon(Icons.search, color: Color(0xFF1976D2)),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      contentPadding: EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                if (categories.isEmpty)
                  Padding(
                    padding: EdgeInsets.all(32),
                    child: Column(
                      children: [
                        Icon(Icons.category_outlined, size: 64, color: Color(0xFFBDBDBD)),
                        SizedBox(height: 16),
                        Text('Không có danh mục'),
                      ],
                    ),
                  )
                else
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    child: Column(
                      children: [
                        ...categories.map((category) {
                          return Card(
                            margin: EdgeInsets.only(bottom: 12),
                            child: ListTile(
                              leading: Container(
                                width: 50,
                                height: 50,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(8),
                                  color: Color(0xFFEEEEEE),
                                ),
                                child: category.image.isEmpty || category.image.contains('placeholder')
                                    ? Icon(Icons.category, color: Color(0xFFBDBDBD))
                                    : Image.network(
                                        category.image,
                                        fit: BoxFit.cover,
                                        errorBuilder: (context, error, stackTrace) => Icon(Icons.category, color: Color(0xFFBDBDBD)),
                                      ),
                              ),
                              title: Text(category.name, style: TextStyle(fontWeight: FontWeight.bold)),
                              trailing: PopupMenuButton(
                                itemBuilder: (context) => [
                                  PopupMenuItem(
                                    child: Row(
                                      children: [Icon(Icons.edit, size: 18), SizedBox(width: 8), Text('Sửa')],
                                    ),
                                    value: 'edit',
                                  ),
                                  PopupMenuItem(
                                    child: Row(
                                      children: [
                                        Icon(Icons.delete, size: 18, color: Colors.red),
                                        SizedBox(width: 8),
                                        Text('Xóa', style: TextStyle(color: Colors.red))
                                      ],
                                    ),
                                    value: 'delete',
                                  ),
                                ],
                                onSelected: (value) {
                                  if (value == 'edit') {
                                    _showCategoryForm(category: category);
                                  } else if (value == 'delete') {
                                    _confirmDelete(category);
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
