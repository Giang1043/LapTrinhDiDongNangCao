const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure db folder exists
const dbDir = path.join(__dirname, '../../db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH || path.join(dbDir, 'foodapp.db');

console.log('📁 Database path:', dbPath);

// Open database
const db = new Database(dbPath, {
  verbose: (msg) => {
    if (process.env.NODE_ENV === 'development') {
      // console.log('🔍 SQL:', msg);
    }
  }
});

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Test connection
try {
  db.prepare('SELECT 1').get();
  console.log('✅ Database connected successfully');
} catch (error) {
  console.error('❌ Database connection failed:', error.message);
  process.exit(1);
}

module.exports = db;
