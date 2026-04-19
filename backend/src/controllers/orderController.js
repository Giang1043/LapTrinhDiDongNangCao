const db = require('../config/database');

// Get user's orders (USER ISOLATION)
exports.getUserOrders = (req, res) => {
  const userId = req.user.id; // USER ISOLATION
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  try {
    const orders = db.prepare(`
      SELECT id, order_number, address, phone, payment_method, total_amount, 
             final_amount, status, note, created_at, updated_at
      FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(userId, limit, offset);

    const countResult = db.prepare(
      'SELECT COUNT(*) as count FROM orders WHERE user_id = ?'
    ).get(userId);

    const ordersWithItems = orders.map(order => {
      const items = db.prepare(`
        SELECT id, product_id, product_name, quantity, unit_price, total_price
        FROM order_items WHERE order_id = ?
      `).all(order.id);

      return {
        id: order.id,
        orderNumber: order.order_number,
        address: order.address,
        phone: order.phone,
        paymentMethod: order.payment_method,
        total: order.total_amount,
        totalAmount: order.total_amount,
        finalAmount: order.final_amount,
        status: order.status,
        note: order.note,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        items: items.map(item => ({
          id: item.id,
          productId: item.product_id,
          productName: item.product_name,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price
        }))
      };
    });

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

// Get order detail (USER ISOLATION - prevents User A from seeing User B's order)
exports.getOrderDetail = (req, res) => {
  const userId = req.user.id; // USER ISOLATION
  const { orderId } = req.params;

  try {
    const order = db.prepare(`
      SELECT id, order_number, address, phone, payment_method, total_amount, 
             final_amount, status, note, created_at, updated_at
      FROM orders WHERE id = ? AND user_id = ?
    `).get(orderId, userId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = db.prepare(`
      SELECT id, product_id, product_name, quantity, unit_price, total_price
      FROM order_items WHERE order_id = ?
    `).all(orderId);

    res.json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.order_number,
        address: order.address,
        phone: order.phone,
        paymentMethod: order.payment_method,
        total: order.total_amount,
        totalAmount: order.total_amount,
        finalAmount: order.final_amount,
        status: order.status,
        note: order.note,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        items: items.map(item => ({
          id: item.id,
          productId: item.product_id,
          productName: item.product_name,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create order (checkout)
exports.createOrder = (req, res) => {
  const userId = req.user.id; // USER ISOLATION
  const { address, phone, paymentMethod, note } = req.body;

  try {
    // Get cart items (only this user's cart)
    const cartItems = db.prepare(`
      SELECT ci.*, p.price, p.name
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `).all(userId);

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate total
    let totalAmount = 0;
    cartItems.forEach(item => {
      totalAmount += item.price * item.quantity;
    });

    // Create order
    const orderId = `order_${Date.now()}`;
    const orderNumber = `ORD${Date.now()}`;

    db.prepare(`
      INSERT INTO orders 
      (id, order_number, user_id, address, phone, payment_method, total_amount, final_amount, status, note, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      orderId,
      orderNumber,
      userId,
      address,
      phone,
      paymentMethod || 'COD',
      totalAmount,
      totalAmount,
      1, // status: NEW
      note || '',
      Date.now(),
      Date.now()
    );

    // Create order items
    const insertOrderItem = db.prepare(`
      INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, total_price, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    cartItems.forEach(item => {
      insertOrderItem.run(
        `item_${Date.now()}_${Math.random()}`,
        orderId,
        item.product_id,
        item.name,
        item.quantity,
        item.price,
        item.price * item.quantity,
        Date.now()
      );
    });

    // Clear cart (only this user's cart)
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);

    res.status(201).json({
      success: true,
      data: {
        id: orderId,
        orderId,
        orderNumber,
        total: totalAmount,
        totalAmount,
        status: 1,
        message: 'Order created successfully'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cancel order (USER ISOLATION - prevents User A from canceling User B's order)
exports.cancelOrder = (req, res) => {
  const userId = req.user.id; // USER ISOLATION
  const { orderId } = req.params;
  const { reason } = req.body;

  try {
    const order = db.prepare(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?'
    ).get(orderId, userId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status === 6) {
      return res.status(400).json({ error: 'Order already cancelled' });
    }

    if (order.status > 4) {
      return res.status(400).json({ error: 'Cannot cancel order at this status' });
    }

    db.prepare(`
      UPDATE orders
      SET status = 6, cancelled_at = ?, cancelled_reason = ?, updated_at = ?
      WHERE id = ?
    `).run(Date.now(), reason || '', Date.now(), orderId);

    res.json({ success: true, message: 'Order cancelled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
