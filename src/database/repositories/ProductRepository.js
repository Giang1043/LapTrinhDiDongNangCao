/**
 * Product Repository
 * All product-related database operations
 */

import { realmManager } from '../realmManager';

export class ProductRepository {
  /**
   * Get all products
   * @returns {Array} Array of product objects
   */
  static getAllProducts() {
    try {
      const realm = realmManager.getRealm();
      const products = realm.objects('Product').sorted('id');
      return products.map((p) => this._toObject(p));
    } catch (error) {
      console.error('❌ Error getting all products:', error);
      return [];
    }
  }

  /**
   * Get product by ID
   * @param {number} productId - Product ID
   * @returns {Object|null} Product object or null
   */
  static getProductById(productId) {
    try {
      const realm = realmManager.getRealm();
      const product = realm.objects('Product').filtered('id = $0', productId)[0];
      return product ? this._toObject(product) : null;
    } catch (error) {
      console.error('❌ Error getting product by ID:', error);
      return null;
    }
  }

  /**
   * Get products by category
   * @param {number} categoryId - Category ID
   * @returns {Array} Array of product objects
   */
  static getProductsByCategory(categoryId) {
    try {
      const realm = realmManager.getRealm();
      const products = realm.objects('Product').filtered('categoryId = $0', categoryId);
      return products.map((p) => this._toObject(p));
    } catch (error) {
      console.error('❌ Error getting products by category:', error);
      return [];
    }
  }

  /**
   * Search products by name or description
   * @param {string} query - Search query
   * @returns {Array} Array of product objects
   */
  static searchProducts(query) {
    try {
      const realm = realmManager.getRealm();
      const lowerQuery = query.toLowerCase();
      const products = realm
        .objects('Product')
        .filtered('name CONTAINS[c] $0 OR description CONTAINS[c] $0', query, query);
      return products.map((p) => this._toObject(p));
    } catch (error) {
      console.error('❌ Error searching products:', error);
      return [];
    }
  }

  /**
   * Filter products by criteria
   * @param {Object} filters - Filter criteria {categoryId?, minPrice?, maxPrice?, minRating?}
   * @returns {Array} Array of product objects
   */
  static filterProducts(filters = {}) {
    try {
      const realm = realmManager.getRealm();
      let products = realm.objects('Product');

      if (filters.categoryId !== undefined && filters.categoryId !== null) {
        products = products.filtered('categoryId = $0', filters.categoryId);
      }

      if (filters.minPrice !== undefined) {
        products = products.filtered('price >= $0', filters.minPrice);
      }

      if (filters.maxPrice !== undefined) {
        products = products.filtered('price <= $0', filters.maxPrice);
      }

      if (filters.minRating !== undefined) {
        products = products.filtered('rating >= $0', filters.minRating);
      }

      return products.map((p) => this._toObject(p));
    } catch (error) {
      console.error('❌ Error filtering products:', error);
      return [];
    }
  }

  /**
   * Get top rated products
   * @param {number} limit - Number of products to return
   * @returns {Array} Array of product objects
   */
  static getTopRatedProducts(limit = 10) {
    try {
      const realm = realmManager.getRealm();
      const products = realm.objects('Product').sorted('rating', true).slice(0, limit);
      return products.map((p) => this._toObject(p));
    } catch (error) {
      console.error('❌ Error getting top rated products:', error);
      return [];
    }
  }

  /**
   * Get on sale products
   * @returns {Array} Array of product objects with discount > 0
   */
  static getOnSaleProducts() {
    try {
      const realm = realmManager.getRealm();
      const products = realm.objects('Product').filtered('discount > 0');
      return products.map((p) => this._toObject(p));
    } catch (error) {
      console.error('❌ Error getting on sale products:', error);
      return [];
    }
  }

  /**
   * Update product stock
   * @param {number} productId - Product ID
   * @param {number} quantity - New quantity
   * @returns {Object|null} Updated product or null
   */
  static updateStock(productId, quantity) {
    try {
      const realm = realmManager.getRealm();
      const product = realm.objects('Product').filtered('id = $0', productId)[0];

      if (!product) {
        console.warn(`Product not found: ${productId}`);
        return null;
      }

      realm.write(() => {
        product.stock = quantity;
        product.updatedAt = new Date();
      });

      return this._toObject(product);
    } catch (error) {
      console.error('❌ Error updating stock:', error);
      throw error;
    }
  }

  /**
   * Convert Realm object to plain JavaScript object
   * @private
   */
  static _toObject(product) {
    return {
      id: product.id,
      categoryId: product.categoryId,
      name: product.name,
      description: product.description,
      image: product.image,
      price: product.price,
      discount: product.discount,
      rating: product.rating,
      stock: product.stock,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}

export default ProductRepository;
