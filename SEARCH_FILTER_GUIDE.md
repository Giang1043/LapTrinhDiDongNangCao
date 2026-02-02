# Chức năng Tìm kiếm và Lọc Sản phẩm

## 📋 Mô tả
Thêm chức năng tìm kiếm và lọc nâng cao trên trang chủ, cho phép người dùng:
- 🔍 Tìm kiếm sản phẩm theo tên
- 📊 Lọc theo danh mục
- 💰 Lọc theo khoảng giá
- ⭐ Lọc theo đánh giá tối thiểu
- 🔤 Sắp xếp kết quả (giá, đánh giá, mới nhất, liên quan)

## 🎯 Các thành phần được thêm

### 1. Components
- **SearchFilter.tsx** - Component UI cho tìm kiếm và bộ lọc nâng cao
  - Search bar có thể xóa nhanh
  - Nút bộ lọc để mở/đóng lọc nâng cao
  - Tùy chọn sắp xếp (giá, đánh giá, mới nhất, liên quan)
  - Lọc danh mục
  - Lọc khoảng giá
  - Lọc đánh giá tối thiểu

### 2. Services/API
Cập nhật `services/api.ts` với 3 endpoint mới:
- `searchProductsAdvanced()` - Tìm kiếm nâng cao với bộ lọc
- `filterProducts()` - Lọc sản phẩm
- Các tùy chọn: query, giá, danh mục, đánh giá, sắp xếp

### 3. Pages
- **app/(tabs)/home.tsx** - Tích hợp SearchFilter component
  - State mới: `filteredProducts`, `searchActive`, `currentFilters`
  - Hàm `handleSearch()` - Xử lý tìm kiếm
  - Hàm `handleResetFilters()` - Xóa bộ lọc
  - Hàm `sortProducts()` - Sắp xếp sản phẩm
  - Hàm `getFilteredProducts()` cập nhật với logic lọc đầy đủ

### 4. Types
- **types/search.ts** - Các kiểu dữ liệu:
  - `SearchFilterState` - Trạng thái bộ lọc
  - `FilterOptions` - Tùy chọn lọc
  - `SearchResult` - Kết quả tìm kiếm

## 💻 Cách sử dụng

### Trên trang chủ (Home)
1. **Tìm kiếm nhanh**: Nhập tên sản phẩm và nhấn "Tìm kiếm"
2. **Bộ lọc nâng cao**: Nhấn nút "Bộ lọc" để mở các tùy chọn:
   - Chọn danh mục
   - Đặt khoảng giá
   - Chọn đánh giá tối thiểu
   - Chọn cách sắp xếp
   - Nhấn "Áp dụng bộ lọc"
3. **Xóa lọc**: Nhấn "Xóa" để đặt lại tất cả bộ lọc

## 🔌 API Integration

### Endpoint tìm kiếm nâng cao:
```typescript
GET /products/search/advanced
params: {
  q: string,              // Từ khóa tìm kiếm
  page: number,          // Trang (mặc định: 1)
  limit: number,         // Giới hạn (mặc định: 20)
  priceMin: number,      // Giá tối thiểu
  priceMax: number,      // Giá tối đa
  rating?: number,       // Đánh giá tối thiểu
  category?: string,     // ID danh mục
  sortBy?: string        // Cách sắp xếp
}
```

### Endpoint lọc sản phẩm:
```typescript
GET /products/filter
params: {
  page: number,
  limit: number,
  categoryId?: string,
  priceMin?: number,
  priceMax?: number,
  rating?: number,
  sortBy?: string
}
```

## 🎨 Tùy chỉnh

### Sắp xếp:
```
- relevance: Liên quan (mặc định)
- price-low: Giá từ thấp đến cao
- price-high: Giá từ cao đến thấp
- rating: Đánh giá cao nhất
- newest: Mới nhất
```

### Giá mặc định:
- Tối thiểu: 0₫
- Tối đa: 1,000,000₫

Có thể thay đổi trong SearchFilter component

## 📱 UI Components sử dụng
- React Native Paper: Button, Card, Chip, Icon, ActivityIndicator
- React Native: View, ScrollView, TextInput, TouchableOpacity

## ✨ Tính năng bổ sung

- ✅ Nút xóa nhanh trong search bar
- ✅ Hiển thị số lượng sản phẩm thay đổi khi lọc
- ✅ Lưu lại trạng thái bộ lọc hiện tại
- ✅ Refresh lại dữ liệu khi kéo xuống
- ✅ Loading state khi đang tìm kiếm

## 🔄 Flow tìm kiếm

```
User Input → handleSearch() → API call → 
setFilteredProducts() → getFilteredProducts() → 
UI Update (render filtered products)
```

## 📝 Lưu ý

1. Đảm bảo API server hỗ trợ các endpoint:
   - `/products/search`
   - `/products/search/advanced`
   - `/products/filter`

2. Format dữ liệu sản phẩm cần có:
   ```typescript
   {
     id: string,
     name: string,
     description: string,
     price: number,
     image: string,
     rating: number,
     category: string
   }
   ```

3. Có thể tích hợp thêm pagination nếu cần

## 🚀 Phát triển tiếp theo
- [ ] Thêm saved searches
- [ ] Lịch sử tìm kiếm
- [ ] Search suggestions
- [ ] Filters trending
- [ ] Advanced filters UI trong modal
