/**
 * Category Repository
 * All category-related database operations
 */

import { realmManager } from '../realmManager';

export class CategoryRepository {
  /**
   * Get all categories
   * @returns {Array} Array of category objects
   */
  static getAllCategories() {
    try {
      const realm = realmManager.getRealm();
      const categories = realm.objects('Category').sorted('id');
      return categories.map((c) => this._toObject(c));
    } catch (error) {
      console.error('❌ Error getting all categories:', error);
      return [];
    }
  }

  /**
   * Get category by ID
   * @param {number} categoryId - Category ID
   * @returns {Object|null} Category object or null
   */
  static getCategoryById(categoryId) {
    try {
      const realm = realmManager.getRealm();
      const category = realm.objects('Category').filtered('id = $0', categoryId)[0];
      return category ? this._toObject(category) : null;
    } catch (error) {
      console.error('❌ Error getting category by ID:', error);
      return null;
    }
  }

  /**
   * Get category by name
   * @param {string} name - Category name
   * @returns {Object|null} Category object or null
   */
  static getCategoryByName(name) {
    try {
      const realm = realmManager.getRealm();
      const category = realm.objects('Category').filtered('name = $0', name)[0];
      return category ? this._toObject(category) : null;
    } catch (error) {
      console.error('❌ Error getting category by name:', error);
      return null;
    }
  }

  /**
   * Convert Realm object to plain JavaScript object
   * @private
   */
  static _toObject(category) {
    return {
      id: category.id,
      name: category.name,
      icon: category.icon,
      description: category.description,
      createdAt: category.createdAt,
    };
  }
}

export default CategoryRepository;
