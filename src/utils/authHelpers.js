// ============================================
// Authentication Helper Functions
// ============================================

// Giả lập hashing password (thực tế dùng bcrypt)
export function hashPassword(password) {
  const salt = 'foodapp_salt_2026';
  return `hashed_${salt}_${password}`;
}

// Verify password
export function verifyPassword(password, hash) {
  return hash === hashPassword(password);
}

// Generate OTP 6 digits
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate JWT Token (đơn giản)
export function generateJWT(userId) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      userId,
      iat: new Date().getTime(),
      exp: new Date().getTime() + 24 * 60 * 60 * 1000, // 24h expiry
    })
  );
  const signature = btoa('secret_key_foodapp');
  return `${header}.${payload}.${signature}`;
}

// Verify JWT Token
export function verifyJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp < new Date().getTime()) return null; // expired
    
    return payload;
  } catch {
    return null;
  }
}
