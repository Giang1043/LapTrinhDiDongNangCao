/**
 * Product Service
 * High-level API for product operations
 */

import ProductRepository from '../database/repositories/ProductRepository';
import CategoryRepository from '../database/repositories/CategoryRepository';

export const getProductDetails = async (productId) => {
  try {
    const product = ProductRepository.getProductById(productId);
    if (!product) {
      return null;
    }

    // Enrich product with category information
    if (product.categoryId) {
      const category = CategoryRepository.getCategoryById(product.categoryId);
      product.category = category;
    }

    console.log(`✓ Product details loaded: ${product.name}`);
    return product;
  } catch (error) {
    console.error('❌ Error getting product details:', error);
    throw error;
  }
};

export const getFeaturedProducts = async (limit = 4) => {
  try {
    const allProducts = ProductRepository.getAllProducts();
    // Sort by rating descending and take top N
    return allProducts
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit);
  } catch (error) {
    console.error('❌ Error getting featured products:', error);
    return [];
  }
};

export const searchProducts = async (query, filters = {}) => {
  try {
    return ProductRepository.searchAndFilter({
      query,
      ...filters,
    });
  } catch (error) {
    console.error('❌ Error searching products:', error);
    return [];
  }
};

export const getProductsByCategory = async (categoryId) => {
  try {
    return ProductRepository.getProductsByCategory(categoryId);
  } catch (error) {
    console.error('❌ Error getting products by category:', error);
    return [];
  }
};

export const getProductPriceInfo = (product) => {
  if (!product) return null;

  const originalPrice = product.price;
  const discountAmount = product.discount
    ? (product.price * product.discount) / 100
    : 0;
  const finalPrice = originalPrice - discountAmount;

  return {
    originalPrice,
    discount: product.discount || 0,
    discountAmount: Math.round(discountAmount),
    finalPrice: Math.round(finalPrice),
    savingsPercentage: product.discount || 0,
    formattedOriginal: originalPrice.toLocaleString('vi-VN'),
    formattedFinal: Math.round(finalPrice).toLocaleString('vi-VN'),
  };
};

export const isProductAvailable = (product) => {
  return product && product.stock > 0;
};

export const getProductRatingLabel = (rating) => {
  if (rating >= 4.5) return 'Xuất sắc';
  if (rating >= 4) return 'Rất tốt';
  if (rating >= 3) return 'Tốt';
  if (rating >= 2) return 'Bình thường';
  return 'Cần cải thiện';
};

export default {
  getProductDetails,
  getFeaturedProducts,
  searchProducts,
  getProductsByCategory,
  getProductPriceInfo,
  isProductAvailable,
  getProductRatingLabel,
};
