// User model
class User {
  final String id;
  final String email;
  final String fullName;
  final String phone;
  final String role;
  final bool isActive;
  final DateTime createdAt;

  User({
    required this.id,
    required this.email,
    required this.fullName,
    required this.phone,
    required this.role,
    required this.isActive,
    required this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    // Handle is_active as both boolean and integer (0/1)
    bool isActive = true;
    final isActiveValue = json['is_active'];
    if (isActiveValue is bool) {
      isActive = isActiveValue;
    } else if (isActiveValue is int) {
      isActive = isActiveValue != 0;
    }

    // Parse createdAt - handle both timestamp (ms) and ISO string formats
    DateTime parsedCreatedAt = DateTime.now();
    final createdAtValue = json['created_at'];
    if (createdAtValue is int) {
      // Timestamp in milliseconds
      parsedCreatedAt = DateTime.fromMillisecondsSinceEpoch(createdAtValue);
    } else if (createdAtValue is String && createdAtValue.isNotEmpty) {
      try {
        parsedCreatedAt = DateTime.parse(createdAtValue);
      } catch (e) {
        // If parsing fails, keep current time
      }
    }

    return User(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      fullName: json['full_name'] ?? '',
      phone: json['phone'] ?? '',
      role: json['role'] ?? 'customer',
      isActive: isActive,
      createdAt: parsedCreatedAt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'full_name': fullName,
      'phone': phone,
      'role': role,
      'is_active': isActive,
      'created_at': createdAt.toIso8601String(),
    };
  }
}

// Order model
class Order {
  final String id;
  final String orderNumber;
  final String userId;
  final String? userName;
  final String? userPhone;
  final String? deliveryAddress;
  final double totalAmount;
  final String status; // pending, confirmed, delivered, cancelled
  final DateTime createdAt;
  final DateTime? deliveredAt;
  final List<OrderItem> items;
  final String? notes;

  Order({
    required this.id,
    required this.orderNumber,
    required this.userId,
    this.userName,
    this.userPhone,
    this.deliveryAddress,
    required this.totalAmount,
    required this.status,
    required this.createdAt,
    this.deliveredAt,
    required this.items,
    this.notes,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    // Convert numeric status to string
    String statusStr = 'pending';
    final statusValue = json['status'];
    
    if (statusValue is int) {
      switch (statusValue) {
        case 1: statusStr = 'pending'; break;
        case 2: statusStr = 'confirmed'; break;
        case 3: statusStr = 'preparing'; break;
        case 4: statusStr = 'shipping'; break;
        case 5: statusStr = 'delivered'; break;
        case 6: statusStr = 'cancelled'; break;
        default: statusStr = 'pending';
      }
    } else if (statusValue is String) {
      statusStr = statusValue;
    }

    // Parse items - handle both array and object formats
    List<OrderItem> items = [];
    final itemsData = json['items'];
    if (itemsData is List) {
      items = itemsData
          .map((item) => OrderItem.fromJson(item as Map<String, dynamic>))
          .toList();
    }

    // Parse createdAt - handle both timestamp (ms) and ISO string formats
    DateTime parsedCreatedAt = DateTime.now();
    final createdAtValue = json['created_at'];
    if (createdAtValue is int) {
      // Timestamp in milliseconds
      parsedCreatedAt = DateTime.fromMillisecondsSinceEpoch(createdAtValue);
    } else if (createdAtValue is String && createdAtValue.isNotEmpty) {
      try {
        parsedCreatedAt = DateTime.parse(createdAtValue);
      } catch (e) {
        parsedCreatedAt = DateTime.now();
      }
    }

    // Parse deliveredAt similarly
    DateTime? parsedDeliveredAt;
    final deliveredAtValue = json['delivered_at'];
    if (deliveredAtValue is int && deliveredAtValue > 0) {
      parsedDeliveredAt = DateTime.fromMillisecondsSinceEpoch(deliveredAtValue);
    } else if (deliveredAtValue is String && deliveredAtValue.isNotEmpty) {
      try {
        parsedDeliveredAt = DateTime.parse(deliveredAtValue);
      } catch (e) {
        parsedDeliveredAt = null;
      }
    }

    return Order(
      id: json['id'] ?? '',
      orderNumber: json['order_number'] ?? '',
      userId: json['user_id'] ?? '',
      userName: json['user_name'] ?? json['user']?['full_name'],
      userPhone: json['user_phone'] ?? json['user']?['phone'],
      deliveryAddress: json['delivery_address'] ?? json['address'],
      totalAmount: (json['total_amount'] ?? json['final_amount'] ?? 0).toDouble(),
      status: statusStr,
      createdAt: parsedCreatedAt,
      deliveredAt: parsedDeliveredAt,
      items: items,
      notes: json['notes'] ?? json['note'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'order_number': orderNumber,
      'user_id': userId,
      'total_amount': totalAmount,
      'status': status,
      'created_at': createdAt.toIso8601String(),
      'delivered_at': deliveredAt?.toIso8601String(),
    };
  }
}

class OrderItem {
  final String productId;
  final String productName;
  final double price;
  final int quantity;

  OrderItem({
    required this.productId,
    required this.productName,
    required this.price,
    required this.quantity,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      productId: json['product_id'] ?? '',
      productName: json['product_name'] ?? '',
      price: (json['unit_price'] ?? json['price'] ?? 0).toDouble(),
      quantity: json['quantity'] ?? 0,
    );
  }
}

// Product model
class Product {
  final String id;
  final String name;
  final String description;
  final String categoryId;
  final double price;
  final double? originalPrice;
  final String imageUrl;
  final bool isActive;
  final bool isFeatured;
  final double rating;
  final int? stockQty;
  final int? soldCount;
  final int? discountPercent;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Product({
    required this.id,
    required this.name,
    required this.description,
    required this.categoryId,
    required this.price,
    this.originalPrice,
    required this.imageUrl,
    required this.isActive,
    required this.isFeatured,
    required this.rating,
    this.stockQty,
    this.soldCount,
    this.discountPercent,
    this.createdAt,
    this.updatedAt,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    // Handle categoryId as either int or string
    String categoryId = '';
    final catId = json['category_id'] ?? json['categoryId'];
    if (catId != null) {
      categoryId = catId.toString();
    }

    // Handle isActive as both boolean and integer (0/1)
    bool isActive = true;
    final isActiveValue = json['is_active'] ?? json['isActive'];
    if (isActiveValue is bool) {
      isActive = isActiveValue;
    } else if (isActiveValue is int) {
      isActive = isActiveValue != 0;
    }

    return Product(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      categoryId: categoryId,
      price: (json['price'] ?? 0).toDouble(),
      originalPrice: json['original_price'] != null ? (json['original_price'] as num).toDouble() : null,
      imageUrl: json['image_url'] ?? json['image'] ?? 'https://via.placeholder.com/300?text=No+Image',
      isActive: isActive,
      isFeatured: json['is_featured'] ?? json['isFeatured'] ?? false,
      rating: (json['rating'] ?? 0).toDouble(),
      stockQty: json['stock_qty'] as int?,
      soldCount: json['sold_count'] as int?,
      discountPercent: json['discount_percent'] as int?,
      createdAt: json['created_at'] != null ? DateTime.parse(json['created_at'].toString()) : null,
      updatedAt: json['updated_at'] != null ? DateTime.parse(json['updated_at'].toString()) : null,
    );
  }

  Map<String, dynamic> toJson() {
    final result = <String, dynamic>{
      'id': id,
      'name': name,
      'description': description,
      'category_id': categoryId,
      'price': price,
      'image_url': imageUrl,
      'is_active': isActive,
      'is_featured': isFeatured,
      'rating': rating,
    };
    if (originalPrice != null) result['original_price'] = originalPrice!;
    if (stockQty != null) result['stock_qty'] = stockQty!;
    if (soldCount != null) result['sold_count'] = soldCount!;
    if (discountPercent != null) result['discount_percent'] = discountPercent!;
    return result;
  }
}

// Category model
class Category {
  final String id;
  final String name;
  final String image;
  final int sortOrder;
  final bool isActive;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Category({
    required this.id,
    required this.name,
    required this.image,
    required this.sortOrder,
    this.isActive = true,
    this.createdAt,
    this.updatedAt,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      image: json['image'] ?? json['image_url'] ?? 'https://via.placeholder.com/200',
      sortOrder: json['sort_order'] ?? json['sortOrder'] ?? 0,
      isActive: json['is_active'] ?? true,
      createdAt: json['created_at'] != null ? DateTime.parse(json['created_at'].toString()) : null,
      updatedAt: json['updated_at'] != null ? DateTime.parse(json['updated_at'].toString()) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'image': image,
      'sort_order': sortOrder,
      'is_active': isActive,
    };
  }
}

// Dashboard stats model
class DashboardStats {
  final int totalOrders;
  final int totalUsers;
  final int totalProducts;
  final double totalRevenue;
  final int ordersToday;
  final int newUsersToday;

  DashboardStats({
    required this.totalOrders,
    required this.totalUsers,
    required this.totalProducts,
    required this.totalRevenue,
    required this.ordersToday,
    required this.newUsersToday,
  });

  factory DashboardStats.fromJson(Map<String, dynamic> json) {
    return DashboardStats(
      totalOrders: json['totalOrders'] ?? json['total_orders'] ?? 0,
      totalUsers: json['totalUsers'] ?? json['total_users'] ?? 0,
      totalProducts: json['totalProducts'] ?? json['total_products'] ?? 0,
      totalRevenue: (json['totalRevenue'] ?? json['total_revenue'] ?? 0).toDouble(),
      ordersToday: json['ordersToday'] ?? json['orders_today'] ?? 0,
      newUsersToday: json['newUsersToday'] ?? json['new_users_today'] ?? 0,
    );
  }
}
