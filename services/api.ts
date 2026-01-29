import axios, { AxiosInstance } from 'axios';
import * as storage from '@/utils/storage';

// ⚠️ QUAN TRỌNG: Cập nhật URL này với địa chỉ server của bạn
// Ví dụ: 
//   Development: http://localhost:3000/api
//   Production: https://your-api-server.com/api
const API_BASE_URL = 'http://localhost:3000/api';

// Tạo instance axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào request
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await storage.getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor để xử lý lỗi response
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn, cần login lại
      try {
        await storage.removeAuthToken();
        await storage.removeRefreshToken();
      } catch (e) {
        console.error('Error clearing tokens:', e);
      }
    }
    return Promise.reject(error);
  }
);

// ===== PRODUCT ENDPOINTS =====

export const getProductList = async (page: number = 1, limit: number = 20) => {
  try {
    const response = await apiClient.get('/products', {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProductById = async (productId: string) => {
  try {
    const response = await apiClient.get(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

export const getCategoryList = async () => {
  try {
    const response = await apiClient.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const getProductsByCategory = async (categoryId: string, page: number = 1, limit: number = 20) => {
  try {
    const response = await apiClient.get(`/categories/${categoryId}/products`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};

// ===== USER ENDPOINTS =====

export const getUserOrders = async (userId: string) => {
  try {
    const response = await apiClient.get(`/users/${userId}/orders`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, data: any) => {
  try {
    const response = await apiClient.put(`/users/${userId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// ===== SEARCH ENDPOINTS =====

export const searchProducts = async (query: string) => {
  try {
    const response = await apiClient.get('/products/search', {
      params: { q: query },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

export default apiClient;
