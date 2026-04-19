const db = require('../config/database');

function initializeDatabase() {
  console.log('🔧 Initializing database schema...');

  // Drop existing tables (for fresh start)
  const tables = [
    'audit_logs',
    'promotion_usage',
    'promotions',
    'user_preferences',
    'order_items',
    'orders',
    'cart_items',
    'sessions',
    'products',
    'categories',
    'users'
  ];

  tables.forEach(table => {
    try {
      db.prepare(`DROP TABLE IF EXISTS ${table}`).run();
      console.log(`  Dropped table: ${table}`);
    } catch (error) {
      console.warn(`  Warning dropping ${table}:`, error.message);
    }
  });

  // Create users table
  db.prepare(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT,
      avatar_url TEXT,
      address TEXT,
      city TEXT,
      role TEXT DEFAULT 'customer',
      is_active BOOLEAN DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER,
      last_login INTEGER
    )
  `).run();
  console.log('✅ Created users table');

  // Create sessions table
  db.prepare(`
    CREATE TABLE sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      token TEXT NOT NULL UNIQUE,
      token_expiry INTEGER,
      refresh_token TEXT UNIQUE,
      refresh_token_expiry INTEGER,
      created_at INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `).run();
  console.log('✅ Created sessions table');

  // Create categories table
  db.prepare(`
    CREATE TABLE categories (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      image_url TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at INTEGER,
      updated_at INTEGER
    )
  `).run();
  console.log('✅ Created categories table');

  // Create products table
  db.prepare(`
    CREATE TABLE products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      category_id TEXT NOT NULL,
      price REAL NOT NULL,
      original_price REAL,
      discount_percent INTEGER DEFAULT 0,
      image_url TEXT,
      stock_quantity INTEGER DEFAULT 0,
      sold_count INTEGER DEFAULT 0,
      rating REAL DEFAULT 0,
      rating_count INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      is_featured BOOLEAN DEFAULT 0,
      created_at INTEGER,
      updated_at INTEGER,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `).run();
  console.log('✅ Created products table');

  // Create cart_items table (USER-SCOPED)
  db.prepare(`
    CREATE TABLE cart_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      added_at INTEGER,
      updated_at INTEGER,
      UNIQUE(user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `).run();
  console.log('✅ Created cart_items table (user-scoped)');

  // Create orders table (USER-SCOPED)
  db.prepare(`
    CREATE TABLE orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE,
      user_id TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT NOT NULL,
      city TEXT,
      payment_method TEXT,
      total_amount REAL NOT NULL,
      discount_amount REAL DEFAULT 0,
      tax_amount REAL DEFAULT 0,
      shipping_cost REAL DEFAULT 0,
      final_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      note TEXT,
      admin_note TEXT,
      created_at INTEGER,
      updated_at INTEGER,
      confirmed_at INTEGER,
      shipped_at INTEGER,
      delivered_at INTEGER,
      cancelled_at INTEGER,
      cancelled_reason TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
    )
  `).run();
  console.log('✅ Created orders table (user-scoped)');

  // Create order_items table
  db.prepare(`
    CREATE TABLE order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      discount_per_item REAL DEFAULT 0,
      total_price REAL NOT NULL,
      created_at INTEGER,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `).run();
  console.log('✅ Created order_items table');

  // Create promotions table
  db.prepare(`
    CREATE TABLE promotions (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      description TEXT,
      discount_type TEXT,
      discount_value REAL NOT NULL,
      max_discount_amount REAL,
      min_order_amount REAL DEFAULT 0,
      max_uses_total INTEGER,
      max_uses_per_user INTEGER,
      current_uses INTEGER DEFAULT 0,
      valid_from INTEGER,
      valid_to INTEGER,
      is_active BOOLEAN DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    )
  `).run();
  console.log('✅ Created promotions table');

  // Create promotion_usage table
  db.prepare(`
    CREATE TABLE promotion_usage (
      id TEXT PRIMARY KEY,
      promotion_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      order_id TEXT NOT NULL,
      discount_amount REAL,
      used_at INTEGER,
      UNIQUE(promotion_id, user_id, order_id),
      FOREIGN KEY (promotion_id) REFERENCES promotions(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (order_id) REFERENCES orders(id)
    )
  `).run();
  console.log('✅ Created promotion_usage table');

  // Create user_preferences table
  db.prepare(`
    CREATE TABLE user_preferences (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      favorite_category_ids TEXT,
      language TEXT DEFAULT 'vi',
      notifications_enabled BOOLEAN DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `).run();
  console.log('✅ Created user_preferences table');

  // Create audit_logs table
  db.prepare(`
    CREATE TABLE audit_logs (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      old_values TEXT,
      new_values TEXT,
      user_id TEXT,
      created_at INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `).run();
  console.log('✅ Created audit_logs table');

  // Create indexes
  const indexes = [
    'CREATE INDEX idx_users_email ON users(email)',
    'CREATE INDEX idx_users_role ON users(role)',
    'CREATE INDEX idx_cart_items_user ON cart_items(user_id)',
    'CREATE INDEX idx_orders_user ON orders(user_id)',
    'CREATE INDEX idx_orders_status ON orders(status)',
    'CREATE INDEX idx_products_category ON products(category_id)',
    'CREATE INDEX idx_promotions_code ON promotions(code)',
    'CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id)'
  ];

  indexes.forEach(indexSql => {
    db.prepare(indexSql).run();
  });
  console.log('✅ Created all indexes');

  console.log('\n✅ Database initialized successfully!');
}

module.exports = initializeDatabase;

// Only run if this is the main module
if (require.main === module) {
  initializeDatabase();
}
