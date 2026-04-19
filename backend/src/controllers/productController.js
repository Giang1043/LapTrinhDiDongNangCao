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

// Helper function to transform category data
const transformCategory = (cat) => ({
  id: cat.id,
  name: cat.name,
  image: cat.image_url,
});

// Get all categories
exports.getCategories = (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT * FROM categories
      ORDER BY sort_order ASC
    `).all();

    res.json({
      success: true,
      data: categories.map(transformCategory)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get products by category
exports.getProducts = (req, res) => {
  try {
    const { categoryId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM products WHERE is_active = 1';
    let countQuery = 'SELECT COUNT(*) as count FROM products WHERE is_active = 1';
    const params = [];

    if (categoryId) {
      query += ' AND category_id = ?';
      countQuery += ' AND category_id = ?';
      params.push(categoryId);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const products = db.prepare(query).all(...params);
    const countParams = categoryId ? [categoryId] : [];
    const countResult = db.prepare(countQuery).get(...countParams);

    res.json({
      success: true,
      data: {
        products: products.map(transformProduct),
        pagination: {
          page,
          limit,
          total: countResult.count,
          totalPages: Math.ceil(countResult.count / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get featured products
exports.getFeaturedProducts = (req, res) => {
  try {
    const products = db.prepare(`
      SELECT * FROM products
      WHERE is_active = 1 AND is_featured = 1
      ORDER BY created_at DESC
    `).all();

    res.json({
      success: true,
      data: products.map(transformProduct)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get product detail
exports.getProductDetail = (req, res) => {
  try {
    const { productId } = req.params;

    const product = db.prepare(`
      SELECT * FROM products WHERE id = ? AND is_active = 1
    `).get(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      success: true,
      data: transformProduct(product)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search products
exports.searchProducts = (req, res) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    if (!query) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const searchTerm = `%${query}%`;
    const products = db.prepare(`
      SELECT * FROM products
      WHERE is_active = 1 AND (name LIKE ? OR description LIKE ?)
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(searchTerm, searchTerm, limit, offset);

    const countResult = db.prepare(`
      SELECT COUNT(*) as count FROM products
      WHERE is_active = 1 AND (name LIKE ? OR description LIKE ?)
    `).get(searchTerm, searchTerm);

    res.json({
      success: true,
      data: {
        products: products.map(transformProduct),
        pagination: {
          page,
          limit,
          total: countResult.count,
          totalPages: Math.ceil(countResult.count / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
