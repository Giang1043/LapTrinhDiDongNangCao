# FoodApp - Tiến độ Phát triển

## Lần 1: Khởi tạo, UI Intro & Navigation cơ bản

### Ngày: 03/03/2026

#### Các công việc đã hoàn thành:

✅ **1. Cài đặt thư viện**
- React Navigation (`@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`)
- React Navigation support packages (`react-native-screens`, `react-native-safe-area-context`, `react-native-gesture-handler`)
- UI library (`react-native-paper`)
- Local storage (`@react-native-async-storage/async-storage`)

✅ **2. Tạo cấu trúc thư mục chuẩn**
- `/src/components` - UI components tái sử dụng
- `/src/screens` - Các màn hình chính
- `/src/navigation` - Cấu hình React Navigation
- `/src/store` - Quản lý state (Redux - chuẩn bị cho lần sau)
- `/src/services` - Logic gọi API
- `/src/utils` - Helper functions

✅ **3. Tạo các file Screen**
- `IntroScreen.js` - Màn hình Intro
  - Hiển thị logo từ `src/assets/icon.png`
  - Hiển thị tên quán "FoodApp"
  - Tự động chuyển qua trang chủ sau 10 giây
  
- `HomeScreen.js` - Trang chủ
  - Giao diện cơ bản với Appbar
  - Placeholder cho danh mục, sản phẩm bán chạy, sản phẩm giảm giá
  
- `CartScreen.js` - Giỏ hàng
  - Giao diện cơ bản (sẽ phát triển ở Lần 7)
  
- `UserScreen.js` - Tài khoản của tôi
  - Hiển thị Avatar, tên, số điện thoại, email
  - Menu chức năng (Chỉnh sửa, Đổi mật khẩu, Lịch sử, Đăng xuất)

✅ **4. Tạo Navigation**
- `RootNavigator.js`
  - Quản lý Intro Screen và MainStack
  - Sử dụng AsyncStorage để kiểm tra lần đầu sử dụng
  
- `BottomTabNavigator.js`
  - Bottom Tab Navigation với 3 tab: Trang chủ, Giỏ hàng, Tài khoản
  - Icon từ Material Community Icons

✅ **5. Cập nhật App.js**
- Tích hợp NavigationContainer
- Tích hợp PaperProvider từ react-native-paper

### Màu sắc & Styling:
- Màu chính: `#FF6B35` (cam)
- Màu phụ: `#FFF` (trắng)
- Background mặc định: `#f5f5f5`, `#f9f9f9`

### Cách chạy:
```bash
# Chạy trên Android Emulator/Device
npm run android

# Chạy trên iOS Simulator/Device
npm run ios

# Chạy development server
npm start
```

### Lưu ý quan trọng:
- Intro Screen chỉ hiển thị lần đầu tiên ứng dụng được mở (kiểm tra bằng AsyncStorage)
- Lần sau mở ứng dụng sẽ chuyển trực tiếp tới MainStack
- Bottom Tab Navigation luôn hiển thị ở 3 tab: Home, Cart, User

---

## Lần 2: API & UI Xác thực (Cơ bản)
*(Chưa thực hiện)*

---

## Lần 3: API & UI Xác thực (Nâng cao & Bảo mật)
*(Chưa thực hiện)*

---

## Lần 4: Local Storage & UI Trang chủ
*(Chưa thực hiện)*

---

## Lần 5: Logic Trang chủ & Chi tiết sản phẩm
*(Chưa thực hiện)*

---

## Lần 6: Tính năng Profile & Tìm kiếm
*(Chưa thực hiện)*

---

## Lần 7: Giỏ hàng & Thanh toán
*(Chưa thực hiện)*

---

## Lần 8: Quản lý & Theo dõi đơn hàng
*(Chưa thực hiện)*
