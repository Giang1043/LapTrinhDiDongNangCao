import { categoriesData, bestSellingProducts, discountedProducts } from '../data/mockData';

// Simulated API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const apiService = {
  // Get all categories
  getCategories: async () => {
    await delay(300);
    return {
      success: true,
      data: categoriesData,
    };
  },

  // Get best-selling products (Top 10)
  getBestSellingProducts: async () => {
    await delay(500);
    return {
      success: true,
      data: bestSellingProducts,
    };
  },

  // Get discounted products (20 products, sorted by discount)
  getDiscountedProducts: async () => {
    await delay(500);
    return {
      success: true,
      data: discountedProducts,
    };
  },

  // Get product details
  getProductDetails: async (productId) => {
    await delay(200);
    const allProducts = [...bestSellingProducts, ...discountedProducts];
    const product = allProducts.find((p) => p.id === productId);
    return {
      success: !!product,
      data: product,
    };
  },
};
