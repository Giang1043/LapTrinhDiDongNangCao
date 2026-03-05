// ============================================
// Authentication Service (Refactored)
// ============================================

import { hashPassword, verifyPassword, generateJWT, verifyJWT } from '../utils/authHelpers';
import { isValidEmail, isValidPassword, isUserInfoComplete } from '../utils/validators';
import { checkRateLimit } from '../utils/rateLimit';
import UserRepository from '../database/repositories/UserRepository';


/**
 * Register new user with OTP verification required
 */
export const registerUser = async (email, password, name, phone) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // Validation
        if (!isUserInfoComplete(email, password, name, phone)) {
          reject({
            success: false,
            message: 'Vui lòng điền đầy đủ thông tin',
            code: 'MISSING_FIELDS',
          });
          return;
        }

        if (!isValidEmail(email)) {
          reject({
            success: false,
            message: 'Email không hợp lệ',
            code: 'INVALID_EMAIL',
          });
          return;
        }

        if (!isValidPassword(password)) {
          reject({
            success: false,
            message: 'Mật khẩu phải tối thiểu 6 ký tự',
            code: 'PASSWORD_TOO_SHORT',
          });
          return;
        }

        // Check email exists
        if (UserRepository.getUserByEmail(email)) {
          reject({
            success: false,
            message: 'Email đã được đăng ký',
            code: 'EMAIL_EXISTS',
          });
          return;
        }

        // Create user (not verified yet)
        const newUser = UserRepository.createUser({
          email,
          passwordHash: hashPassword(password),
          name,
          phone,
        });

        resolve({
          success: true,
          message: 'Đăng ký thành công, vui lòng xác thực OTP',
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            phone: newUser.phone,
          },
          requiresOTPVerification: true,
        });
      } catch (error) {
        reject({
          success: false,
          message: error.message || 'Đăng ký thất bại',
          code: 'REGISTRATION_ERROR',
        });
      }
    }, 1200);
  });
};

/**
 * Activate account after OTP verification
 */
export const activateAccount = async (email) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const user = UserRepository.getUserByEmail(email);

        if (!user) {
          reject({
            success: false,
            message: 'Người dùng không tồn tại',
            code: 'USER_NOT_FOUND',
          });
          return;
        }

        if (user.isActive) {
          reject({
            success: false,
            message: 'Tài khoản đã được xác thực',
            code: 'ALREADY_VERIFIED',
          });
          return;
        }

        // Activate account
        const activatedUser = UserRepository.activateUser(email);

        // Generate JWT token
        const token = generateJWT(user.id);

        resolve({
          success: true,
          message: 'Tài khoản đã được xác thực',
          user: {
            id: activatedUser.id,
            email: activatedUser.email,
            name: activatedUser.name,
            phone: activatedUser.phone,
          },
          token,
        });
      } catch (error) {
        reject({
          success: false,
          message: error.message || 'Xác thực thất bại',
          code: 'ACTIVATION_ERROR',
        });
      }
    }, 800);
  });
};

/**
 * Login user with email and password
 */
export const loginUser = async (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // Validation
        if (!email || !password) {
          checkRateLimit(`login_${email}`);
          reject({
            success: false,
            message: 'Vui lòng nhập email và mật khẩu',
            code: 'MISSING_FIELDS',
          });
          return;
        }

        // Rate limiting
        if (!checkRateLimit(`login_${email}`)) {
          reject({
            success: false,
            message: 'Quá nhiều lần đăng nhập thất bại, thử lại sau 15 phút',
            code: 'RATE_LIMITED',
          });
          return;
        }

        // Find user
        const user = UserRepository.getUserByEmail(email);

        if (!user) {
          reject({
            success: false,
            message: 'Email hoặc mật khẩu không chính xác',
            code: 'INVALID_CREDENTIALS',
          });
          return;
        }

        if (!user.isActive) {
          reject({
            success: false,
            message: 'Tài khoản chưa được xác thực, vui lòng kiểm tra email',
            code: 'ACCOUNT_NOT_VERIFIED',
          });
          return;
        }

        // Verify password
        if (!verifyPassword(password, user.passwordHash)) {
          reject({
            success: false,
            message: 'Email hoặc mật khẩu không chính xác',
            code: 'INVALID_CREDENTIALS',
          });
          return;
        }

        // Generate JWT token
        const token = generateJWT(user.id);

        resolve({
          success: true,
          message: 'Đăng nhập thành công',
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
          },
          token,
        });
      } catch (error) {
        reject({
          success: false,
          message: error.message || 'Đăng nhập thất bại',
          code: 'LOGIN_ERROR',
        });
      }
    }, 1200);
  });
};

/**
 * Verify JWT token (for API calls)
 */
export const verifyToken = async (token) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const decoded = verifyJWT(token);

        if (!decoded) {
          reject({
            success: false,
            message: 'Token không hợp lệ hoặc đã hết hạn',
            code: 'INVALID_TOKEN',
          });
          return;
        }

        const user = UserRepository.getUserById(decoded.userId);

        if (!user) {
          reject({
            success: false,
            message: 'Người dùng không tồn tại',
            code: 'USER_NOT_FOUND',
          });
          return;
        }

        resolve({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
          },
        });
      } catch (error) {
        reject({
          success: false,
          message: error.message || 'Xác minh token thất bại',
          code: 'TOKEN_VERIFICATION_ERROR',
        });
      }
    }, 200);
  });
};
