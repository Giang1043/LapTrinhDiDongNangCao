import { sendOTPEmail } from './emailService';
import realmDB from '../database/realmDB';

let currentToken = null;

// Simulate async API delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// OTP functions from Realm
const generateOTP = realmDB.generateOTP;
const storeOTP = realmDB.storeOTP;
const verifyOTP = realmDB.verifyOTP;

export const authService = {
  // Register - gửi OTP qua email
  register: async ({ email, password, fullName, phone }) => {
    await delay();
    const existsInRealm = await realmDB.getUserByEmail(email);
    if (existsInRealm) {
      throw new Error('Email đã được sử dụng');
    }
    const otp = generateOTP();
    await storeOTP(`register_${email}`, otp);
    // Gửi OTP qua email thật
    const emailResult = await sendOTPEmail(email, otp, fullName);
    if (!emailResult.success) {
      console.warn('[OTP] Email gửi thất bại, OTP vẫn lưu local:', otp);
    }
    return {
      success: true,
      message: `Mã OTP đã gửi đến ${email}`,
      otp_for_testing: otp,
    };
  },

  // Verify OTP for registration
  verifyRegisterOTP: async ({ email, password, fullName, phone, otp }) => {
    await delay();
    const valid = await verifyOTP(`register_${email}`, otp);
    if (!valid) {
      throw new Error('Mã OTP không hợp lệ hoặc đã hết hạn');
    }
    // Save user to Realm
    const newUser = {
      id: String(Date.now()),
      email,
      password,
      fullName,
      phone,
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
    };
    await realmDB.createUser(newUser);
    return { success: true, message: 'Đăng ký thành công!', user: { ...newUser, password: undefined } };
  },

  // Login
  login: async ({ email, password }) => {
    await delay();
    try {
      // Get user from Realm database
      const realmUser = await realmDB.getUserByEmail(email);
      
      if (!realmUser || realmUser.password !== password) {
        throw new Error('Email hoặc mật khẩu không đúng');
      }
      
      currentToken = `mock_jwt_token_${realmUser.id}_${Date.now()}`;
      
      console.log('✅ Login successful from Realm:', realmUser.email);
      
      return {
        success: true,
        token: currentToken,
        user: { ...realmUser, password: undefined },
      };
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  },

  // Forgot Password - send OTP
  forgotPassword: async ({ email }) => {
    await delay();
    const realmUser = await realmDB.getUserByEmail(email);
    if (!realmUser) {
      throw new Error('Email không tồn tại trong hệ thống');
    }
    const otp = generateOTP();
    await storeOTP(`forgot_${email}`, otp);
    // Gửi OTP qua email thật
    const emailResult = await sendOTPEmail(email, otp, realmUser.fullName);
    if (!emailResult.success) {
      console.warn('[OTP] Email gửi thất bại, OTP vẫn lưu local:', otp);
    }
    return {
      success: true,
      message: `Mã OTP đã gửi đến ${email}`,
      otp_for_testing: otp,
    };
  },

  // Reset Password with OTP
  resetPassword: async ({ email, otp, newPassword }) => {
    await delay();
    const valid = await verifyOTP(`forgot_${email}`, otp);
    if (!valid) {
      throw new Error('Mã OTP không hợp lệ hoặc đã hết hạn');
    }
    const realmUser = await realmDB.getUserByEmail(email);
    if (realmUser) {
      await realmDB.updateUser(realmUser.id, { password: newPassword });
      console.log('✅ Password reset successfully for:', email);
    }
    return { success: true, message: 'Đặt lại mật khẩu thành công!' };
  },

  // Logout
  logout: async () => {
    await delay(200);
    currentToken = null;
    return { success: true };
  },

  getToken: () => currentToken,
};
