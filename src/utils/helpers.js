// Utility functions

/**
 * Format tiền tệ
 * @param {number} amount - Số tiền
 * @returns {string} Tiền đã format
 */
export const formatPrice = (amount) => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`;
  }
  return amount.toString();
};

/**
 * Format số lượng bán
 * @param {number} count - Số lượng
 * @returns {string} Số lượng đã format
 */
export const formatSold = (count) => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

/**
 * Tính giá sau giảm
 * @param {number} originalPrice - Giá gốc
 * @param {number} discount - % giảm
 * @returns {number} Giá sau giảm
 */
export const calculateDiscountedPrice = (originalPrice, discount) => {
  return originalPrice - (originalPrice * discount) / 100;
};

/**
 * Sắp xếp sản phẩm theo giảm giá (từ cao đến thấp)
 * @param {array} products - Mảng sản phẩm
 * @returns {array} Sản phẩm đã sắp xếp
 */
export const sortByDiscount = (products) => {
  return [...products].sort((a, b) => b.discount - a.discount);
};

/**
 * Sắp xếp sản phẩm theo số bán (từ cao đến thấp)
 * @param {array} products - Mảng sản phẩm
 * @returns {array} Sản phẩm đã sắp xếp
 */
export const sortBySold = (products) => {
  return [...products].sort((a, b) => b.sold - a.sold);
};
