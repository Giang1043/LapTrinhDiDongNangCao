import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import { validateEmail, validatePassword } from '@/utils/validators';
import { loginRateLimiter, registerRateLimiter, forgotPasswordRateLimiter } from '@/utils/rateLimiter';
import * as realmService from '@/services/realmService';

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  phoneNumber?: string;
  avatar?: string;
  createdAt: string;
  role: 'user' | 'admin' | 'moderator';
  isEmailVerified: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface DecodedToken {
  sub: string;
  email: string;
  username: string;
  role: string;
  iat: number;
  exp: number;
  iss: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  tokens: AuthTokens | null;
  error: string | null;
  
  // Methods
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Omit<User, 'id' | 'createdAt' | 'role' | 'isEmailVerified'> & { password: string }) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
  
  // Permission checks
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  canAccess: (requiredRoles: string[]) => boolean;
}

// Tạo Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Component
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

  // Khôi phục session khi app khởi động
  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const storedUser = await SecureStore.getItemAsync('user');
      const storedTokens = await SecureStore.getItemAsync('tokens');

      if (storedUser && storedTokens) {
        const parsedUser = JSON.parse(storedUser);
        const parsedTokens = JSON.parse(storedTokens);

        // Kiểm tra xem token đã hết hạn chưa
        if (isTokenExpired(parsedTokens.accessToken)) {
          // Thử refresh token
          try {
            await refreshAccessTokenAsync(parsedTokens.refreshToken);
          } catch (error) {
            // Token không thể refresh, logout user
            await logoutAsync();
          }
        } else {
          setUser(parsedUser);
          setTokens(parsedTokens);
        }
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  const loginAsync = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. INPUT VALIDATION
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.errors[0]);
      }

      // 2. RATE LIMITING
      const rateLimitCheck = loginRateLimiter.check(email);
      if (!rateLimitCheck.allowed) {
        throw new Error(`Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau ${Math.ceil((rateLimitCheck.resetTime - Date.now()) / 1000 / 60)} phút.`);
      }

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailValidation.sanitizedData, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Đăng nhập thất bại');
      }

      const data = await response.json();
      const { user: userData, tokens: authTokens } = data;

      // Lưu vào secure storage
      await SecureStore.setItemAsync('user', JSON.stringify(userData));
      await SecureStore.setItemAsync('tokens', JSON.stringify(authTokens));

      // Save user to Realm
      try {
        await realmService.saveUserProfile({
          id: userData.id,
          email: userData.email,
          username: userData.username,
          fullName: userData.fullName,
          phoneNumber: userData.phoneNumber,
          avatar: userData.avatar,
          role: userData.role as any,
          isEmailVerified: userData.isEmailVerified,
          profileCompleteness: userData.phoneNumber ? 50 : 25,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } catch (realmError) {
        console.warn('Failed to save user to Realm, but login succeeded:', realmError);
      }

      setUser(userData);
      setTokens(authTokens);
      loginRateLimiter.reset(email); // Reset rate limit sau khi đăng nhập thành công
    } catch (err: any) {
      const errorMessage = err.message || 'Đăng nhập thất bại';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerAsync = useCallback(
    async (userData: Omit<User, 'id' | 'createdAt' | 'role' | 'isEmailVerified'> & { password: string }) => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. INPUT VALIDATION
        const emailValidation = validateEmail(userData.email);
        if (!emailValidation.isValid) {
          throw new Error(emailValidation.errors[0]);
        }

        const passwordValidation = validatePassword(userData.password);
        if (!passwordValidation.isValid) {
          throw new Error(passwordValidation.errors.join(', '));
        }

        // 2. RATE LIMITING
        const rateLimitCheck = registerRateLimiter.check(userData.email);
        if (!rateLimitCheck.allowed) {
          throw new Error('Quá nhiều yêu cầu đăng ký. Vui lòng thử lại sau.');
        }

        const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...userData,
            email: emailValidation.sanitizedData,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Đăng ký thất bại');
        }

        const data = await response.json();
        const { user: newUser, tokens: authTokens } = data;

        await SecureStore.setItemAsync('user', JSON.stringify(newUser));
        await SecureStore.setItemAsync('tokens', JSON.stringify(authTokens));

        setUser(newUser);
        setTokens(authTokens);
        registerRateLimiter.reset(userData.email);
      } catch (err: any) {
        const errorMessage = err.message || 'Đăng ký thất bại';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logoutAsync = useCallback(async () => {
    try {
      setIsLoading(true);
      if (tokens?.accessToken) {
        try {
          await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${tokens.accessToken}`,
            },
          });
        } catch (error) {
          // Bỏ qua lỗi logout API, vẫn xóa local data
        }
      }

      await SecureStore.deleteItemAsync('user');
      await SecureStore.deleteItemAsync('tokens');

      // Delete user from Realm
      if (user?.id) {
        try {
          await realmService.deleteUserProfile(user.id);
        } catch (realmError) {
          console.warn('Failed to delete user from Realm:', realmError);
        }
      }

      setUser(null);
      setTokens(null);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  }, [tokens]);

  const refreshAccessTokenAsync = useCallback(async (refreshToken: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Refresh token failed');
      }

      const data = await response.json();
      const newTokens = { ...tokens, ...data.tokens };

      await SecureStore.setItemAsync('tokens', JSON.stringify(newTokens));
      setTokens(newTokens);
    } catch (error) {
      // Nếu refresh thất bại, logout user
      await logoutAsync();
      throw error;
    }
  }, [tokens, logoutAsync]);

  const forgotPasswordAsync = useCallback(async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. INPUT VALIDATION
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.errors[0]);
      }

      // 2. RATE LIMITING
      const rateLimitCheck = forgotPasswordRateLimiter.check(email);
      if (!rateLimitCheck.allowed) {
        throw new Error('Quá nhiều yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau.');
      }

      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailValidation.sanitizedData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể gửi email đặt lại mật khẩu');
      }

      forgotPasswordRateLimiter.reset(email);
    } catch (err: any) {
      const errorMessage = err.message || 'Yêu cầu quên mật khẩu thất bại';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPasswordAsync = useCallback(async (token: string, newPassword: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // INPUT VALIDATION
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(', '));
      }

      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Đặt lại mật khẩu thất bại');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Đặt lại mật khẩu thất bại';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfileAsync = useCallback(
    async (userData: Partial<User>) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${API_URL}/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokens?.accessToken}`,
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Cập nhật hồ sơ thất bại');
        }

        const data = await response.json();
        const updatedUser = { ...user, ...data.user };

        await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } catch (err: any) {
        const errorMessage = err.message || 'Cập nhật hồ sơ thất bại';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [user, tokens]
  );

  // Authorization methods
  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;

    const rolePermissions: Record<string, string[]> = {
      admin: ['*'], // Admin có tất cả quyền
      moderator: ['view_users', 'manage_content', 'view_reports'],
      user: ['view_profile', 'edit_profile', 'view_public_content'],
    };

    const permissions = rolePermissions[user.role] || [];
    return permissions.includes('*') || permissions.includes(permission);
  }, [user]);

  const hasRole = useCallback((role: string): boolean => {
    return user?.role === role;
  }, [user]);

  const canAccess = useCallback((requiredRoles: string[]): boolean => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  }, [user]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isSignedIn: user !== null,
    tokens,
    error,
    login: loginAsync,
    register: registerAsync,
    logout: logoutAsync,
    forgotPassword: forgotPasswordAsync,
    resetPassword: resetPasswordAsync,
    refreshAccessToken: () => refreshAccessTokenAsync(tokens?.refreshToken || ''),
    updateProfile: updateProfileAsync,
    hasPermission,
    hasRole,
    canAccess,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook để sử dụng Auth Context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
