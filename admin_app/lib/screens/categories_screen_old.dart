import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/index.dart';

class CategoriesScreen extends StatefulWidget {
  @override
  _CategoriesScreenState createState() => _CategoriesScreenState();
}

class _CategoriesScreenState extends State<CategoriesScreen> {
  final _searchController = TextEditingController();
  List<dynamic> _filteredCategories = [];

  @override
  void initState() {
    super.initState();
    _searchController.addListener(_filterCategories);
    Future.microtask(() {
      final provider = context.read<ProductsProvider>();
      provider.fetchCategories();
    });
  }

  void _filterCategories() {
    final provider = context.read<ProductsProvider>();
    final query = _searchController.text.toLowerCase();
    
    setState(() {
      _filteredCategories = provider.categories
          .where((cat) => cat.name.toLowerCase().contains(query))
          .toList();
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
      appBar: AppBar(
        title: Text('Danh mục sản phẩm'),
        backgroundColor: Colors.white,
        foregroundColor: Color(0xFF212121),
        elevation: 1,
      ),
      backgroundColor: Color(0xFFFAFAFA),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Thêm danh mục chưa được triển khai')),
          );
        },
        backgroundColor: Color(0xFF1976D2),
        icon: Icon(Icons.add),
        label: Text('Thêm'),
      ),
      body: Consumer<ProductsProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading) {
            return Center(child: CircularProgressIndicator());
          }

          final categories = _searchController.text.isEmpty
              ? provider.categories
              : _filteredCategories;

          return SingleChildScrollView(
            padding: EdgeInsets.all(16),
            child: Column(
              children: [
                // Search field
                TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Tìm kiếm danh mục...',
                    prefixIcon: Icon(Icons.search, color: Color(0xFF1976D2)),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Color(0xFFE0E0E0)),
                    ),
                    contentPadding: EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
                SizedBox(height: 20),
                
                if (categories.isEmpty)
                  Center(
                    child: Column(
                      children: [
                        Icon(Icons.category_outlined, size: 64, color: Color(0xFFBDBDBD)),
                        SizedBox(height: 16),
                        Text(
                          'Không có danh mục',
                          style: TextStyle(
                            fontSize: 16,
                            color: Color(0xFF757575),
                          ),
                        ),
                      ],
                    ),
                  )
                else
                  ListView.builder(
                    shrinkWrap: true,
                    physics: NeverScrollableScrollPhysics(),
                    itemCount: categories.length,
                    itemBuilder: (context, index) {
                      final cat = categories[index];
                      return Card(
                        margin: EdgeInsets.only(bottom: 12),
                        elevation: 1,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Padding(
                          padding: EdgeInsets.all(16),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      cat.name,
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF212121),
                                      ),
                                    ),
                                    SizedBox(height: 4),
                                    if (cat.image.isNotEmpty)
                                      Text(
                                        cat.image,
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: Color(0xFF757575),
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                  ],
                                ),
                              ),
                              SizedBox(width: 12),
                              IconButton(
                                icon: Icon(Icons.edit, color: Color(0xFF1976D2)),
                                onPressed: () {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text('Chỉnh sửa danh mục chưa được triển khai')),
                                  );
                                },
                              ),
                              IconButton(
                                icon: Icon(Icons.delete, color: Color(0xFFF44336)),
                                onPressed: () {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text('Xóa danh mục chưa được triển khai')),
                                  );
                                },
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}
