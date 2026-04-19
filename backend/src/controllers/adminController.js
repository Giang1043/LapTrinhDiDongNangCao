const db = require('../config/database');

// Helper function to transform product data
const transformProduct = (prod) => ({
  id: prod.id,
  name: prod.name,
  description: prod.description,
  categoryId: prod.category_id,
  price: prod.price,
  originalPrice: prod.original_price,
  discount: prod.discount_percent,
  image: prod.image_url,
  sold: prod.sold_count,
  rating: prod.rating,
  isActive: prod.is_active,
});

// Dashboard statistics
exports.getDashboardStats = (req, res) => {
  try {
    // Total orders
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;

    // Total users
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('customer').count;

    // Total products
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products WHERE is_active = 1').get().count;

    // Total revenue
    const totalRevenueResult = db.prepare('SELECT SUM(total_amount) as total FROM orders WHERE status != ?').get('cancelled');
    const totalRevenue = totalRevenueResult.total || 0;

    // Orders today (created_at is timestamp in ms, convert to days)
    const todayMs = new Date().setHours(0, 0, 0, 0);
    const tomorrowMs = todayMs + 86400000;
    const ordersToday = db.prepare(
      'SELECT COUNT(*) as count FROM orders WHERE created_at >= ? AND created_at < ?'
    ).get(todayMs, tomorrowMs).count;

    // New users today
    const newUsersToday = db.prepare(
      'SELECT COUNT(*) as count FROM users WHERE created_at >= ? AND created_at < ? AND role = ?'
    ).get(todayMs, tomorrowMs, 'customer').count;

    res.json({
      success: true,
      data: {
        totalOrders,
        totalUsers,
        totalProducts,
        totalRevenue,
        ordersToday,
        newUsersToday,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all orders (admin view)
exports.getAllOrders = (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status;

    let query = 'SELECT * FROM orders';
    let countQuery = 'SELECT COUNT(*) as count FROM orders';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      countQuery += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const orders = db.prepare(query).all(...params);
    const countParams = status ? [status] : [];
    const countResult = db.prepare(countQuery).get(...countParams);

    // Get order items for each order
    const ordersWithItems = orders.map(order => ({
      ...order,
      items: db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id)
    }));

    res.json({
      success: true,
      data: ordersWithItems,
      pagination: {
        page,
        limit,
        total: countResult.count,
        totalPages: Math.ceil(countResult.count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get order detail
exports.getOrderDetail = (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(order.user_id);

    res.json({
      success: true,
      data: {
        ...order,
        items,
        user
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update order status
exports.updateOrderStatus = (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Valid statuses: ${validStatuses.join(', ')}` });
    }

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const now = Date.now(); // Use timestamp in milliseconds
    
    // Simple update - just update status and timestamp
    // If database has old schema, only update what exists
    try {
      db.prepare(`
        UPDATE orders 
        SET status = ?, updated_at = ?
        WHERE id = ?
      `).run(status, now, orderId);
    } catch (dbError) {
      // If that fails, it might be a schema issue - try to add columns dynamically
      console.error('Update failed, attempting schema fix...');
      
      // Try to add missing columns if they don't exist
      try {
        db.prepare('ALTER TABLE orders ADD COLUMN shipped_at INTEGER').run();
      } catch (e) { /* column might already exist */ }
      
      try {
        db.prepare('ALTER TABLE orders ADD COLUMN delivered_at INTEGER').run();
      } catch (e) { /* column might already exist */ }
      
      try {
        db.prepare('ALTER TABLE orders ADD COLUMN cancelled_at INTEGER').run();
      } catch (e) { /* column might already exist */ }
      
      // Retry the update
      db.prepare(`
        UPDATE orders 
        SET status = ?, updated_at = ?
        WHERE id = ?
      `).run(status, now, orderId);
    }

    res.json({ success: true, message: 'Order status updated successfully', data: { orderId, status } });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all users (admin view)
exports.getAllUsers = (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const users = db.prepare(`
      SELECT id, email, full_name, phone, role, is_active, created_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    const countResult = db.prepare('SELECT COUNT(*) as count FROM users').get();

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total: countResult.count,
        totalPages: Math.ceil(countResult.count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Deactivate user
exports.deactivateUser = (req, res) => {
  try {
    const { userId } = req.params;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    db.prepare('UPDATE users SET is_active = 0 WHERE id = ?').run(userId);

    res.json({ success: true, message: 'User deactivated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all products (admin view)
exports.getAllProducts = (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const products = db.prepare(`
      SELECT * FROM products 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    const countResult = db.prepare('SELECT COUNT(*) as count FROM products').get();

    res.json({
      success: true,
      data: products.map(transformProduct),
      pagination: {
        page,
        limit,
        total: countResult.count,
        totalPages: Math.ceil(countResult.count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create product
exports.createProduct = (req, res) => {
  try {
    const { name, description, category_id, price, image_url, is_featured, stock_qty } = req.body;

    if (!name || !price || !category_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = `prod_${Date.now()}`;
    db.prepare(`
      INSERT INTO products 
      (id, name, description, category_id, price, image_url, is_featured, is_active, stock_quantity)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run(id, name, description, category_id, price, image_url || '', is_featured ? 1 : 0, stock_qty || 0);

    res.status(201).json({
      success: true,
      data: { id, name, description, category_id, price, stock_qty: stock_qty || 0 }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update product
exports.updateProduct = (req, res) => {
  try {
    const { productId } = req.params;
    const { name, description, category_id, price, is_featured, is_active, stock_qty } = req.body;

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    db.prepare(`
      UPDATE products 
      SET name = ?, description = ?, category_id = ?, price = ?, is_featured = ?, is_active = ?, stock_quantity = ?
      WHERE id = ?
    `).run(
      name || product.name,
      description || product.description,
      category_id || product.category_id,
      price || product.price,
      is_featured !== undefined ? (is_featured ? 1 : 0) : product.is_featured,
      is_active !== undefined ? (is_active ? 1 : 0) : product.is_active,
      stock_qty !== undefined ? stock_qty : product.stock_quantity,
      productId
    );

    res.json({ success: true, message: 'Product updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete product
exports.deleteProduct = (req, res) => {
  try {
    const { productId } = req.params;

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Soft delete by marking as inactive
    db.prepare('UPDATE products SET is_active = 0 WHERE id = ?').run(productId);

    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all categories
exports.getCategories = (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT id, name, COALESCE(image_url, '') as image, sort_order, '' as description 
      FROM categories 
      ORDER BY sort_order ASC
    `).all();

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create category
exports.createCategory = (req, res) => {
  try {
    const { name, sort_order, image } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const id = `cat_${Date.now()}`;
    db.prepare(`
      INSERT INTO categories (id, name, sort_order, image_url)
      VALUES (?, ?, ?, ?)
    `).run(id, name, sort_order || 999, image || '');

    res.status(201).json({
      success: true,
      data: { id, name, image_url: image }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update category
exports.updateCategory = (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, sort_order, image } = req.body;

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    db.prepare(`
      UPDATE categories 
      SET name = ?, sort_order = ?, image_url = ?
      WHERE id = ?
    `).run(
      name || category.name,
      sort_order !== undefined ? sort_order : category.sort_order,
      image || category.image_url,
      categoryId
    );

    res.json({ success: true, message: 'Category updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete category
exports.deleteCategory = (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if category has products
    const productCount = db.prepare('SELECT COUNT(*) as count FROM products WHERE category_id = ?').get(categoryId).count;
    if (productCount > 0) {
      return res.status(400).json({ error: 'Cannot delete category with products' });
    }

    db.prepare('DELETE FROM categories WHERE id = ?').run(categoryId);

    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reactivate user
exports.reactivateUser = (req, res) => {
  try {
    const { userId } = req.params;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    db.prepare('UPDATE users SET is_active = 1 WHERE id = ?').run(userId);

    res.json({ success: true, message: 'User reactivated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
