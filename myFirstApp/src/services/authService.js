import { mockUsers, generateOTP, storeOTP, verifyOTP } from './mockData';
import { sendOTPEmail } from './emailService';

let users = [...mockUsers];
let currentToken = null;

// Simulate async API delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  // Register - gửi OTP qua email
  register: async ({ email, password, fullName, phone }) => {
    await delay();
    const exists = users.find(u => u.email === email);
    if (exists) {
      throw new Error('Email đã được sử dụng');
    }
    const otp = generateOTP();
    storeOTP(`register_${email}`, otp);
    // Gửi OTP qua email thật
    const emailResult = await sendOTPEmail(email, otp, fullName);
    if (!emailResult.success) {
      console.warn('[OTP] Email gửi thất bại, OTP vẫn lưu local:', otp);
    }
    return {
      success: true,
      message: `Mã OTP đã gửi đến ${email}`,
    };
  },

  // Verify OTP for registration
  verifyRegisterOTP: async ({ email, password, fullName, phone, otp }) => {
    await delay();
    const valid = verifyOTP(`register_${email}`, otp);
    if (!valid) {
      throw new Error('Mã OTP không hợp lệ hoặc đã hết hạn');
    }
    const newUser = {
      id: String(users.length + 1),
      email,
      password,
      fullName,
      phone,
      avatar: `https://i.pravatar.cc/150?img=${users.length + 5}`,
    };
    users.push(newUser);
    return { success: true, message: 'Đăng ký thành công!', user: { ...newUser, password: undefined } };
  },

  // Login
  login: async ({ email, password }) => {
    await delay();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }
    currentToken = `mock_jwt_token_${user.id}_${Date.now()}`;
    return {
      success: true,
      token: currentToken,
      user: { ...user, password: undefined },
    };
  },

  // Forgot Password - send OTP
  forgotPassword: async ({ email }) => {
    await delay();
    const user = users.find(u => u.email === email);
    if (!user) {
      throw new Error('Email không tồn tại trong hệ thống');
    }
    const otp = generateOTP();
    storeOTP(`forgot_${email}`, otp);
    // Gửi OTP qua email thật
    const emailResult = await sendOTPEmail(email, otp, user.fullName);
    if (!emailResult.success) {
      console.warn('[OTP] Email gửi thất bại, OTP vẫn lưu local:', otp);
    }
    return {
      success: true,
      message: `Mã OTP đã gửi đến ${email}`,
    };
  },

  // Reset Password with OTP
  resetPassword: async ({ email, otp, newPassword }) => {
    await delay();
    const valid = verifyOTP(`forgot_${email}`, otp);
    if (!valid) {
      throw new Error('Mã OTP không hợp lệ hoặc đã hết hạn');
    }
    const user = users.find(u => u.email === email);
    if (user) {
      user.password = newPassword;
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
