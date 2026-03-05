// ============================================
// OTP Service - In-Memory OTP Store
// ============================================

import { generateOTP } from '../utils/authHelpers';
import { isValidEmail } from '../utils/validators';
import { checkRateLimit } from '../utils/rateLimit';

/**
 * In-Memory OTP Store
 * Stores OTP temporarily for verification
 * Auto-cleanup after expiration
 */
class OTPStore {
  constructor() {
    this.otpData = {};
  }

  /**
   * Store OTP for email
   * Default expiry: 5 minutes
   */
  store(key, code, expiresInSeconds = 300) {
    const now = new Date().getTime();
    const expiresAt = now + expiresInSeconds * 1000;

    this.otpData[key] = {
      code,
      expiresAt,
      attempts: 0,
      createdAt: now,
    };

    // Auto-cleanup after expiration
    setTimeout(() => {
      delete this.otpData[key];
      console.log(`🗑️ OTP expired and deleted for: ${key}`);
    }, expiresInSeconds * 1000 + 1000);

    console.log(`✓ OTP stored for ${key}, expires in ${expiresInSeconds}s`);
  }

  /**
   * Get OTP data
   */
  get(key) {
    return this.otpData[key] || null;
  }

  /**
   * Delete OTP
   */
  delete(key) {
    if (this.otpData[key]) {
      delete this.otpData[key];
      console.log(`✓ OTP deleted for: ${key}`);
    }
  }

  /**
   * Increment verification attempts
   */
  incrementAttempts(key) {
    if (this.otpData[key]) {
      this.otpData[key].attempts += 1;
    }
  }

  /**
   * Check if OTP exists
   */
  exists(key) {
    return !!this.otpData[key];
  }
}

// Initialize singleton OTP store
const otpStore = new OTPStore();

/**
 * Send OTP to email
 */
export const sendOTP = async (email) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        if (!isValidEmail(email)) {
          reject({
            success: false,
            message: 'Email không hợp lệ',
            code: 'INVALID_EMAIL',
          });
          return;
        }

        // Rate limiting
        if (!checkRateLimit(`otp_${email}`)) {
          reject({
            success: false,
            message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút',
            code: 'RATE_LIMITED',
          });
          return;
        }

        const otp = generateOTP();
        otpStore.store(email, otp, 300); // 5 minutes expiry

        console.log(`🔐 OTP for ${email}: ${otp} (expires in 5 min)`);

        resolve({
          success: true,
          message: `OTP đã được gửi tới ${email}`,
          otp: otp, // Dev only - remove in production
        });
      } catch (error) {
        reject({
          success: false,
          message: error.message || 'Lỗi khi gửi OTP',
          code: 'OTP_SEND_ERROR',
        });
      }
    }, 1000);
  });
};

/**
 * Verify OTP (Supports Signup and Forgot Password flows)
 */
export const verifyOTP = async (email, otp, type = 'signup') => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // Resource key based on type
        const key = type === 'forgot_password' ? `forgot_${email}` : email;

        const otpData = otpStore.get(key);

        if (!otpData) {
          reject({
            success: false,
            message: 'OTP chưa được gửi cho email này',
            code: 'NO_OTP_SENT',
          });
          return;
        }

        // Check expiry
        if (new Date().getTime() > otpData.expiresAt) {
          otpStore.delete(key);
          reject({
            success: false,
            message: 'OTP đã hết hạn, vui lòng yêu cầu OTP mới',
            code: 'OTP_EXPIRED',
          });
          return;
        }

        // Rate limiting for OTP verification
        otpStore.incrementAttempts(key);
        if (otpData.attempts > 5) {
          otpStore.delete(key);
          reject({
            success: false,
            message: 'Quá nhiều lần nhập sai, vui lòng yêu cầu OTP mới',
            code: 'OTP_ATTEMPTS_EXCEEDED',
          });
          return;
        }

        // Verify code
        if (otp !== otpData.code) {
          reject({
            success: false,
            message: 'OTP không chính xác',
            code: 'INVALID_OTP',
          });
          return;
        }

        // Only delete for signup flow
        // Keep it for forgot_password flow (needed by resetPasswordWithOTP)
        if (type === 'signup') {
          otpStore.delete(key);
        }

        console.log(`✓ OTP verified successfully for ${email}`);

        resolve({
          success: true,
          message: 'OTP xác thực thành công',
        });
      } catch (error) {
        reject({
          success: false,
          message: error.message || 'Lỗi khi xác thực OTP',
          code: 'OTP_VERIFICATION_ERROR',
        });
      }
    }, 800);
  });
};

/**
 * Request forgot password OTP
 */
export const requestForgotPasswordOTP = async (email) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // Validate email
        if (!isValidEmail(email)) {
          reject({
            success: false,
            message: 'Email không hợp lệ',
            code: 'INVALID_EMAIL',
          });
          return;
        }

        // Rate limiting
        if (!checkRateLimit(`forgot_${email}`)) {
          reject({
            success: false,
            message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút',
            code: 'RATE_LIMITED',
          });
          return;
        }

        const otp = generateOTP();
        otpStore.store(`forgot_${email}`, otp, 600); // 10 minutes for password reset

        console.log(`🔐 Forgot Password OTP for ${email}: ${otp}`);

        resolve({
          success: true,
          message: 'OTP đã được gửi tới email của bạn',
          otp: otp, // Dev only - remove in production
        });
      } catch (error) {
        reject({
          success: false,
          message: error.message || 'Lỗi khi yêu cầu OTP',
          code: 'OTP_REQUEST_ERROR',
        });
      }
    }, 1000);
  });
};

/**
 * Export OTP store for testing or admin purposes
 */
export const getOTPStore = () => otpStore;

export default {
  sendOTP,
  verifyOTP,
  requestForgotPasswordOTP,
  getOTPStore,
};
