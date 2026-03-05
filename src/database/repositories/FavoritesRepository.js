/**
 * Favorites Repository
 * All favorites-related database operations
 */

import { realmManager } from '../realmManager';

export class FavoritesRepository {
  /**
   * Add product to favorites
   * @param {number} userId - User ID
   * @param {number} productId - Product ID
   * @returns {Object} Created favorite object
   */
  static addToFavorites(userId, productId) {
    try {
      const realm = realmManager.getRealm();

      // Check if already favorited
      const existing = realm
        .objects('Favorite')
        .filtered('userId = $0 AND productId = $1', userId, productId)[0];

      if (existing) {
        console.log(`Product already in favorites: ${productId}`);
        return this._toObject(existing);
      }

      let favorite;
      realm.write(() => {
        const maxFavorite = realm.objects('Favorite').sorted('id', true)[0];
        const newId = maxFavorite ? maxFavorite.id + 1 : 1;

        favorite = realm.create('Favorite', {
          id: newId,
          userId,
          productId,
          createdAt: new Date(),
        });
      });

      console.log(`✓ Added to favorites: product ${productId}`);
      return this._toObject(favorite);
    } catch (error) {
      console.error('❌ Error adding to favorites:', error);
      throw error;
    }
  }

  /**
   * Remove product from favorites
   * @param {number} userId - User ID
   * @param {number} productId - Product ID
   * @returns {boolean} Success status
   */
  static removeFromFavorites(userId, productId) {
    try {
      const realm = realmManager.getRealm();
      const favorite = realm
        .objects('Favorite')
        .filtered('userId = $0 AND productId = $1', userId, productId)[0];

      if (!favorite) {
        console.warn(`Favorite not found: user=${userId}, product=${productId}`);
        return false;
      }

      realm.write(() => {
        realm.delete(favorite);
      });

      console.log(`✓ Removed from favorites: product ${productId}`);
      return true;
    } catch (error) {
      console.error('❌ Error removing from favorites:', error);
      throw error;
    }
  }

  /**
   * Get all favorites for user
   * @param {number} userId - User ID
   * @returns {Array} Array of favorite objects
   */
  static getFavorites(userId) {
    try {
      const realm = realmManager.getRealm();
      const favorites = realm.objects('Favorite').filtered('userId = $0', userId);
      return favorites.map((f) => this._toObject(f));
    } catch (error) {
      console.error('❌ Error getting favorites:', error);
      return [];
    }
  }

  /**
   * Get favorite product IDs for user
   * @param {number} userId - User ID
   * @returns {Array} Array of product IDs
   */
  static getFavoriteProductIds(userId) {
    try {
      const realm = realmManager.getRealm();
      const favorites = realm.objects('Favorite').filtered('userId = $0', userId);
      return favorites.map((f) => f.productId);
    } catch (error) {
      console.error('❌ Error getting favorite product IDs:', error);
      return [];
    }
  }

  /**
   * Check if product is favorited by user
   * @param {number} userId - User ID
   * @param {number} productId - Product ID
   * @returns {boolean} True if favorited
   */
  static isFavorited(userId, productId) {
    try {
      const realm = realmManager.getRealm();
      const favorite = realm
        .objects('Favorite')
        .filtered('userId = $0 AND productId = $1', userId, productId)[0];
      return !!favorite;
    } catch (error) {
      console.error('❌ Error checking if favorited:', error);
      return false;
    }
  }

  /**
   * Get count of favorites for user
   * @param {number} userId - User ID
   * @returns {number} Number of favorites
   */
  static getFavoritesCount(userId) {
    try {
      const realm = realmManager.getRealm();
      const favorites = realm.objects('Favorite').filtered('userId = $0', userId);
      return favorites.length;
    } catch (error) {
      console.error('❌ Error getting favorites count:', error);
      return 0;
    }
  }

  /**
   * Clear all favorites for user
   * @param {number} userId - User ID
   * @returns {boolean} Success status
   */
  static clearFavorites(userId) {
    try {
      const realm = realmManager.getRealm();
      const favorites = realm.objects('Favorite').filtered('userId = $0', userId);

      if (favorites.length === 0) {
        console.log(`No favorites to clear for user: ${userId}`);
        return true;
      }

      realm.write(() => {
        realm.delete(favorites);
      });

      console.log(`✓ Cleared all favorites for user: ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Error clearing favorites:', error);
      throw error;
    }
  }

  /**
   * Convert Realm object to plain JavaScript object
   * @private
   */
  static _toObject(favorite) {
    return {
      id: favorite.id,
      userId: favorite.userId,
      productId: favorite.productId,
      createdAt: favorite.createdAt,
    };
  }
}

export default FavoritesRepository;
