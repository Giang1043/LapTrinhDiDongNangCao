// Định nghĩa các kiểu dữ liệu cho hệ thống xác thực
export interface User {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user?: User;
    token?: string;
    refreshToken?: string;
    expiresIn?: number;
  };
  error?: string;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  otpId: string;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  phone: string;
  fullName: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyOTPRequest {
  otpId: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  otpId: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  register: (data: RegisterRequest) => Promise<void>;
  verifyOTP: (data: VerifyOTPRequest) => Promise<void>;
  login: (data: LoginRequest) => Promise<void>;
  forgotPassword: (data: ForgotPasswordRequest) => Promise<string>;
  resetPassword: (data: ResetPasswordRequest) => Promise<void>;
  logout: () => Promise<void>;
}
