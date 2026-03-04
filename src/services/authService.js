// ============================================
// Mock Data & Configuration
// ============================================

const mockUsers = [
  {
    id: 1,
    email: 'tigiang2004@gmail.com',
    passwordHash: hashPassword('123456'),
    name: 'Cao Cự Giang',
    phone: '0375104778',
    isVerified: true,
  },
];

// Lưu OTP tạm thời
const otpStore = {};

// Lưu attempt fails (rate limiting)
const attemptStore = {};

// Lưu JWT tokens
const tokenStore = {};

// ============================================
// Helper Functions
// ============================================

// Giả lập hashing password (thực tế dùng bcrypt)
function hashPassword(password) {
  // Đơn giản: thêm salt prefix
  const salt = 'foodapp_salt_2026';
  return `hashed_${salt}_${password}`;
}

// Verify password
function verifyPassword(password, hash) {
  return hash === hashPassword(password);
}

// Generate OTP 6 digits
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate JWT Token (đơn giản)
function generateJWT(userId) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      userId,
      iat: new Date().getTime(),
      exp: new Date().getTime() + 24 * 60 * 60 * 1000, // 24h expiry
    })
  );
  // Trong thực tế dùng crypto signature, ở đây dùng đơn giản
  const signature = btoa('secret_key_foodapp');
  return `${header}.${payload}.${signature}`;
}

// Verify JWT Token
function verifyJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp < new Date().getTime()) return null; // expired
    
    return payload;
  } catch {
    return null;
  }
}

// Rate limiting check
function checkRateLimit(identifier) {
  const key = `attempts_${identifier}`;
  const now = Date.now();
  
  if (!attemptStore[key]) {
    attemptStore[key] = { count: 0, resetTime: now + 15 * 60 * 1000 }; // 15 min
  }

  if (now > attemptStore[key].resetTime) {
    attemptStore[key] = { count: 0, resetTime: now + 15 * 60 * 1000 };
  }

  attemptStore[key].count++;

  if (attemptStore[key].count > 5) {
    return false; // Rate limit exceeded
  }

  return true;
}

// Email validation
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// ============================================
// OTP Functions
// ============================================

// Mock send OTP to email
export const sendOTP = async (email) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!isValidEmail(email)) {
        reject({
          success: false,
          message: 'Email không hợp lệ',
          code: 'INVALID_EMAIL',
        });
        return;
      }

      // Rate limiting
      if (!checkRateLimit(`otp_${email}`)) {
        reject({
          success: false,
          message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút',
          code: 'RATE_LIMITED',
        });
        return;
      }

      const otp = generateOTP();
      const expiryTime = new Date().getTime() + 5 * 60 * 1000; // 5 min

      otpStore[email] = {
        code: otp,
        expiresAt: expiryTime,
        attempts: 0,
      };

      console.log(`🔐 OTP for ${email}: ${otp} (expires in 5 min)`);

      resolve({
        success: true,
        message: `OTP đã được gửi tới ${email}`,
        // Chỉ dùng cho development, xóa trong production
        otp: otp,
      });
    }, 1000);
  });
};

// Verify OTP (Hỗ trợ cả Đăng ký và Quên mật khẩu)
export const verifyOTP = async (email, otp, type = 'signup') => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Phân loại key lưu trữ dựa vào type
      const key = type === 'forgot_password' ? `forgot_${email}` : email;

      if (!otpStore[key]) {
        reject({
          success: false,
          message: 'OTP chưa được gửi cho email này',
          code: 'NO_OTP_SENT',
        });
        return;
      }

      const otpData = otpStore[key];

      // Check expiry
      if (new Date().getTime() > otpData.expiresAt) {
        delete otpStore[key];
        reject({
          success: false,
          message: 'OTP đã hết hạn, vui lòng yêu cầu OTP mới',
          code: 'OTP_EXPIRED',
        });
        return;
      }

      // Rate limiting for OTP verification
      otpData.attempts++;
      if (otpData.attempts > 5) {
        delete otpStore[key];
        reject({
          success: false,
          message: 'Quá nhiều lần nhập sai, vui lòng yêu cầu OTP mới',
          code: 'OTP_ATTEMPTS_EXCEEDED',
        });
        return;
      }

      // Verify code
      if (otp !== otpData.code) {
        reject({
          success: false,
          message: 'OTP không chính xác',
          code: 'INVALID_OTP',
        });
        return;
      }

      // QUAN TRỌNG: Chỉ xóa OTP khỏi store nếu là luồng Đăng ký.
      // Nếu là Quên mật khẩu, phải giữ lại OTP trong store để hàm resetPasswordWithOTP lát nữa còn dùng để kiểm tra!
      if (type === 'signup') {
        delete otpStore[key];
      }

      resolve({
        success: true,
        message: 'OTP xác thực thành công',
      });
    }, 800);
  });
};

// ============================================
// Register & Login with JWT
// ============================================

// Register with OTP verification
export const registerUser = async (email, password, name, phone) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Validation
      if (!email || !password || !name || !phone) {
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

      if (password.length < 6) {
        reject({
          success: false,
          message: 'Mật khẩu phải tối thiểu 6 ký tự',
          code: 'PASSWORD_TOO_SHORT',
        });
        return;
      }

      // Check email exists
      if (mockUsers.find(user => user.email === email)) {
        reject({
          success: false,
          message: 'Email đã được đăng ký',
          code: 'EMAIL_EXISTS',
        });
        return;
      }

      // Create user (not verified yet)
      const newUser = {
        id: mockUsers.length + 1,
        email,
        passwordHash: hashPassword(password),
        name,
        phone,
        isVerified: false,
        createdAt: new Date().getTime(),
      };

      mockUsers.push(newUser);

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
    }, 1200);
  });
};

// Activate account with OTP
export const activateAccount = async (email) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(u => u.email === email);

      if (!user) {
        reject({
          success: false,
          message: 'Người dùng không tồn tại',
          code: 'USER_NOT_FOUND',
        });
        return;
      }

      if (user.isVerified) {
        reject({
          success: false,
          message: 'Tài khoản đã được xác thực',
          code: 'ALREADY_VERIFIED',
        });
        return;
      }

      // Activate account
      user.isVerified = true;

      // Generate JWT token
      const token = generateJWT(user.id);

      resolve({
        success: true,
        message: 'Tài khoản đã được xác thực',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
        },
        token,
      });
    }, 800);
  });
};

// Login with JWT
export const loginUser = async (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Validation
      if (!email || !password) {
        if (!checkRateLimit(`login_${email}`)) {
          reject({
            success: false,
            message: 'Quá nhiều lần đăng nhập thất bại, thử lại sau 15 phút',
            code: 'RATE_LIMITED',
          });
          return;
        }

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
      const user = mockUsers.find(u => u.email === email);

      if (!user) {
        reject({
          success: false,
          message: 'Email hoặc mật khẩu không chính xác',
          code: 'INVALID_CREDENTIALS',
        });
        return;
      }

      if (!user.isVerified) {
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
    }, 1200);
  });
};

// ============================================
// Forgot Password
// ============================================

// Request forgot password OTP
export const requestForgotPasswordOTP = async (email) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Check user exists
      const user = mockUsers.find(u => u.email === email);

      if (!user) {
        // Security: không tiết lộ email tồn tại hay không
        reject({
          success: false,
          message: 'Nếu email tồn tại trong hệ thống, OTP sẽ được gửi',
          code: 'EMAIL_SENT',
        });
        return;
      }

      // Rate limiting
      if (!checkRateLimit(`forgot_${email}`)) {
        reject({
          success: false,
          message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút',
          code: 'RATE_LIMITED',
        });
        return;
      }

      // Send OTP
      const otp = generateOTP();
      const expiryTime = new Date().getTime() + 5 * 60 * 1000;

      otpStore[`forgot_${email}`] = {
        code: otp,
        expiresAt: expiryTime,
        attempts: 0,
      };

      console.log(`🔐 Forgot Password OTP for ${email}: ${otp}`);

      resolve({
        success: true,
        message: 'OTP đã được gửi tới email của bạn',
        otp: otp, // Dev only
      });
    }, 1000);
  });
};

// Verify forgot password OTP and reset password
export const resetPasswordWithOTP = async (email, otp, newPassword) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const key = `forgot_${email}`;

      if (!otpStore[key]) {
        reject({
          success: false,
          message: 'OTP chưa được yêu cầu cho email này',
          code: 'NO_OTP_SENT',
        });
        return;
      }

      const otpData = otpStore[key];

      // Check expiry
      if (new Date().getTime() > otpData.expiresAt) {
        delete otpStore[key];
        reject({
          success: false,
          message: 'OTP đã hết hạn, vui lòng yêu cầu OTP mới',
          code: 'OTP_EXPIRED',
        });
        return;
      }

      // Rate limiting
      otpData.attempts++;
      if (otpData.attempts > 5) {
        delete otpStore[key];
        reject({
          success: false,
          message: 'Quá nhiều lần nhập sai, vui lòng yêu cầu OTP mới',
          code: 'OTP_ATTEMPTS_EXCEEDED',
        });
        return;
      }

      // Verify OTP
      if (otp !== otpData.code) {
        reject({
          success: false,
          message: 'OTP không chính xác',
          code: 'INVALID_OTP',
        });
        return;
      }

      // Validate new password
      if (!newPassword || newPassword.length < 6) {
        reject({
          success: false,
          message: 'Mật khẩu phải tối thiểu 6 ký tự',
          code: 'INVALID_PASSWORD',
        });
        return;
      }

      // Find user and update password
      const user = mockUsers.find(u => u.email === email);
      if (!user) {
        reject({
          success: false,
          message: 'Người dùng không tồn tại',
          code: 'USER_NOT_FOUND',
        });
        return;
      }

      user.passwordHash = hashPassword(newPassword);
      delete otpStore[key];

      resolve({
        success: true,
        message: 'Mật khẩu đã được thay đổi thành công',
      });
    }, 1000);
  });
};

// Verify JWT token (for API calls)
export const verifyToken = async (token) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const decoded = verifyJWT(token);

      if (!decoded) {
        reject({
          success: false,
          message: 'Token không hợp lệ hoặc đã hết hạn',
          code: 'INVALID_TOKEN',
        });
        return;
      }

      const user = mockUsers.find(u => u.id === decoded.userId);

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
    }, 200);
  });
};
