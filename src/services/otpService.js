// ============================================
// OTP Service
// ============================================

import { generateOTP } from '../utils/authHelpers';
import { isValidEmail } from '../utils/validators';
import { checkRateLimit } from '../utils/rateLimit';
import { storeOTP, getOTP, deleteOTP, incrementOTPAttempts } from '../store/mockStore';

/**
 * Send OTP to email
 */
export const sendOTP = async (email) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
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
      storeOTP(email, otp);

      console.log(`🔐 OTP for ${email}: ${otp} (expires in 5 min)`);

      resolve({
        success: true,
        message: `OTP đã được gửi tới ${email}`,
        otp: otp, // Dev only
      });
    }, 1000);
  });
};

/**
 * Verify OTP (Supports Signup and Forgot Password flows)
 */
export const verifyOTP = async (email, otp, type = 'signup') => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Resource key based on type
      const key = type === 'forgot_password' ? `forgot_${email}` : email;

      const otpData = getOTP(key);

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
        deleteOTP(key);
        reject({
          success: false,
          message: 'OTP đã hết hạn, vui lòng yêu cầu OTP mới',
          code: 'OTP_EXPIRED',
        });
        return;
      }

      // Rate limiting for OTP verification
      incrementOTPAttempts(key);
      if (otpData.attempts > 5) {
        deleteOTP(key);
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
        deleteOTP(key);
      }

      resolve({
        success: true,
        message: 'OTP xác thực thành công',
      });
    }, 800);
  });
};

/**
 * Request forgot password OTP
 */
export const requestForgotPasswordOTP = async (email) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
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
      storeOTP(`forgot_${email}`, otp);

      console.log(`🔐 Forgot Password OTP for ${email}: ${otp}`);

      resolve({
        success: true,
        message: 'OTP đã được gửi tới email của bạn',
        otp: otp, // Dev only
      });
    }, 1000);
  });
};
