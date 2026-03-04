// ============================================
// Validation Utilities
// ============================================

// Email validation
export function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Validate password strength
export function isValidPassword(password) {
  return password && password.length >= 6;
}

// Validate phone number (Vietnamese format)
export function isValidPhone(phone) {
  const regex = /^(\+84|0)[0-9]{9,10}$/;
  return regex.test(phone);
}

// Check if user info is complete
export function isUserInfoComplete(email, password, name, phone) {
  return !!(email && password && name && phone);
}
