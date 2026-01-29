/**
 * Input Validation & Sanitization
 * Xác thực và làm sạch dữ liệu đầu vào
 */

import validator from 'validator';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: any;
}

/**
 * Xác thực và làm sạch email
 */
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];

  if (!email || email.trim() === '') {
    errors.push('Email không được để trống');
    return { isValid: false, errors };
  }

  const trimmedEmail = email.trim().toLowerCase();

  if (!validator.isEmail(trimmedEmail)) {
    errors.push('Email không hợp lệ');
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    sanitizedData: trimmedEmail,
  };
};

/**
 * Xác thực mật khẩu
 * Yêu cầu: ít nhất 8 ký tự, 1 chữ cái hoa, 1 chữ cái thường, 1 số
 */
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];

  if (!password || password.length === 0) {
    errors.push('Mật khẩu không được để trống');
    return { isValid: false, errors };
  }

  if (password.length < 8) {
    errors.push('Mật khẩu phải có ít nhất 8 ký tự');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Mật khẩu phải chứa ít nhất 1 chữ cái hoa');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Mật khẩu phải chứa ít nhất 1 chữ cái thường');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Mật khẩu phải chứa ít nhất 1 số');
  }

  // Kiểm tra XSS risk
  if (validator.matches(password, /<script|javascript:|on\w+=/i)) {
    errors.push('Mật khẩu chứa ký tự không hợp lệ');
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return { isValid: true, errors: [] };
};

/**
 * Xác thực tên người dùng
 */
export const validateUsername = (username: string): ValidationResult => {
  const errors: string[] = [];

  if (!username || username.trim() === '') {
    errors.push('Tên người dùng không được để trống');
    return { isValid: false, errors };
  }

  const trimmedUsername = username.trim();

  if (trimmedUsername.length < 3) {
    errors.push('Tên người dùng phải có ít nhất 3 ký tự');
  }

  if (trimmedUsername.length > 20) {
    errors.push('Tên người dùng không được vượt quá 20 ký tự');
  }

  // Chỉ cho phép chữ cái, số, dấu gạch dưới
  if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
    errors.push('Tên người dùng chỉ có thể chứa chữ cái, số và dấu gạch dưới');
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    sanitizedData: trimmedUsername,
  };
};

/**
 * Xác thực họ và tên
 */
export const validateFullName = (fullName: string): ValidationResult => {
  const errors: string[] = [];

  if (!fullName || fullName.trim() === '') {
    errors.push('Họ và tên không được để trống');
    return { isValid: false, errors };
  }

  const trimmedName = validator.trim(fullName);

  if (trimmedName.length < 2) {
    errors.push('Họ và tên phải có ít nhất 2 ký tự');
  }

  if (trimmedName.length > 100) {
    errors.push('Họ và tên không được vượt quá 100 ký tự');
  }

  // Ngăn chặn XSS
  if (validator.matches(trimmedName, /<script|javascript:|on\w+=/i)) {
    errors.push('Họ và tên chứa ký tự không hợp lệ');
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    sanitizedData: validator.escape(trimmedName),
  };
};

/**
 * Xác thực số điện thoại
 */
export const validatePhoneNumber = (phoneNumber: string): ValidationResult => {
  const errors: string[] = [];

  if (!phoneNumber || phoneNumber.trim() === '') {
    errors.push('Số điện thoại không được để trống');
    return { isValid: false, errors };
  }

  const trimmedPhone = phoneNumber.trim();

  if (!validator.isMobilePhone(trimmedPhone, ['vi-VN'] as any)) {
    errors.push('Số điện thoại không hợp lệ');
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    sanitizedData: trimmedPhone,
  };
};

/**
 * Sanitize dữ liệu (xóa các ký tự nguy hiểm)
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }
  // Escape HTML entities để ngăn chặn XSS
  return validator.escape(input.trim());
};

/**
 * Xác thực reset token
 */
export const validateResetToken = (token: string): ValidationResult => {
  const errors: string[] = [];

  if (!token || token.trim() === '') {
    errors.push('Token không được để trống');
    return { isValid: false, errors };
  }

  // Kiểm tra định dạng JWT cơ bản
  const jwtRegex = /^[A-Za-z0-9_-]{2,}\.([A-Za-z0-9_-]{2,})\.([A-Za-z0-9_-]{2,})$/;
  
  if (!jwtRegex.test(token)) {
    errors.push('Token không hợp lệ');
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return { isValid: true, errors: [] };
};

/**
 * Xác thực nhiều trường dữ liệu cùng lúc
 */
export const validateMultipleFields = (
  fields: Record<string, { value: string; type: 'email' | 'password' | 'username' | 'fullname' | 'phone' }>
): ValidationResult => {
  const allErrors: Record<string, string[]> = {};

  for (const [fieldName, { value, type }] of Object.entries(fields)) {
    let result: ValidationResult;

    switch (type) {
      case 'email':
        result = validateEmail(value);
        break;
      case 'password':
        result = validatePassword(value);
        break;
      case 'username':
        result = validateUsername(value);
        break;
      case 'fullname':
        result = validateFullName(value);
        break;
      case 'phone':
        result = validatePhoneNumber(value);
        break;
      default:
        result = { isValid: false, errors: ['Loại xác thực không hợp lệ'] };
    }

    if (!result.isValid) {
      allErrors[fieldName] = result.errors;
    }
  }

  const hasErrors = Object.keys(allErrors).length > 0;

  return {
    isValid: !hasErrors,
    errors: hasErrors ? [JSON.stringify(allErrors)] : [],
  };
};
