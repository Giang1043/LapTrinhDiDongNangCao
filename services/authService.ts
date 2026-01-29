import apiClient from './api';
import {
  AuthResponse,
  OTPResponse,
  RegisterRequest,
  LoginRequest,
  VerifyOTPRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '@/types/auth';

// Service xử lý các API liên quan đến xác thực

/**
 * Đăng ký tài khoản
 * Gửi yêu cầu đăng ký và nhận OTP để xác minh email
 */
export const registerUser = async (data: RegisterRequest): Promise<OTPResponse> => {
  try {
    const response = await apiClient.post('/auth/register', {
      email: data.email,
      phone: data.phone,
      fullName: data.fullName,
      password: data.password,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Đăng ký thất bại');
  }
};

/**
 * Xác minh OTP khi đăng ký
 */
export const verifyRegistrationOTP = async (
  data: VerifyOTPRequest
): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post('/auth/verify-otp-register', {
      otpId: data.otpId,
      otp: data.otp,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Xác minh OTP thất bại');
  }
};

/**
 * Đăng nhập
 */
export const loginUser = async (data: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post('/auth/login', {
      email: data.email,
      password: data.password,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Đăng nhập thất bại');
  }
};

/**
 * Yêu cầu khôi phục mật khẩu
 * Server sẽ gửi OTP qua email
 */
export const requestForgotPassword = async (
  data: ForgotPasswordRequest
): Promise<OTPResponse> => {
  try {
    const response = await apiClient.post('/auth/forgot-password', {
      email: data.email,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Yêu cầu khôi phục thất bại');
  }
};

/**
 * Xác minh OTP khi khôi phục mật khẩu
 */
export const verifyResetPasswordOTP = async (
  data: VerifyOTPRequest
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post('/auth/verify-otp-reset', {
      otpId: data.otpId,
      otp: data.otp,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Xác minh OTP thất bại');
  }
};

/**
 * Đặt lại mật khẩu
 */
export const resetPassword = async (
  data: ResetPasswordRequest
): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post('/auth/reset-password', {
      otpId: data.otpId,
      otp: data.otp,
      newPassword: data.newPassword,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Đặt lại mật khẩu thất bại');
  }
};

/**
 * Làm mới token
 */
export const refreshToken = async (refreshToken: string): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post('/auth/refresh-token', {
      refreshToken,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Làm mới token thất bại');
  }
};

/**
 * Đăng xuất
 */
export const logoutUser = async (): Promise<{ success: boolean }> => {
  try {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  } catch (error: any) {
    // Đăng xuất luôn thành công trên client side, ngay cả khi server gặp lỗi
    return { success: true };
  }
};

/**
 * Lấy thông tin người dùng hiện tại
 */
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Lấy thông tin người dùng thất bại');
  }
};
