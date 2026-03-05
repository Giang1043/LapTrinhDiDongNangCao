/**
 * Realm Database Schema Models
 * Define all database tables and their properties
 */

export const UserSchema = {
  name: 'User',
  primaryKey: 'id',
  properties: {
    id: 'int',
    email: 'string',              // Unique identifier
    name: 'string',
    phone: 'string',
    passwordHash: 'string',       // hashed_foodapp_salt_2026_password
    isActive: 'bool',             // Email verified
    createdAt: 'date',
    updatedAt: 'date',
  },
};

export const CategorySchema = {
  name: 'Category',
  primaryKey: 'id',
  properties: {
    id: 'int',
    name: 'string',               // "Bánh mì", "Pizza", etc.
    icon: 'string',               // "🍔", "🍕", etc.
    description: 'string',        // Optional description
    createdAt: 'date',
  },
};

export const ProductSchema = {
  name: 'Product',
  primaryKey: 'id',
  properties: {
    id: 'int',
    categoryId: 'int',            // Foreign key to Category
    name: 'string',               // "Bánh mì thịt nướng"
    price: 'double',              // Original price (25000)
    discount: 'int',              // Discount % (10, 15, etc.)
    image: 'string',              // Emoji or image URL
    rating: 'double',             // 4.5, 4.8, etc.
    description: 'string',        // Product description
    stock: 'int',                 // Available quantity
    createdAt: 'date',
    updatedAt: 'date',
  },
};

export const CartItemSchema = {
  name: 'CartItem',
  primaryKey: 'id',
  properties: {
    id: 'int',
    userId: 'int',                // Foreign key to User
    productId: 'int',             // Foreign key to Product
    quantity: 'int',              // How many items
    addedAt: 'date',
    updatedAt: 'date',
  },
};

export const OrderSchema = {
  name: 'Order',
  primaryKey: 'id',
  properties: {
    id: 'int',
    userId: 'int',                // Foreign key to User
    totalPrice: 'double',         // Order total
    status: 'string',             // "pending" | "confirmed" | "shipped" | "delivered"
    paymentMethod: 'string',      // "cash" | "card" | "wallet"
    deliveryAddress: 'string',    // Full address
    notes: 'string',              // Customer notes
    createdAt: 'date',
    updatedAt: 'date',
  },
};

export const OrderItemSchema = {
  name: 'OrderItem',
  primaryKey: 'id',
  properties: {
    id: 'int',
    orderId: 'int',               // Foreign key to Order
    productId: 'int',             // Foreign key to Product
    quantity: 'int',
    priceAtOrder: 'double',       // Price when ordered
  },
};

export const FavoriteSchema = {
  name: 'Favorite',
  primaryKey: 'id',
  properties: {
    id: 'int',
    userId: 'int',                // Foreign key to User
    productId: 'int',             // Foreign key to Product
    createdAt: 'date',
  },
};

// All schemas in array for Realm initialization
export const allSchemas = [
  UserSchema,
  CategorySchema,
  ProductSchema,
  CartItemSchema,
  OrderSchema,
  OrderItemSchema,
  FavoriteSchema,
];
