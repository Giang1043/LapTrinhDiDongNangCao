/**
 * Realm Database Schemas
 * Defines all 7 database tables for FoodApp
 */

export const UserSchema = {
  name: 'User',
  primaryKey: 'id',
  properties: {
    id: 'int',
    email: 'string',
    name: 'string',
    phone: 'string',
    address: 'string?',
    passwordHash: 'string',
    isActive: { type: 'bool', default: false },
    createdAt: 'date',
    updatedAt: 'date',
  },
};

export const CategorySchema = {
  name: 'Category',
  primaryKey: 'id',
  properties: {
    id: 'int',
    name: 'string',
    icon: 'string',
    description: 'string?',
    createdAt: 'date',
  },
};

export const ProductSchema = {
  name: 'Product',
  primaryKey: 'id',
  properties: {
    id: 'int',
    categoryId: 'int',
    name: 'string',
    description: 'string?',
    image: 'string?',
    price: 'double',
    discount: { type: 'int', default: 0 },
    rating: { type: 'double', default: 0 },
    stock: { type: 'int', default: 0 },
    soldQuantity: { type: 'int', default: 0 },
    createdAt: 'date',
    updatedAt: 'date',
  },
};

export const CartItemSchema = {
  name: 'CartItem',
  primaryKey: 'id',
  properties: {
    id: 'int',
    userId: 'int',
    productId: 'int',
    quantity: 'int',
    addedAt: 'date',
    updatedAt: 'date',
  },
};

export const OrderSchema = {
  name: 'Order',
  primaryKey: 'id',
  properties: {
    id: 'int',
    userId: 'int',
    totalPrice: 'double',
    status: { type: 'int', default: 1 },
    paymentMethod: 'string?',
    deliveryAddress: 'string',
    notes: 'string?',
    createdAt: 'date',
    updatedAt: 'date',
  },
};

export const OrderItemSchema = {
  name: 'OrderItem',
  primaryKey: 'id',
  properties: {
    id: 'int',
    orderId: 'int',
    productId: 'int',
    quantity: 'int',
    priceAtOrder: 'double',
  },
};

export const FavoriteSchema = {
  name: 'Favorite',
  primaryKey: 'id',
  properties: {
    id: 'int',
    userId: 'int',
    productId: 'int',
    createdAt: 'date',
  },
};

export const allSchemas = [
  UserSchema,
  CategorySchema,
  ProductSchema,
  CartItemSchema,
  OrderSchema,
  OrderItemSchema,
  FavoriteSchema,
];
