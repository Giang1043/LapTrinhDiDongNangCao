import Realm from 'realm';

// ==================== SEED DATA ====================
const SEED_TEST_USER = {
  id: '1',
  email: 'hieu@test.com',
  password: '123456',
  fullName: 'Hoang Ba Hieu',
  phone: '0901234567',
  avatar: 'https://i.pravatar.cc/150?img=3',
};

const SEED_CATEGORIES = [
  { id: '1', name: 'Cơm', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=200' },
  { id: '2', name: 'Phở & Bún', image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=200' },
  { id: '3', name: 'Pizza', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200' },
  { id: '4', name: 'Burger', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200' },
  { id: '5', name: 'Trà sữa', image: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=200' },
  { id: '6', name: 'Gà rán', image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=200' },
  { id: '7', name: 'Bánh mì', image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=200' },
  { id: '8', name: 'Lẩu', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200' },
  { id: '9', name: 'Sushi', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200' },
  { id: '10', name: 'Đồ uống', image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=200' },
];

const SEED_PRODUCTS = [
  { id: '1', name: 'Cơm tấm sườn bì chả', price: 45000, originalPrice: 55000, discount: 18, image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=400', categoryId: '1', sold: 320, rating: 4.8, description: 'Cơm tấm sườn bì chả truyền thống Sài Gòn', shop: 'Quán Cơm Tấm Sài Gòn' },
  { id: '2', name: 'Cơm gà Hải Nam', price: 50000, originalPrice: 60000, discount: 17, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400', categoryId: '1', sold: 280, rating: 4.7, description: 'Cơm gà Hải Nam với gà luộc mềm', shop: 'Hải Nam Kitchen' },
  { id: '4', name: 'Phở bò tái nạm', price: 55000, originalPrice: 70000, discount: 21, image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400', categoryId: '2', sold: 450, rating: 4.9, description: 'Phở bò truyền thống Hà Nội', shop: 'Phở Thìn Hà Nội' },
  { id: '7', name: 'Pizza Margherita', price: 89000, originalPrice: 120000, discount: 26, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', categoryId: '3', sold: 210, rating: 4.7, description: 'Pizza Margherita với sốt cà chua', shop: 'Pizza House' },
  { id: '9', name: 'Classic Beef Burger', price: 65000, originalPrice: 80000, discount: 19, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', categoryId: '4', sold: 260, rating: 4.6, description: 'Burger bò Úc 100%', shop: 'Burger Bros' },
  { id: '11', name: 'Trà sữa trân châu đường đen', price: 35000, originalPrice: 45000, discount: 22, image: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=400', categoryId: '5', sold: 520, rating: 4.9, description: 'Trà sữa đường đen béo ngậy', shop: 'Tiger Sugar' },
  { id: '13', name: 'Gà rán sốt cay', price: 75000, originalPrice: 95000, discount: 21, image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400', categoryId: '6', sold: 410, rating: 4.8, description: 'Gà rán giòn phủ sốt cay Hàn Quốc', shop: 'Korean Chicken' },
];

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

// OTP Schema for storing OTP codes temporarily
export const OTPSchema = {
  name: 'OTP',
  primaryKey: 'key',
  properties: {
    key: 'string',
    otp: 'string',
    expiry: 'date',
    createdAt: 'date',
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
      schema: [UserSchema, CategorySchema, ProductSchema, CartItemSchema, OrderItemSchema, OTPSchema, OrderSchema],
      schemaVersion: 2,
    });
    
    console.log('✅ Realm initialized successfully');
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

export const resetDatabase = async () => {
  try {
    if (realm) {
      realm.close();
      realm = null;
    }
    // Delete the Realm file
    await Realm.deleteFile({ path: 'foodapp.realm' });
    console.log('✅ Realm database reset (deleted all data)');
    // Reinitialize with fresh data
    await initializeRealm();
    await initializeDatabase();
    console.log('✅ Realm database reinitialized with seed data');
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
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
    const users = realm.objects('User').filtered(`email = $0`, email);
    if (users.length > 0) {
      return { ...users[0] };
    }
    return null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  const realm = await getRealm();
  try {
    const user = realm.objectForPrimaryKey('User', userId);
    return user ? { ...user } : null;
  } catch (error) {
    console.error('Error getting user by id:', error);
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

export const getAllUsers = async () => {
  const realm = await getRealm();
  try {
    const users = realm.objects('User');
    return users.map(user => ({ ...user }));
  } catch (error) {
    console.error('Error getting all users:', error);
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

export const seedTestUsers = async (users) => {
  try {
    console.log(`📝 Seeding ${users.length} test users...`);
    
    for (const user of users) {
      try {
        // Check both by ID and email to avoid duplicates
        const existsById = await getUserById(user.id);
        const existsByEmail = await getUserByEmail(user.email);
        
        if (!existsById && !existsByEmail) {
          await createUser({
            id: user.id,
            email: user.email,
            password: user.password,
            fullName: user.fullName,
            phone: user.phone,
            avatar: user.avatar,
          });
          console.log(`✅ Seeded user: ${user.email} (ID: ${user.id})`);
        } else {
          console.log(`⏭️  User already exists: ${user.email}`);
        }
      } catch (error) {
        console.error(`❌ Error seeding user ${user.email}:`, error);
      }
    }
  } catch (error) {
    console.error('Error seeding test users:', error);
    throw error;
  }
};

export const seedCategories = async (categories) => {
  for (const category of categories) {
    await createCategory(category);
  }
};

// ===== OTP OPERATIONS =====
export const storeOTP = async (key, otp) => {
  const realm = await getRealm();
  try {
    realm.write(() => {
      realm.create('OTP', {
        key,
        otp,
        expiry: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        createdAt: new Date(),
      }, 'modified');
    });
    console.log(`✅ OTP stored for key: ${key}`);
  } catch (error) {
    console.error('Error storing OTP:', error);
    throw error;
  }
};

export const verifyOTP = async (key, otp) => {
  const realm = await getRealm();
  try {
    const otpRecord = realm.objectForPrimaryKey('OTP', key);
    
    if (!otpRecord) {
      console.log(`❌ OTP not found for key: ${key}`);
      return false;
    }
    
    if (new Date() > otpRecord.expiry) {
      console.log(`❌ OTP expired for key: ${key}`);
      realm.write(() => {
        realm.delete(otpRecord);
      });
      return false;
    }
    
    if (otpRecord.otp === otp) {
      console.log(`✅ OTP verified for key: ${key}`);
      realm.write(() => {
        realm.delete(otpRecord);
      });
      return true;
    }
    
    console.log(`❌ OTP mismatch for key: ${key}`);
    return false;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const deleteCategory = async (categoryId) => {
  const realm = await getRealm();
  try {
    realm.write(() => {
      const category = realm.objectForPrimaryKey('Category', categoryId);
      if (category) {
        realm.delete(category);
      }
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
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

export const updateProductPrice = async (productId, newPrice) => {
  const realm = await getRealm();
  try {
    realm.write(() => {
      const product = realm.objectForPrimaryKey('Product', productId);
      if (product) {
        product.price = newPrice;
      }
    });
  } catch (error) {
    console.error('Error updating product price:', error);
    throw error;
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
    const userCount = realm.objects('User').length;
    
    // Seed test user ID=1 if it doesn't exist
    try {
      const testUser = await getUserById('1');
      if (!testUser) {
        console.log('📝 Seeding test user (ID=1)...');
        await seedTestUsers([SEED_TEST_USER]);
        console.log('✅ Test user seeded successfully');
      } else {
        console.log('✓ Test user (ID=1) already exists');
      }
    } catch (error) {
      console.log('📝 Seeding test user (ID=1)...');
      await seedTestUsers([SEED_TEST_USER]);
      console.log('✅ Test user seeded successfully');
    }
    
    if (categoryCount === 0) {
      console.log('📝 Seeding initial data (categories & products)...');
      await seedCategories(SEED_CATEGORIES);
      await seedProducts(SEED_PRODUCTS);
      console.log('✅ Initial data seeded successfully');
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
  getUserById,
  updateUser,
  getAllUsers,
  seedTestUsers,
  // Category operations
  createCategory,
  getAllCategories,
  seedCategories,
  deleteCategory,
  // Product operations
  createProduct,
  getAllProducts,
  getProductsByCategory,
  getProductById,
  seedProducts,
  updateProductPrice,
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
