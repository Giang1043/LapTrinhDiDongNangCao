const bcrypt = require('bcrypt');
const { generateToken, generateRefreshToken } = require('../config/jwt');
const db = require('../config/database');

exports.register = (req, res) => {
  const { email, password, fullName, phone } = req.body;

  try {
    // Validate input
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if email already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = bcrypt.hashSync(password, 10);

    // Create user
    const userId = `user_${Date.now()}`;
    db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, phone, role, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, email, passwordHash, fullName, phone || '', 'customer', 1, Date.now(), Date.now());

    // Create user preferences
    db.prepare(`
      INSERT INTO user_preferences (id, user_id, favorite_category_ids, language, notifications_enabled, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(`pref_${userId}`, userId, JSON.stringify([]), 'vi', 1, Date.now(), Date.now());

    // Generate tokens
    const token = generateToken(userId, 'customer');
    const refreshToken = generateRefreshToken(userId);

    // Store session
    db.prepare(`
      INSERT INTO sessions (id, user_id, token, token_expiry, refresh_token, refresh_token_expiry, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `session_${Date.now()}`,
      userId,
      token,
      Date.now() + (60 * 60 * 1000),
      refreshToken,
      Date.now() + (7 * 24 * 60 * 60 * 1000),
      Date.now()
    );

    res.status(201).json({
      success: true,
      userId,
      token,
      refreshToken,
      user: {
        id: userId,
        email,
        fullName,
        phone,
        role: 'customer'
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const token = generateToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Store/update session
    const session = db.prepare('SELECT id FROM sessions WHERE user_id = ?').get(user.id);
    
    if (session) {
      db.prepare(`
        UPDATE sessions 
        SET token = ?, token_expiry = ?, refresh_token = ?, refresh_token_expiry = ?
        WHERE user_id = ?
      `).run(
        token,
        Date.now() + (60 * 60 * 1000),
        refreshToken,
        Date.now() + (7 * 24 * 60 * 60 * 1000),
        user.id
      );
    } else {
      db.prepare(`
        INSERT INTO sessions (id, user_id, token, token_expiry, refresh_token, refresh_token_expiry, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        `session_${Date.now()}`,
        user.id,
        token,
        Date.now() + (60 * 60 * 1000),
        refreshToken,
        Date.now() + (7 * 24 * 60 * 60 * 1000),
        Date.now()
      );
    }

    // Update last login
    db.prepare('UPDATE users SET last_login = ? WHERE id = ?').run(Date.now(), user.id);

    res.json({
      success: true,
      userId: user.id,
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.logout = (req, res) => {
  try {
    const userId = req.user.id;
    
    // Delete session
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
