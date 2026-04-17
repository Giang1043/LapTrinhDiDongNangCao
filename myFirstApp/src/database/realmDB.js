import Realm from 'realm';

// ==================== SCHEMAS ====================

// User Schema
export const UserSchema = {
  name: 'User',
  primaryKey: 'id',
  properties: {
    id: 'string',
    email: 'string',
    password: 'string',
    fullName: 'string',
    phone: 'string',
    avatar: 'string?',
    createdAt: 'date?',
  },
};

// Category Schema
export const CategorySchema = {
  name: 'Category',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string',
    image: 'string',
  },
};

// Product Schema
export const ProductSchema = {
  name: 'Product',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string',
    price: 'float',
    originalPrice: 'float',
    discount: 'int',
    image: 'string',
    categoryId: 'string',
    sold: 'int',
    rating: 'float',
    description: 'string',
    shop: 'string',
  },
};

// CartItem Schema
export const CartItemSchema = {
  name: 'CartItem',
  primaryKey: 'id',
  properties: {
    id: 'string',
    productId: 'string',
    productName: 'string',
    price: 'float',
    quantity: 'int',
    image: 'string',
    categoryId: 'string',
    addedAt: 'date',
  },
};

// OrderItem Schema (items within an order)
export const OrderItemSchema = {
  name: 'OrderItem',
  primaryKey: 'id',
  properties: {
    id: 'string',
    orderId: 'string',
    productId: 'string',
    productName: 'string',
    price: 'float',
    quantity: 'int',
    image: 'string',
  },
};

// Order Schema
export const OrderSchema = {
  name: 'Order',
  primaryKey: 'id',
  properties: {
    id: 'string',
    items: 'OrderItem[]',
    address: 'string',
    phone: 'string',
    paymentMethod: 'string',
    note: 'string?',
    total: 'float',
    status: 'int',
    createdAt: 'date',
    confirmedAt: 'date?',
    cancelledAt: 'date?',
    cancelReason: 'string?',
  },
};

// ==================== DATABASE INITIALIZATION ====================

let realm = null;

export const initializeRealm = async () => {
  try {
    if (realm) return realm;
    
    realm = await Realm.open({
      schema: [UserSchema, CategorySchema, ProductSchema, CartItemSchema, OrderItemSchema, OrderSchema],
      schemaVersion: 1,
    });
    
    console.log('Realm initialized successfully');
    return realm;
  } catch (error) {
    console.error('Error initializing Realm:', error);
    throw error;
  }
};

export const getRealm = async () => {
  if (!realm) {
    await initializeRealm();
  }
  return realm;
};

export const closeRealm = () => {
  if (realm) {
    realm.close();
    realm = null;
  }
};

// ==================== DATABASE OPERATIONS ====================

// ===== USER OPERATIONS =====
export const createUser = async (userData) => {
  const realm = await getRealm();
  try {
    realm.write(() => {
      realm.create('User', {
        id: userData.id || `user_${Date.now()}`,
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName,
        phone: userData.phone,
        avatar: userData.avatar || '',
        createdAt: new Date(),
      });
    });
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const getUserByEmail = async (email) => {
  const realm = await getRealm();
  try {
    const user = realm.objects('User').filtered(`email = '${email}'`)[0];
    return user ? { ...user } : null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

export const updateUser = async (userId, updates) => {
  const realm = await getRealm();
  try {
    realm.write(() => {
      const user = realm.objectForPrimaryKey('User', userId);
      if (user) {
        Object.assign(user, updates);
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// ===== CATEGORY OPERATIONS =====
export const createCategory = async (categoryData) => {
  const realm = await getRealm();
  try {
    realm.write(() => {
      realm.create('Category', {
        id: categoryData.id,
        name: categoryData.name,
        image: categoryData.image,
      }, true); // upsert = true
    });
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const getAllCategories = async () => {
  const realm = await getRealm();
  try {
    const categories = realm.objects('Category');
    return categories.map(cat => ({ ...cat }));
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
};

export const seedCategories = async (categories) => {
  for (const category of categories) {
    await createCategory(category);
  }
};

// ===== PRODUCT OPERATIONS =====
export const createProduct = async (productData) => {
  const realm = await getRealm();
  try {
    realm.write(() => {
      realm.create('Product', {
        id: productData.id,
        name: productData.name,
        price: productData.price,
        originalPrice: productData.originalPrice,
        discount: productData.discount,
        image: productData.image,
        categoryId: productData.categoryId,
        sold: productData.sold || 0,
        rating: productData.rating || 0,
        description: productData.description || '',
        shop: productData.shop || '',
      }, true); // upsert = true
    });
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const getAllProducts = async () => {
  const realm = await getRealm();
  try {
    const products = realm.objects('Product');
    return products.map(prod => ({ ...prod }));
  } catch (error) {
    console.error('Error getting products:', error);
    throw error;
  }
};

export const getProductsByCategory = async (categoryId) => {
  const realm = await getRealm();
  try {
    const products = realm.objects('Product').filtered(`categoryId = '${categoryId}'`);
    return products.map(prod => ({ ...prod }));
  } catch (error) {
    console.error('Error getting products by category:', error);
    throw error;
  }
};

export const getProductById = async (productId) => {
  const realm = await getRealm();
  try {
    const product = realm.objectForPrimaryKey('Product', productId);
    return product ? { ...product } : null;
  } catch (error) {
    console.error('Error getting product:', error);
    throw error;
  }
};

export const seedProducts = async (products) => {
  for (const product of products) {
    await createProduct(product);
  }
};

// ===== CART OPERATIONS =====
export const addToCart = async (product, quantity = 1) => {
  const realm = await getRealm();
  try {
    realm.write(() => {
      const existing = realm.objects('CartItem').filtered(`productId = '${product.id}'`)[0];
      
      if (existing) {
        existing.quantity += quantity;
      } else {
        realm.create('CartItem', {
          id: `cart_${product.id}_${Date.now()}`,
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: quantity,
          image: product.image,
          categoryId: product.categoryId,
          addedAt: new Date(),
        });
      }
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const getAllCartItems = async () => {
  const realm = await getRealm();
  try {
    const items = realm.objects('CartItem');
    return items.map(item => ({ ...item }));
  } catch (error) {
    console.error('Error getting cart items:', error);
    throw error;
  }
};

export const updateCartItemQuantity = async (productId, quantity) => {
  const realm = await getRealm();
  try {
    realm.write(() => {
      const item = realm.objects('CartItem').filtered(`productId = '${productId}'`)[0];
      if (item) {
        if (quantity <= 0) {
          realm.delete(item);
        } else {
          item.quantity = quantity;
        }
      }
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

export const removeFromCart = async (productId) => {
  const realm = await getRealm();
  try {
    realm.write(() => {
      const item = realm.objects('CartItem').filtered(`productId = '${productId}'`)[0];
      if (item) {
        realm.delete(item);
      }
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

export const clearCart = async () => {
  const realm = await getRealm();
  try {
    realm.write(() => {
      const items = realm.objects('CartItem');
      realm.delete(items);
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

export const getCartTotal = async () => {
  const items = await getAllCartItems();
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

export const getCartItemCount = async () => {
  const items = await getAllCartItems();
  return items.reduce((sum, item) => sum + item.quantity, 0);
};

// ===== ORDER OPERATIONS =====
export const placeOrder = async (orderData) => {
  const realm = await getRealm();
  try {
    let newOrder = null;
    realm.write(() => {
      const orderItems = orderData.items.map((item, index) => 
        realm.create('OrderItem', {
          id: `orderitem_${Date.now()}_${index}`,
          orderId: `ORD${Date.now()}`,
          productId: item.product.id,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image,
        })
      );

      newOrder = realm.create('Order', {
        id: `ORD${Date.now()}`,
        items: orderItems,
        address: orderData.address,
        phone: orderData.phone,
        paymentMethod: orderData.paymentMethod || 'COD',
        note: orderData.note || '',
        total: orderData.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
        status: 1, // NEW
        createdAt: new Date(),
        confirmedAt: null,
        cancelledAt: null,
        cancelReason: null,
      });
    });
    return newOrder ? { ...newOrder } : null;
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
};

export const getAllOrders = async () => {
  const realm = await getRealm();
  try {
    const orders = realm.objects('Order').sorted('createdAt', true);
    return orders.map(order => {
      const items = order.items.map(item => ({ ...item }));
      return {
        ...order,
        items,
      };
    });
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  const realm = await getRealm();
  try {
    const order = realm.objectForPrimaryKey('Order', orderId);
    if (!order) return null;
    const items = order.items.map(item => ({ ...item }));
    return {
      ...order,
      items,
    };
  } catch (error) {
    console.error('Error getting order:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, newStatus) => {
  const realm = await getRealm();
  try {
    realm.write(() => {
      const order = realm.objectForPrimaryKey('Order', orderId);
      if (order) {
        order.status = newStatus;
        if (newStatus === 2) { // CONFIRMED
          order.confirmedAt = new Date();
        }
      }
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const cancelOrder = async (orderId, reason) => {
  const realm = await getRealm();
  try {
    realm.write(() => {
      const order = realm.objectForPrimaryKey('Order', orderId);
      if (order) {
        order.status = 6; // CANCELLED
        order.cancelledAt = new Date();
        order.cancelReason = reason || '';
      }
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

// ===== AUTO-CONFIRM ORDERS =====
export const autoConfirmOrders = async () => {
  const realm = await getRealm();
  try {
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    
    realm.write(() => {
      const newOrders = realm.objects('Order').filtered(`status = 1 AND createdAt < $0`, thirtyMinutesAgo);
      newOrders.forEach(order => {
        order.status = 2; // CONFIRMED
        order.confirmedAt = new Date();
      });
    });
  } catch (error) {
    console.error('Error auto-confirming orders:', error);
    throw error;
  }
};

// ===== DATABASE CHECK AND INITIALIZATION =====
export const initializeDatabase = async () => {
  try {
    const realm = await getRealm();
    
    // Check if we need to seed initial data
    const categoryCount = realm.objects('Category').length;
    
    if (categoryCount === 0) {
      console.log('Seeding initial data...');
      const mockData = require('../services/mockData');
      await seedCategories(mockData.mockCategories);
      await seedProducts(mockData.mockProducts);
      console.log('Initial data seeded successfully');
    }
    
    return realm;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export default {
  initializeRealm,
  getRealm,
  closeRealm,
  initializeDatabase,
  // User operations
  createUser,
  getUserByEmail,
  updateUser,
  // Category operations
  createCategory,
  getAllCategories,
  seedCategories,
  // Product operations
  createProduct,
  getAllProducts,
  getProductsByCategory,
  getProductById,
  seedProducts,
  // Cart operations
  addToCart,
  getAllCartItems,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  getCartTotal,
  getCartItemCount,
  // Order operations
  placeOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  autoConfirmOrders,
};
