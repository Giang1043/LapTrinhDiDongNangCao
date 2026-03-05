/**
 * Realm Database Testing & Verification
 * Run tests to verify all database operations work correctly
 */

import {
  createUser,
  getUserByEmail,
  getUserById,
  updateUser,
  activateUser,
  getAllCategories,
  getCategoryById,
  getAllProducts,
  getProductsByCategory,
  searchProducts,
  filterProducts,
  addToCart,
  getCartItems,
  updateCartItem,
  removeFromCart,
  clearCart,
  createOrder,
  getOrderHistory,
  updateOrderStatus,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  clearAllData,
  initializeDatabase,
} from './realmService';

/**
 * Test all Realm operations
 */
export async function testAllRealmOperations() {
  try {
    console.log('\n========== REALM DATABASE TESTS ==========\n');

    // ===== USER TESTS =====
    console.log('📝 TEST 1: User Operations');
    console.log('Creating test user...');
    const user = await createUser(
      'testuser@example.com',
      'Test User',
      '0123456789',
      'hashed_foodapp_salt_2026_password123'
    );
    console.log('✅ User created:', user);

    console.log('Getting user by email...');
    const foundUser = await getUserByEmail('testuser@example.com');
    console.log('✅ User found:', foundUser.email);

    console.log('Getting user by ID...');
    const userById = await getUserById(user.id);
    console.log('✅ User retrieved:', userById.name);

    console.log('Updating user...');
    const updated = await updateUser(user.id, { phone: '9876543210' });
    console.log('✅ User updated, new phone:', updated.phone);

    console.log('Activating user...');
    const activated = await activateUser(user.email);
    console.log('✅ User activated, isActive:', activated.isActive);

    // ===== CATEGORY TESTS =====
    console.log('\n🏪 TEST 2: Category Operations');
    console.log('Getting all categories...');
    const categories = await getAllCategories();
    console.log('✅ Categories loaded:', categories.length);

    console.log('Getting category by ID...');
    const category = await getCategoryById(1);
    console.log('✅ Category found:', category.name);

    // ===== PRODUCT TESTS =====
    console.log('\n🍕 TEST 3: Product Operations');
    console.log('Getting all products...');
    const allProducts = await getAllProducts();
    console.log('✅ Products loaded:', allProducts.length);

    console.log('Getting products by category...');
    const categoryProducts = await getProductsByCategory(1);
    console.log('✅ Products in category:', categoryProducts.length);

    console.log('Searching products...');
    const searchResults = await searchProducts('pizza');
    console.log('✅ Search results:', searchResults.length, 'products found');

    console.log('Filtering products by price...');
    const filteredProducts = await filterProducts(null, 20000, 50000, 'price');
    console.log('✅ Filtered products:', filteredProducts.length);

    // ===== CART TESTS =====
    console.log('\n🛒 TEST 4: Cart Operations');
    const testUserId = user.id;
    const testProductId = 1;

    console.log('Adding item to cart...');
    const cartItem = await addToCart(testUserId, testProductId, 2);
    console.log('✅ Item added to cart:', cartItem.id);

    console.log('Getting cart items...');
    const items = await getCartItems(testUserId);
    console.log('✅ Cart items:', items.length);

    console.log('Updating cart item quantity...');
    const updatedCart = await updateCartItem(cartItem.id, 5);
    console.log('✅ Quantity updated to:', updatedCart.quantity);

    console.log('Removing item from cart...');
    await removeFromCart(cartItem.id);
    console.log('✅ Item removed from cart');

    // ===== ORDER TESTS =====
    console.log('\n📦 TEST 5: Order Operations');
    console.log('Adding items back to cart for order...');
    const newCartItem = await addToCart(testUserId, 1, 2);
    const newCartItem2 = await addToCart(testUserId, 2, 1);

    const orderItems = [
      { productId: 1, quantity: 2, price: 22500 }, // 25000 - 10%
      { productId: 2, quantity: 1, price: 80750 }, // 95000 - 15%
    ];

    console.log('Creating order...');
    const order = await createOrder(
      testUserId,
      orderItems,
      103250,
      '123 Main St, City, Country'
    );
    console.log('✅ Order created:', order.id);

    console.log('Getting order history...');
    const orders = await getOrderHistory(testUserId);
    console.log('✅ Orders found:', orders.length);

    console.log('Updating order status...');
    const updatedOrder = await updateOrderStatus(order.id, 'confirmed');
    console.log('✅ Order status updated to:', updatedOrder.status);

    // ===== FAVORITE TESTS =====
    console.log('\n❤️ TEST 6: Favorite Operations');
    console.log('Adding product to favorites...');
    const favorite = await addToFavorites(testUserId, 5);
    console.log('✅ Added to favorites:', favorite.productId);

    console.log('Getting favorites...');
    const favorites = await getFavorites(testUserId);
    console.log('✅ Favorites count:', favorites.length);

    console.log('Removing from favorites...');
    await removeFromFavorites(testUserId, 5);
    console.log('✅ Removed from favorites');

    console.log('\n========== ALL TESTS PASSED ✅ ==========\n');
    return true;
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('Full error:', error);
    return false;
  }
}

/**
 * Quick data verification
 */
export async function verifyDatabaseData() {
  try {
    console.log('\n========== DATABASE VERIFICATION ==========\n');

    const categories = await getAllCategories();
    console.log(`📂 Categories: ${categories.length}`);
    categories.forEach(cat => console.log(`   - ${cat.name}`));

    const products = await getAllProducts();
    console.log(`\n🍕 Products: ${products.length}`);
    products.slice(0, 3).forEach(prod => console.log(`   - ${prod.name} (${prod.price}đ)`));

    const users = []; // No getAll function for users, but we can test with specific user
    console.log('\n👤 Test User: testuser@example.com (if created)');

    console.log('\n========== VERIFICATION COMPLETE ==========\n');
    return true;
  } catch (error) {
    console.error('Verification error:', error);
    return false;
  }
}

/**
 * Reset database to clean state (for development)
 */
export async function resetDatabase() {
  try {
    console.log('Clearing all data...');
    await clearAllData();
    console.log('Initializing with fresh seed data...');
    await initializeDatabase();
    console.log('✅ Database reset successfully');
    return true;
  } catch (error) {
    console.error('Error resetting database:', error);
    return false;
  }
}
