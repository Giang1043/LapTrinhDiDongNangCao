/**
 * User Repository
 * All user-related database operations
 */

import { realmManager } from '../realmManager';

export class UserRepository {
  /**
   * Create a new user
   * @param {Object} userData - User data object
   * @returns {Object} Created user object
   */
  static createUser(userData) {
    try {
      const realm = realmManager.getRealm();
      const { email, name, phone, address, passwordHash } = userData;

      let user;
      realm.write(() => {
        // Get max ID
        const maxUser = realm.objects('User').sorted('id', true)[0];
        const newId = maxUser ? maxUser.id + 1 : 1;

        user = realm.create('User', {
          id: newId,
          email,
          name,
          phone,
          address: address || null,
          passwordHash,
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      console.log(`✓ User created: ${email}`);
      return this._toObject(user);
    } catch (error) {
      console.error('❌ Error creating user:', error);
      throw error;
    }
  }

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Object|null} User object or null
   */
  static getUserByEmail(email) {
    try {
      const realm = realmManager.getRealm();
      const user = realm.objects('User').filtered('email = $0', email)[0];
      return user ? this._toObject(user) : null;
    } catch (error) {
      console.error('❌ Error getting user by email:', error);
      return null;
    }
  }

  /**
   * Get user by ID
   * @param {number} userId - User ID
   * @returns {Object|null} User object or null
   */
  static getUserById(userId) {
    try {
      const realm = realmManager.getRealm();
      const user = realm.objects('User').filtered('id = $0', userId)[0];
      return user ? this._toObject(user) : null;
    } catch (error) {
      console.error('❌ Error getting user by ID:', error);
      return null;
    }
  }

  /**
   * Activate user account
   * @param {string} email - User email
   * @returns {Object|null} Updated user object or null
   */
  static activateUser(email) {
    try {
      const realm = realmManager.getRealm();
      const user = realm.objects('User').filtered('email = $0', email)[0];

      if (!user) {
        console.warn(`User not found: ${email}`);
        return null;
      }

      realm.write(() => {
        user.isActive = true;
        user.updatedAt = new Date();
      });

      console.log(`✓ User activated: ${email}`);
      return this._toObject(user);
    } catch (error) {
      console.error('❌ Error activating user:', error);
      throw error;
    }
  }

  /**
   * Update user
   * @param {number} userId - User ID
   * @param {Object} updates - Fields to update
   * @returns {Object|null} Updated user object or null
   */
  static updateUser(userId, updates) {
    try {
      const realm = realmManager.getRealm();
      const user = realm.objects('User').filtered('id = $0', userId)[0];

      if (!user) {
        console.warn(`User not found: ${userId}`);
        return null;
      }

      realm.write(() => {
        Object.keys(updates).forEach((key) => {
          if (key !== 'id' && key !== 'email' && key !== 'createdAt') {
            user[key] = updates[key];
          }
        });
        user.updatedAt = new Date();
      });

      console.log(`✓ User updated: ${userId}`);
      return this._toObject(user);
    } catch (error) {
      console.error('❌ Error updating user:', error);
      throw error;
    }
  }

  /**
   * Update email - Specialized function with OTP protection
   * Only callable from OTP-verified flows (like confirmEmailChange)
   * @param {number} userId - User ID
   * @param {string} newEmail - New email address
   * @returns {Object|null} Updated user object or null
   */
  static updateEmail(userId, newEmail) {
    try {
      const realm = realmManager.getRealm();
      const user = realm.objects('User').filtered('id = $0', userId)[0];

      if (!user) {
        console.warn(`User not found: ${userId}`);
        return null;
      }

      realm.write(() => {
        user.email = newEmail; // Tác động chính xác chỉ trường email
        user.updatedAt = new Date();
      });

      console.log(`✓ Security: Email updated safely for user ${userId}`);
      return this._toObject(user);
    } catch (error) {
      console.error('❌ Error updating email:', error);
      throw error;
    }
  }

  /**
   * Update phone - Specialized function with OTP protection
   * Only callable from OTP-verified flows (like confirmPhoneChange)
   * @param {number} userId - User ID
   * @param {string} newPhone - New phone number
   * @returns {Object|null} Updated user object or null
   */
  static updatePhone(userId, newPhone) {
    try {
      const realm = realmManager.getRealm();
      const user = realm.objects('User').filtered('id = $0', userId)[0];

      if (!user) {
        console.warn(`User not found: ${userId}`);
        return null;
      }

      realm.write(() => {
        user.phone = newPhone; // Tác động chính xác chỉ trường phone
        user.updatedAt = new Date();
      });

      console.log(`✓ Security: Phone updated safely for user ${userId}`);
      return this._toObject(user);
    } catch (error) {
      console.error('❌ Error updating phone:', error);
      throw error;
    }
  }

  /**
   * Delete user
   * @param {number} userId - User ID
   * @returns {boolean} Success status
   */
  static deleteUser(userId) {
    try {
      const realm = realmManager.getRealm();
      const user = realm.objects('User').filtered('id = $0', userId)[0];

      if (!user) {
        console.warn(`User not found: ${userId}`);
        return false;
      }

      realm.write(() => {
        realm.delete(user);
      });

      console.log(`✓ User deleted: ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Get all users
   * @returns {Array} Array of user objects
   */
  static getAllUsers() {
    try {
      const realm = realmManager.getRealm();
      const users = realm.objects('User');
      return users.map((u) => this._toObject(u));
    } catch (error) {
      console.error('❌ Error getting all users:', error);
      return [];
    }
  }

  /**
   * Convert Realm object to plain JavaScript object
   * @private
   */
  static _toObject(user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      address: user.address || null,
      passwordHash: user.passwordHash,
      isActive: user.isActive,
      // Convert Realm Date to timestamp for easier handling in React
      createdAt: user.createdAt ? user.createdAt.getTime() : new Date().getTime(),
      updatedAt: user.updatedAt ? user.updatedAt.getTime() : new Date().getTime(),
    };
  }
}

export default UserRepository;
