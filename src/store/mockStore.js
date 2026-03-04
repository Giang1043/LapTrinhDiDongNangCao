// ============================================
// Mock Store - Centralized State Management
// ============================================

import { hashPassword } from '../utils/authHelpers';

// Mock users database
export const mockUsers = [
  {
    id: 1,
    email: 'tigiang2004@gmail.com',
    passwordHash: hashPassword('123456'),
    name: 'Cao Cự Giang',
    phone: '0375104778',
    isVerified: true,
  },
];

// OTP storage (temporary)
export const otpStore = {};

// JWT tokens storage
export const tokenStore = {};

/**
 * Find user by email
 */
export function findUserByEmail(email) {
  return mockUsers.find(u => u.email === email);
}

/**
 * Find user by ID
 */
export function findUserById(id) {
  return mockUsers.find(u => u.id === id);
}

/**
 * Add new user
 */
export function addUser(userData) {
  const newUser = {
    id: mockUsers.length + 1,
    ...userData,
    createdAt: new Date().getTime(),
  };
  mockUsers.push(newUser);
  return newUser;
}

/**
 * Update user
 */
export function updateUser(id, updates) {
  const user = findUserById(id);
  if (user) {
    Object.assign(user, updates);
  }
  return user;
}

/**
 * Store OTP
 */
export function storeOTP(key, code, expiryMs = 5 * 60 * 1000) {
  otpStore[key] = {
    code,
    expiresAt: new Date().getTime() + expiryMs,
    attempts: 0,
  };
}

/**
 * Get OTP
 */
export function getOTP(key) {
  return otpStore[key];
}

/**
 * Delete OTP
 */
export function deleteOTP(key) {
  delete otpStore[key];
}

/**
 * Increment OTP attempts
 */
export function incrementOTPAttempts(key) {
  if (otpStore[key]) {
    otpStore[key].attempts++;
  }
}
