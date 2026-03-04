// ============================================
// Password Service
// ============================================

import { hashPassword } from '../utils/authHelpers';
import { isValidPassword } from '../utils/validators';
import { findUserByEmail, getOTP, deleteOTP, incrementOTPAttempts, updateUser } from '../store/mockStore';

/**
 * Verify forgot password OTP and reset password
 */
export const resetPasswordWithOTP = async (email, otp, newPassword) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const key = `forgot_${email}`;

      const otpData = getOTP(key);

      if (!otpData) {
        reject({
          success: false,
          message: 'OTP chưa được yêu cầu cho email này',
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

      // Rate limiting
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

      // Verify OTP
      if (otp !== otpData.code) {
        reject({
          success: false,
          message: 'OTP không chính xác',
          code: 'INVALID_OTP',
        });
        return;
      }

      // Validate new password
      if (!isValidPassword(newPassword)) {
        reject({
          success: false,
          message: 'Mật khẩu phải tối thiểu 6 ký tự',
          code: 'INVALID_PASSWORD',
        });
        return;
      }

      // Find user and update password
      const user = findUserByEmail(email);
      if (!user) {
        reject({
          success: false,
          message: 'Người dùng không tồn tại',
          code: 'USER_NOT_FOUND',
        });
        return;
      }

      updateUser(user.id, {
        passwordHash: hashPassword(newPassword),
      });
      deleteOTP(key);

      resolve({
        success: true,
        message: 'Mật khẩu đã được thay đổi thành công',
      });
    }, 1000);
  });
};
