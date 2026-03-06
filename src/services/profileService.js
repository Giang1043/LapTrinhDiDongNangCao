// ============================================
// Profile Service
// Handle user profile updates and validations
// ============================================

import { hashPassword, verifyPassword } from '../utils/authHelpers';
import { isValidEmail, isValidPassword, isValidPhone } from '../utils/validators';
import UserRepository from '../database/repositories/UserRepository';

/**
 * Update user profile (name, phone, avatar)
 */
export const updateProfile = async (userId, updates) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const { name, phone, avatar } = updates;

        // Validate inputs
        if (name && name.trim().length < 2) {
          reject({
            success: false,
            message: 'Tên phải có ít nhất 2 ký tự',
            code: 'INVALID_NAME',
          });
          return;
        }

        if (phone && !isValidPhone(phone)) {
          reject({
            success: false,
            message: 'Số điện thoại không hợp lệ',
            code: 'INVALID_PHONE',
          });
          return;
        }

        // Prepare update data
        const updateData = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (avatar !== undefined) updateData.avatar = avatar;
        updateData.updatedAt = new Date();

        // Update in Realm
        const updatedUser = UserRepository.updateUser(userId, updateData);

        if (!updatedUser) {
          reject({
            success: false,
            message: 'Cập nhật thất bại',
            code: 'UPDATE_FAILED',
          });
          return;
        }

        console.log(`✓ Profile updated for user ${userId}`);

        resolve({
          success: true,
          message: 'Cập nhật hồ sơ thành công',
          user: updatedUser,
        });
      } catch (error) {
        reject({
          success: false,
          message: error.message || 'Lỗi cập nhật hồ sơ',
          code: 'PROFILE_UPDATE_ERROR',
        });
      }
    }, 1000);
  });
};

/**
 * Change password
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // Validate new password
        if (!isValidPassword(newPassword)) {
          reject({
            success: false,
            message: 'Mật khẩu mới phải tối thiểu 6 ký tự',
            code: 'INVALID_PASSWORD',
          });
          return;
        }

        // Get user
        const user = UserRepository.getUserById(userId);
        if (!user) {
          reject({
            success: false,
            message: 'Người dùng không tồn tại',
            code: 'USER_NOT_FOUND',
          });
          return;
        }

        // Verify current password
        if (!verifyPassword(currentPassword, user.passwordHash)) {
          reject({
            success: false,
            message: 'Mật khẩu hiện tại không chính xác',
            code: 'INVALID_CURRENT_PASSWORD',
          });
          return;
        }

        // Don't allow same password
        if (currentPassword === newPassword) {
          reject({
            success: false,
            message: 'Mật khẩu mới không được trùng với mật khẩu cũ',
            code: 'SAME_PASSWORD',
          });
          return;
        }

        // Update password
        const updatedUser = UserRepository.updateUser(userId, {
          passwordHash: hashPassword(newPassword),
          updatedAt: new Date(),
        });

        console.log(`✓ Password changed successfully for user ${userId}`);

        resolve({
          success: true,
          message: 'Đổi mật khẩu thành công',
          user: updatedUser,
        });
      } catch (error) {
        reject({
          success: false,
          message: error.message || 'Lỗi đổi mật khẩu',
          code: 'PASSWORD_CHANGE_ERROR',
        });
      }
    }, 1000);
  });
};

/**
 * Request email change with OTP verification
 */
export const requestEmailChange = async (userId, newEmail) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // Validate email
        if (!isValidEmail(newEmail)) {
          reject({
            success: false,
            message: 'Email không hợp lệ',
            code: 'INVALID_EMAIL',
          });
          return;
        }

        // Check if email already exists
        const existingUser = UserRepository.getUserByEmail(newEmail);
        if (existingUser) {
          reject({
            success: false,
            message: 'Email này đã được đăng ký',
            code: 'EMAIL_EXISTS',
          });
          return;
        }

        // For OTP verification, we'll need calling component to send OTP
        console.log(`✓ Email change requested for user ${userId}`);

        resolve({
          success: true,
          message: 'Vui lòng nhập OTP được gửi đến email mới',
          newEmail,
          requiresOTP: true,
        });
      } catch (error) {
        reject({
          success: false,
          message: error.message || 'Lỗi yêu cầu thay đổi email',
          code: 'EMAIL_REQUEST_ERROR',
        });
      }
    }, 800);
  });
};

/**
 * Confirm email change with OTP
 */
export const confirmEmailChange = async (userId, newEmail, otp) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // This will be called after OTP verification
        // Use specialized updateEmail function (only for OTP-verified flows)
        const updatedUser = UserRepository.updateEmail(userId, newEmail);

        if (!updatedUser) {
          reject({
            success: false,
            message: 'Cập nhật email thất bại',
            code: 'UPDATE_FAILED',
          });
          return;
        }

        console.log(`✓ Email changed successfully for user ${userId}`);

        resolve({
          success: true,
          message: 'Email đã được thay đổi thành công',
          user: updatedUser,
        });
      } catch (error) {
        reject({
          success: false,
          message: error.message || 'Lỗi thay đổi email',
          code: 'EMAIL_CHANGE_ERROR',
        });
      }
    }, 1000);
  });
};

/**
 * Request phone change with OTP verification
 */
export const requestPhoneChange = async (userId, newPhone) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // Validate phone
        if (!isValidPhone(newPhone)) {
          reject({
            success: false,
            message: 'Số điện thoại không hợp lệ',
            code: 'INVALID_PHONE',
          });
          return;
        }

        console.log(`✓ Phone change requested for user ${userId}`);

        resolve({
          success: true,
          message: 'Vui lòng nhập OTP được gửi đến số điện thoại mới',
          newPhone,
          requiresOTP: true,
        });
      } catch (error) {
        reject({
          success: false,
          message: error.message || 'Lỗi yêu cầu thay đổi số điện thoại',
          code: 'PHONE_REQUEST_ERROR',
        });
      }
    }, 800);
  });
};

/**
 * Confirm phone change with OTP
 */
export const confirmPhoneChange = async (userId, newPhone, otp) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // This will be called after OTP verification
        // Use specialized updatePhone function (only for OTP-verified flows)
        const updatedUser = UserRepository.updatePhone(userId, newPhone);

        if (!updatedUser) {
          reject({
            success: false,
            message: 'Cập nhật số điện thoại thất bại',
            code: 'UPDATE_FAILED',
          });
          return;
        }

        console.log(`✓ Phone changed successfully for user ${userId}`);

        resolve({
          success: true,
          message: 'Số điện thoại đã được thay đổi thành công',
          user: updatedUser,
        });
      } catch (error) {
        reject({
          success: false,
          message: error.message || 'Lỗi thay đổi số điện thoại',
          code: 'PHONE_CHANGE_ERROR',
        });
      }
    }, 1000);
  });
};

export default {
  updateProfile,
  changePassword,
  requestEmailChange,
  confirmEmailChange,
  requestPhoneChange,
  confirmPhoneChange,
};
