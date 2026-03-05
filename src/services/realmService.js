/**
 * Realm Database Service
 * All database operations for FoodApp
 * Handles: Users, Products, Categories, Cart, Orders, Favorites
 * WITH FALLBACK: If Realm is not available (Expo Go), gracefully degrades
 */

  /**
 * IMPORTANT: Realm requires a development build to work.
 * For development on Expo Go, this service gracefully falls back to AsyncStorage.
 * 
 * To use Realm:
 * 1. npx expo install expo-dev-client
 * 2. npx expo run:android (or npx expo run:ios)
 * 3. App will then use real Realm database
 * 4. Can connect Realm Studio for database management
 */

let Realm = null;
let UserSchema = null,
  CategorySchema = null,
  ProductSchema = null,
  CartItemSchema = null,
  OrderSchema = null,
  OrderItemSchema = null,
  FavoriteSchema = null,
  allSchemas = null;

let realmImportError = null;
let realmInitialized = false;

async function initializeRealmImports() {
  try {
    if (Realm === null && !realmInitialized) {
      realmInitialized = true;
      try {
        Realm = require('realm').default;
        const models = require('./realmModels');
        UserSchema = models.UserSchema;
        CategorySchema = models.CategorySchema;
        ProductSchema = models.ProductSchema;
        CartItemSchema = models.CartItemSchema;
        OrderSchema = models.OrderSchema;
        OrderItemSchema = models.OrderItemSchema;
        FavoriteSchema = models.FavoriteSchema;
        allSchemas = models.allSchemas;
        console.log('✅ Realm loaded successfully');
      } catch (importError) {
        realmImportError = importError;
        console.log('❌ REALM IMPORT ERROR:', importError.message);
        console.log('   Full error:', importError);
        console.log('ℹ️ Realm not available - using AsyncStorage mode');
      }
    }
  } catch (error) {
    realmImportError = error;
    console.log('❌ REALM INIT ERROR:', error.message);
  }
}

let realm = null;

/**
 * Open or get existing Realm connection
 */
export async function openRealm() {
  try {
    await initializeRealmImports();

    if (!Realm) {
      console.log('❌ Realm is null/undefined - falling back to AsyncStorage');
      if (realmImportError) {
        console.log('   Import Error:', realmImportError.message);
      }
      return null;
    }

    if (!realm || realm.isClosed) {
      console.log('🔄 Opening Realm database...');
      realm = await Realm.open({
        schema: allSchemas,
        schemaVersion: 1,
        migration: (oldRealm, newRealm) => {
          // Handle schema version updates here if needed
        },
      });
      console.log('✅ Realm database opened');
      console.log('📍 DATABASE LOCATION:');
      console.log(`   Path: ${realm.path}`);
      console.log(`   📱 Pull command: adb pull "${realm.path}" ./`);
      console.log(`   🔗 Open with: Realm Studio → File → Open Realm File`);
    }
    return realm;
  } catch (error) {
    console.log('❌ ERROR opening Realm:', error.message);
    console.log('   Full error:', error);
    console.log('ℹ️ Database operating in AsyncStorage mode');
    realmImportError = error;
    return null;
  }
}

/**
 * Close Realm connection
 */
export async function closeRealm() {
  try {
    if (realm && !realm.isClosed) {
      realm.close();
      realm = null;
      console.log('Realm database closed');
    }
  } catch (error) {
    console.error('Error closing Realm:', error);
  }
}

// ============ USER OPERATIONS ============

/**
 * Create new user account
 */
export async function createUser(email, name, phone, passwordHash) {
  try {
    const r = await openRealm();
    if (!r) throw new Error('Database not available');

    // Check if user already exists
    const existing = r.objects('User').filtered(`email = "${email}"`);
    if (existing.length > 0) {
      throw new Error('Email already registered');
    }

    // Generate new ID
    let newUserId = 1;
    const users = r.objects('User');
    if (users.length > 0) {
      newUserId = Math.max(...users.map(u => u.id)) + 1;
    }

    let createdUser = null;
    r.write(() => {
      createdUser = r.create('User', {
        id: newUserId,
        email,
        name,
        phone,
        passwordHash,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    console.log('✓ User created:', email);
    return JSON.parse(JSON.stringify(createdUser));
  } catch (error) {
    // Silent fail - will use AsyncStorage fallback
    throw error;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email) {
  try {
    const r = await openRealm();
    if (!r) throw new Error('Database not available');
    const users = r.objects('User').filtered(`email = "${email}"`);
    return users.length > 0 ? JSON.parse(JSON.stringify(users[0])) : null;
  } catch (error) {
    // Silent fail - will use AsyncStorage fallback
    throw error;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(id) {
  try {
    const r = await openRealm();
    const user = r.objectForPrimaryKey('User', id);
    return user ? JSON.parse(JSON.stringify(user)) : null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
}

/**
 * Update user information
 */
export async function updateUser(id, updates) {
  try {
    const r = await openRealm();
    const user = r.objectForPrimaryKey('User', id);

    if (!user) throw new Error('User not found');

    r.write(() => {
      Object.entries(updates).forEach(([key, value]) => {
        user[key] = value;
      });
      user.updatedAt = new Date();
    });

    console.log('User updated:', id);
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Activate user account (verify email)
 */
export async function activateUser(email) {
  try {
    const r = await openRealm();
    if (!r) throw new Error('Database not available');
    const users = r.objects('User').filtered(`email = "${email}"`);

    if (users.length === 0) throw new Error('User not found');

    r.write(() => {
      users[0].isActive = true;
      users[0].updatedAt = new Date();
    });

    console.log('✓ User activated:', email);
    return JSON.parse(JSON.stringify(users[0]));
  } catch (error) {
    // Silent fail
    throw error;
  }
}

// ============ CATEGORY OPERATIONS ============

/**
 * Get all categories
 */
export async function getAllCategories() {
  try {
    const r = await openRealm();
    if (!r) throw new Error('Database not available');
    const categories = r.objects('Category');
    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    // Silent fail
    throw error;
  }
}

/**
 * Get category by ID
 */
export async function getCategoryById(id) {
  try {
    const r = await openRealm();
    const category = r.objectForPrimaryKey('Category', id);
    return category ? JSON.parse(JSON.stringify(category)) : null;
  } catch (error) {
    console.error('Error getting category:', error);
    throw error;
  }
}

/**
 * Seed initial categories
 */
export async function seedCategories() {
  try {
    const r = await openRealm();
    if (!r) throw new Error('Database not available');
    const categories = r.objects('Category');

    if (categories.length > 0) {
      return;
    }

    const mockCategories = [
      {
        id: 1,
        name: '🍔 Bánh mì',
        icon: '🍔',
        description: 'Bánh mì thơm ngon',
        createdAt: new Date(),
      },
      {
        id: 2,
        name: '🍕 Pizza',
        icon: '🍕',
        description: 'Pizza kiểu Ý',
        createdAt: new Date(),
      },
      {
        id: 3,
        name: '🍜 Mì',
        icon: '🍜',
        description: 'Các loại mì',
        createdAt: new Date(),
      },
      {
        id: 4,
        name: '🍱 Cơm',
        icon: '🍱',
        description: 'Cơm các kiểu',
        createdAt: new Date(),
      },
      {
        id: 5,
        name: '🥗 Salad',
        icon: '🥗',
        description: 'Salad tươi mới',
        createdAt: new Date(),
      },
    ];

    r.write(() => {
      mockCategories.forEach(cat => {
        r.create('Category', cat);
      });
    });

    console.log('✓ Categories seeded:', mockCategories.length);
  } catch (error) {
    // Silent fail
    throw error;
  }
}

// ============ PRODUCT OPERATIONS ============

/**
 * Get all products
 */
export async function getAllProducts() {
  try {
    const r = await openRealm();
    const products = r.objects('Product');
    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error('Error getting all products:', error);
    throw error;
  }
}

/**
 * Get products by category
 */
export async function getProductsByCategory(categoryId) {
  try {
    const r = await openRealm();
    const products = r.objects('Product').filtered(`categoryId = ${categoryId}`);
    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error('Error getting products by category:', error);
    throw error;
  }
}

/**
 * Search products by name or description
 */
export async function searchProducts(query) {
  try {
    const r = await openRealm();
    const products = r.objects('Product');
    // Case-insensitive search
    const filtered = products.filtered(
      `name CONTAINS[c] "${query}" OR description CONTAINS[c] "${query}"`
    );
    return JSON.parse(JSON.stringify(filtered));
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
}

/**
 * Get product by ID
 */
export async function getProductById(id) {
  try {
    const r = await openRealm();
    const product = r.objectForPrimaryKey('Product', id);
    return product ? JSON.parse(JSON.stringify(product)) : null;
  } catch (error) {
    console.error('Error getting product:', error);
    throw error;
  }
}

/**
 * Filter and sort products
 */
export async function filterProducts(categoryId, minPrice, maxPrice, sortBy = 'rating') {
  try {
    const r = await openRealm();
    let products = r.objects('Product');

    // Filter by category
    if (categoryId) {
      products = products.filtered(`categoryId = ${categoryId}`);
    }

    // Filter by price range
    if (minPrice !== undefined && maxPrice !== undefined) {
      products = products.filtered(`price BETWEEN {${minPrice}, ${maxPrice}}`);
    }

    // Sort
    if (sortBy === 'price') {
      products = products.sorted('price', false);
    } else if (sortBy === 'rating') {
      products = products.sorted('rating', false);
    }

    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error('Error filtering products:', error);
    throw error;
  }
}

/**
 * Seed initial products
 */
export async function seedProducts() {
  try {
    const r = await openRealm();
    if (!r) throw new Error('Database not available');
    const products = r.objects('Product');

    if (products.length > 0) {
      return;
    }

    const mockProducts = [
      {
        id: 1,
        categoryId: 1,
        name: 'Bánh mì thịt nướng',
        price: 25000,
        discount: 10,
        image: '🥖',
        rating: 4.5,
        description: 'Bánh mì giòn với thịt nướng thơm ngon',
        stock: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        categoryId: 2,
        name: 'Pizza Pepperoni',
        price: 95000,
        discount: 15,
        image: '🍕',
        rating: 4.8,
        description: 'Pizza với xúc xích Pepperoni',
        stock: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        categoryId: 3,
        name: 'Phở bò',
        price: 35000,
        discount: 5,
        image: '🍜',
        rating: 4.7,
        description: 'Phở bò nóng hổi',
        stock: 40,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        categoryId: 4,
        name: 'Mì xào',
        price: 40000,
        discount: 8,
        image: '🍲',
        rating: 4.6,
        description: 'Mì xào với rau và thịt',
        stock: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 5,
        categoryId: 5,
        name: 'Salad kale',
        price: 45000,
        discount: 12,
        image: '🥗',
        rating: 4.4,
        description: 'Salad kale với dressing tươi mới',
        stock: 25,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 6,
        categoryId: 1,
        name: 'Bánh mì pâté',
        price: 20000,
        discount: 5,
        image: '🥪',
        rating: 4.3,
        description: 'Bánh mì mềm với pâté',
        stock: 45,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 7,
        categoryId: 2,
        name: 'Pizza Margarita',
        price: 80000,
        discount: 10,
        image: '🍕',
        rating: 4.6,
        description: 'Pizza với hoa quả tươi',
        stock: 35,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 8,
        categoryId: 3,
        name: 'Mì ramen',
        price: 50000,
        discount: 0,
        image: '🍜',
        rating: 4.9,
        description: 'Mì ramen Nhật Bản',
        stock: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    r.write(() => {
      mockProducts.forEach(product => {
        r.create('Product', product);
      });
    });

    console.log('✓ Products seeded:', mockProducts.length);
  } catch (error) {
    // Silent fail
    throw error;
  }
}

// ============ CART OPERATIONS ============

/**
 * Add item to cart
 */
export async function addToCart(userId, productId, quantity) {
  try {
    const r = await openRealm();

    // Generate new ID
    let newCartItemId = 1;
    const cartItems = r.objects('CartItem');
    if (cartItems.length > 0) {
      newCartItemId = Math.max(...cartItems.map(c => c.id)) + 1;
    }

    let cartItem = null;
    r.write(() => {
      cartItem = r.create('CartItem', {
        id: newCartItemId,
        userId,
        productId,
        quantity,
        addedAt: new Date(),
        updatedAt: new Date(),
      });
    });

    console.log('Added to cart:', productId);
    return JSON.parse(JSON.stringify(cartItem));
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}

/**
 * Get cart items for user
 */
export async function getCartItems(userId) {
  try {
    const r = await openRealm();
    const cartItems = r.objects('CartItem').filtered(`userId = ${userId}`);
    return JSON.parse(JSON.stringify(cartItems));
  } catch (error) {
    console.error('Error getting cart items:', error);
    throw error;
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(cartItemId, quantity) {
  try {
    const r = await openRealm();
    const cartItem = r.objectForPrimaryKey('CartItem', cartItemId);

    if (!cartItem) throw new Error('Cart item not found');

    r.write(() => {
      cartItem.quantity = quantity;
      cartItem.updatedAt = new Date();
    });

    return JSON.parse(JSON.stringify(cartItem));
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(cartItemId) {
  try {
    const r = await openRealm();
    const cartItem = r.objectForPrimaryKey('CartItem', cartItemId);

    if (!cartItem) throw new Error('Cart item not found');

    r.write(() => {
      r.delete(cartItem);
    });

    console.log('Removed from cart:', cartItemId);
    return true;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
}

/**
 * Clear entire cart for user
 */
export async function clearCart(userId) {
  try {
    const r = await openRealm();
    const cartItems = r.objects('CartItem').filtered(`userId = ${userId}`);

    r.write(() => {
      r.delete(cartItems);
    });

    console.log('Cart cleared for user:', userId);
    return true;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
}

// ============ ORDER OPERATIONS ============

/**
 * Create new order
 */
export async function createOrder(userId, items, totalPrice, deliveryAddress) {
  try {
    const r = await openRealm();

    // Generate new order ID
    let newOrderId = 1;
    const orders = r.objects('Order');
    if (orders.length > 0) {
      newOrderId = Math.max(...orders.map(o => o.id)) + 1;
    }

    let order = null;
    r.write(() => {
      order = r.create('Order', {
        id: newOrderId,
        userId,
        totalPrice,
        status: 'pending',
        paymentMethod: 'cash',
        deliveryAddress,
        notes: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create order items
      items.forEach(item => {
        let newOrderItemId = 1;
        const orderItems = r.objects('OrderItem');
        if (orderItems.length > 0) {
          newOrderItemId = Math.max(...orderItems.map(oi => oi.id)) + 1;
        }

        r.create('OrderItem', {
          id: newOrderItemId,
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          priceAtOrder: item.price,
        });
      });
    });

    console.log('Order created:', order.id);
    return JSON.parse(JSON.stringify(order));
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

/**
 * Get order history for user
 */
export async function getOrderHistory(userId) {
  try {
    const r = await openRealm();
    const orders = r
      .objects('Order')
      .filtered(`userId = ${userId}`)
      .sorted('createdAt', true);
    return JSON.parse(JSON.stringify(orders));
  } catch (error) {
    console.error('Error getting order history:', error);
    throw error;
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId, status) {
  try {
    const r = await openRealm();
    const order = r.objectForPrimaryKey('Order', orderId);

    if (!order) throw new Error('Order not found');

    r.write(() => {
      order.status = status;
      order.updatedAt = new Date();
    });

    console.log('Order status updated:', orderId, status);
    return JSON.parse(JSON.stringify(order));
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId) {
  try {
    const r = await openRealm();
    const order = r.objectForPrimaryKey('Order', orderId);
    return order ? JSON.parse(JSON.stringify(order)) : null;
  } catch (error) {
    console.error('Error getting order:', error);
    throw error;
  }
}

// ============ FAVORITE OPERATIONS ============

/**
 * Add product to favorites
 */
export async function addToFavorites(userId, productId) {
  try {
    const r = await openRealm();

    // Check if already favorited
    const favorites = r.objects('Favorite');
    const existing = favorites.filtered(
      `userId = ${userId} AND productId = ${productId}`
    );
    if (existing.length > 0) {
      throw new Error('Already in favorites');
    }

    // Generate new ID
    let newFavoriteId = 1;
    if (favorites.length > 0) {
      newFavoriteId = Math.max(...favorites.map(f => f.id)) + 1;
    }

    let favorite = null;
    r.write(() => {
      favorite = r.create('Favorite', {
        id: newFavoriteId,
        userId,
        productId,
        createdAt: new Date(),
      });
    });

    console.log('Added to favorites:', productId);
    return JSON.parse(JSON.stringify(favorite));
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
}

/**
 * Remove product from favorites
 */
export async function removeFromFavorites(userId, productId) {
  try {
    const r = await openRealm();
    const favorites = r.objects('Favorite');
    const favorite = favorites.filtered(
      `userId = ${userId} AND productId = ${productId}`
    );

    if (favorite.length === 0) throw new Error('Not in favorites');

    r.write(() => {
      r.delete(favorite[0]);
    });

    console.log('Removed from favorites:', productId);
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
}

/**
 * Get favorites for user
 */
export async function getFavorites(userId) {
  try {
    const r = await openRealm();
    const favorites = r.objects('Favorite').filtered(`userId = ${userId}`);
    return JSON.parse(JSON.stringify(favorites));
  } catch (error) {
    console.error('Error getting favorites:', error);
    throw error;
  }
}

// ============ UTILITY ============

/**
 * Clear all data (for testing/reset)
 */
export async function clearAllData() {
  try {
    const r = await openRealm();
    r.write(() => {
      r.deleteAll();
    });
    console.log('All data cleared');
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
}

/**
 * Initialize database with seed data
 */
export async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    await openRealm();
    await seedCategories();
    await seedProducts();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

/**
 * 🔍 GET REALM DATABASE LOCATION
 * Hữu ích để pull file từ device
 */
export async function getRealmDatabaseInfo() {
  try {
    const r = await openRealm();
    
    if (!r) {
      return {
        status: '⚠️ AsyncStorage Mode',
        message: 'Realm not available (Expo Go?). Use: npx expo run:android',
        dbPath: null,
        pullCommand: null,
      };
    }

    const dbPath = r.path;
    const pullCommand = `adb pull "${dbPath}" ./`;
    
    return {
      status: '✅ Realm Active',
      dbPath,
      pullCommand,
      instructions: [
        `1. Run: ${pullCommand}`,
        `2. Open Realm Studio → File → Open Realm File`,
        `3. Select the downloaded file to view/edit data`,
      ],
    };
  } catch (error) {
    console.error('Error getting database info:', error);
    return {
      status: '❌ Error',
      error: error.message,
    };
  }
}

/**
 * 📊 PRINT DATABASE INFO TO CONSOLE
 * Gọi khi app khởi động để xem tip
 */
export async function printRealmInfo() {
  const info = await getRealmDatabaseInfo();
  
  console.log('\n' + '='.repeat(60));
  console.log('🗄️  REALM DATABASE INFO');
  console.log('='.repeat(60));
  console.log(`Status: ${info.status}`);
  
  if (info.dbPath) {
    console.log(`Database Path: ${info.dbPath}`);
    console.log(`Pull Command: ${info.pullCommand}`);
    console.log('\nHướng dẫn quản lý dữ liệu:');
    info.instructions.forEach(step => console.log(`  ${step}`));
  } else {
    console.log(`Message: ${info.message}`);
  }
  
  console.log('='.repeat(60) + '\n');
}
