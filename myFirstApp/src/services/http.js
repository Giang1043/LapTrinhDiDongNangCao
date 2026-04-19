import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config/api';

// Create axios instance
const httpClient = axios.create({
  baseURL: config.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token to headers
httpClient.interceptors.request.use(
  async (request) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        request.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.log('Error getting token:', e);
    }
    return request;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
httpClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || error.response.statusText;
      throw new Error(message);
    } else if (error.request) {
      // Request made but no response
      throw new Error('Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng.');
    } else {
      throw error;
    }
  }
);

export default httpClient;
