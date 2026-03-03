// Mock data - Chứa tài khoản mẫu
const mockUsers = [
  {
    id: 1,
    email: 'tigiang2004@gmail.com',
    password: '123456',
    name: 'Cao Cự Giang',
    phone: '0375104778',
  },
];

// Mock API - Register
export const registerUser = async (email, password, name, phone) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Kiểm tra email đã tồn tại
      if (mockUsers.find(user => user.email === email)) {
        reject({
          success: false,
          message: 'Email đã được đăng ký',
          code: 'EMAIL_EXISTS',
        });
        return;
      }

      // Validation cơ bản
      if (!email || !password || !name || !phone) {
        reject({
          success: false,
          message: 'Vui lòng điền đầy đủ thông tin',
          code: 'MISSING_FIELDS',
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

      // Tạo user mới
      const newUser = {
        id: mockUsers.length + 1,
        email,
        password,
        name,
        phone,
      };

      mockUsers.push(newUser);

      resolve({
        success: true,
        message: 'Đăng ký thành công',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          phone: newUser.phone,
        },
      });
    }, 1500); // Giả lập delay 1.5s
  });
};

// Mock API - Login
export const loginUser = async (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Validation
      if (!email || !password) {
        reject({
          success: false,
          message: 'Vui lòng nhập email và mật khẩu',
          code: 'MISSING_FIELDS',
        });
        return;
      }

      // Tìm user
      const user = mockUsers.find(u => u.email === email);

      if (!user) {
        reject({
          success: false,
          message: 'Email không tồn tại',
          code: 'USER_NOT_FOUND',
        });
        return;
      }

      if (user.password !== password) {
        reject({
          success: false,
          message: 'Mật khẩu không chính xác',
          code: 'INVALID_PASSWORD',
        });
        return;
      }

      resolve({
        success: true,
        message: 'Đăng nhập thành công',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
        },
      });
    }, 1500); // Giả lập delay 1.5s
  });
};
