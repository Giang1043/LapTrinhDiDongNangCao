const db = require('../config/database');

// Get user's cart (USER ISOLATION - WHERE user_id = ?)
exports.getCart = (req, res) => {
  const userId = req.user.id; // USER ISOLATION

  try {
    const cartItems = db.prepare(`
      SELECT ci.id, ci.product_id, ci.quantity, ci.added_at,
             p.id as product_id_p, p.name, p.price, p.discount_percent, p.image_url, p.original_price
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
      ORDER BY ci.added_at DESC
    `).all(userId);

    // Transform to nested structure
    const items = cartItems.map(item => ({
      id: item.id,
      product: {
        id: item.product_id,
        name: item.name,
        price: item.price,
        discount: item.discount_percent,
        image: item.image_url,
        originalPrice: item.original_price
      },
      quantity: item.quantity
    }));

    const total = items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    res.json({
      success: true,
      data: {
        items: items,
        itemCount: items.length,
        total: Math.round(total * 100) / 100
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add to cart
exports.addToCart = (req, res) => {
  const userId = req.user.id; // USER ISOLATION
  const { productId, quantity } = req.body;

  try {
    if (!productId || !quantity) {
      return res.status(400).json({ error: 'Product ID and quantity required' });
    }

    // Validate product exists
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if item already in cart (per-user)
    const existing = db.prepare(
      'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?'
    ).get(userId, productId);

    if (existing) {
      // Update quantity
      db.prepare(`
        UPDATE cart_items 
        SET quantity = quantity + ?, updated_at = ?
        WHERE user_id = ? AND product_id = ?
      `).run(quantity, Date.now(), userId, productId);
    } else {
      // Insert new item (with user_id - CRITICAL!)
      db.prepare(`
        INSERT INTO cart_items (id, user_id, product_id, quantity, added_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        `cart_${Date.now()}_${Math.random()}`,
        userId,
        productId,
        quantity,
        Date.now(),
        Date.now()
      );
    }

    // Return updated cart
    const updatedCart = db.prepare(`
      SELECT ci.id, ci.product_id, ci.quantity,
             p.name, p.price, p.discount_percent, p.image_url, p.original_price
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `).all(userId);

    // Transform to nested structure
    const items = updatedCart.map(item => ({
      id: item.id,
      product: {
        id: item.product_id,
        name: item.name,
        price: item.price,
        discount: item.discount_percent,
        image: item.image_url,
        originalPrice: item.original_price
      },
      quantity: item.quantity
    }));

    res.json({ success: true, data: { items: items } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to transform cart response
const transformCartResponse = (cartItems) => {
  return cartItems.map(item => ({
    id: item.id,
    product: {
      id: item.product_id,
      name: item.name,
      price: item.price,
      discount: item.discount_percent,
      image: item.image_url,
      originalPrice: item.original_price
    },
    quantity: item.quantity
  }));
};

// Update cart item quantity
exports.updateQuantity = (req, res) => {
  const userId = req.user.id; // USER ISOLATION
  const { productId } = req.params;
  const { quantity } = req.body;

  try {
    if (!quantity || quantity < 0) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    if (quantity === 0) {
      // Remove item
      db.prepare(
        'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?'
      ).run(userId, productId);
    } else {
      // Update quantity
      db.prepare(
        'UPDATE cart_items SET quantity = ?, updated_at = ? WHERE user_id = ? AND product_id = ?'
      ).run(quantity, Date.now(), userId, productId);
    }

    // Return updated cart
    const updatedCart = db.prepare(`
      SELECT ci.id, ci.product_id, ci.quantity,
             p.name, p.price, p.discount_percent, p.image_url, p.original_price
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `).all(userId);

    res.json({ success: true, data: { items: transformCartResponse(updatedCart) } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove from cart
exports.removeFromCart = (req, res) => {
  const userId = req.user.id; // USER ISOLATION
  const { productId } = req.params;

  try {
    db.prepare(
      'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?'
    ).run(userId, productId);

    // Return updated cart
    const updatedCart = db.prepare(`
      SELECT ci.id, ci.product_id, ci.quantity,
             p.name, p.price, p.discount_percent, p.image_url, p.original_price
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `).all(userId);

    res.json({ success: true, data: { items: transformCartResponse(updatedCart) } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Clear cart
exports.clearCart = (req, res) => {
  const userId = req.user.id; // USER ISOLATION

  try {
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);
    res.json({ success: true, data: { items: [] } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
