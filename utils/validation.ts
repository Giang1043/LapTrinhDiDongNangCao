/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone format (Việt Nam)
 */
export const isValidPhone = (phone: string): boolean => {
  // Định dạng: 10 chữ số bắt đầu bằng 0, hoặc +84...
  const phoneRegex = /^(0\d{9}|0\d{10}|\+84\d{9}|\+84\d{10})$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate password strength
 * Ít nhất 8 ký tự, chứa chữ hoa, chữ thường, số
 */
export const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Validate full name
 */
export const isValidFullName = (name: string): boolean => {
  return name.trim().length >= 3;
};

/**
 * Get password strength feedback
 */
export const getPasswordStrengthFeedback = (password: string): string => {
  if (password.length === 0) {
    return 'Vui lòng nhập mật khẩu';
  }
  if (password.length < 8) {
    return 'Mật khẩu phải có ít nhất 8 ký tự';
  }
  if (!/[a-z]/.test(password)) {
    return 'Mật khẩu phải chứa chữ thường';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Mật khẩu phải chứa chữ hoa';
  }
  if (!/\d/.test(password)) {
    return 'Mật khẩu phải chứa chữ số';
  }
  return 'Mật khẩu hợp lệ';
};

/**
 * Validate OTP
 */
export const isValidOTP = (otp: string): boolean => {
  return /^\d{6}$/.test(otp);
};

/**
 * Validate registration form
 */
export const validateRegisterForm = (formData: {
  email: string;
  phone: string;
  fullName: string;
  password: string;
  confirmPassword: string;
}): { valid: boolean; errors: { [key: string]: string } } => {
  const errors: { [key: string]: string } = {};

  if (!formData.email) {
    errors.email = 'Email là bắt buộc';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Email không hợp lệ';
  }

  if (!formData.phone) {
    errors.phone = 'Số điện thoại là bắt buộc';
  } else if (!isValidPhone(formData.phone)) {
    errors.phone = 'Số điện thoại không hợp lệ';
  }

  if (!formData.fullName) {
    errors.fullName = 'Tên là bắt buộc';
  } else if (!isValidFullName(formData.fullName)) {
    errors.fullName = 'Tên phải có ít nhất 3 ký tự';
  }

  if (!formData.password) {
    errors.password = 'Mật khẩu là bắt buộc';
  } else if (!isValidPassword(formData.password)) {
    errors.password = getPasswordStrengthFeedback(formData.password);
  }

  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate login form
 */
export const validateLoginForm = (formData: {
  email: string;
  password: string;
}): { valid: boolean; errors: { [key: string]: string } } => {
  const errors: { [key: string]: string } = {};

  if (!formData.email) {
    errors.email = 'Email là bắt buộc';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Email không hợp lệ';
  }

  if (!formData.password) {
    errors.password = 'Mật khẩu là bắt buộc';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate password reset form
 */
export const validateResetPasswordForm = (formData: {
  newPassword: string;
  confirmPassword: string;
}): { valid: boolean; errors: { [key: string]: string } } => {
  const errors: { [key: string]: string } = {};

  if (!formData.newPassword) {
    errors.newPassword = 'Mật khẩu mới là bắt buộc';
  } else if (!isValidPassword(formData.newPassword)) {
    errors.newPassword = getPasswordStrengthFeedback(formData.newPassword);
  }

  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
  } else if (formData.newPassword !== formData.confirmPassword) {
    errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
