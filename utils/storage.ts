import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
  REGISTRATION_OTP_ID: 'registrationOtpId',
  RESET_PASSWORD_OTP_ID: 'resetPasswordOtpId',
};

/**
 * Lưu auth token
 */
export const saveAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  } catch (error) {
    console.error('Error saving auth token:', error);
    throw error;
  }
};

/**
 * Lấy auth token
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Xóa auth token
 */
export const removeAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Error removing auth token:', error);
    throw error;
  }
};

/**
 * Lưu refresh token
 */
export const saveRefreshToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  } catch (error) {
    console.error('Error saving refresh token:', error);
    throw error;
  }
};

/**
 * Lấy refresh token
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

/**
 * Xóa refresh token
 */
export const removeRefreshToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error('Error removing refresh token:', error);
    throw error;
  }
};

/**
 * Lưu dữ liệu người dùng
 */
export const saveUserData = async (userData: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
};

/**
 * Lấy dữ liệu người dùng
 */
export const getUserData = async (): Promise<any | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Xóa tất cả dữ liệu xác thực
 */
export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.REGISTRATION_OTP_ID,
      STORAGE_KEYS.RESET_PASSWORD_OTP_ID,
    ]);
  } catch (error) {
    console.error('Error clearing auth data:', error);
    throw error;
  }
};

/**
 * Lưu OTP ID cho đăng ký
 */
export const saveRegistrationOtpId = async (otpId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.REGISTRATION_OTP_ID, otpId);
  } catch (error) {
    console.error('Error saving registration OTP ID:', error);
    throw error;
  }
};

/**
 * Lấy OTP ID cho đăng ký
 */
export const getRegistrationOtpId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.REGISTRATION_OTP_ID);
  } catch (error) {
    console.error('Error getting registration OTP ID:', error);
    return null;
  }
};

/**
 * Lưu OTP ID cho khôi phục mật khẩu
 */
export const saveResetPasswordOtpId = async (otpId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.RESET_PASSWORD_OTP_ID, otpId);
  } catch (error) {
    console.error('Error saving reset password OTP ID:', error);
    throw error;
  }
};

/**
 * Lấy OTP ID cho khôi phục mật khẩu
 */
export const getResetPasswordOtpId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.RESET_PASSWORD_OTP_ID);
  } catch (error) {
    console.error('Error getting reset password OTP ID:', error);
    return null;
  }
};

/**
 * Xóa OTP ID cho đăng ký
 */
export const removeRegistrationOtpId = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.REGISTRATION_OTP_ID);
  } catch (error) {
    console.error('Error removing registration OTP ID:', error);
    throw error;
  }
};

/**
 * Xóa OTP ID cho khôi phục mật khẩu
 */
export const removeResetPasswordOtpId = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.RESET_PASSWORD_OTP_ID);
  } catch (error) {
    console.error('Error removing reset password OTP ID:', error);
    throw error;
  }
};
