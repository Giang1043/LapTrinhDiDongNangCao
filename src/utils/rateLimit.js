// ============================================
// Rate Limiting Utility
// ============================================

const attemptStore = {};

// Rate limiting check
export function checkRateLimit(identifier, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  const key = `attempts_${identifier}`;
  const now = Date.now();
  
  if (!attemptStore[key]) {
    attemptStore[key] = { count: 0, resetTime: now + windowMs };
  }

  if (now > attemptStore[key].resetTime) {
    attemptStore[key] = { count: 0, resetTime: now + windowMs };
  }

  attemptStore[key].count++;

  if (attemptStore[key].count > maxAttempts) {
    return false; // Rate limit exceeded
  }

  return true;
}

// Reset rate limit for identifier
export function resetRateLimit(identifier) {
  const key = `attempts_${identifier}`;
  delete attemptStore[key];
}

// Get remaining attempts
export function getRemainingAttempts(identifier, maxAttempts = 5) {
  const key = `attempts_${identifier}`;
  if (!attemptStore[key]) {
    return maxAttempts;
  }
  return Math.max(0, maxAttempts - attemptStore[key].count);
}
