/**
 * Realm Manager
 * Singleton for managing Realm database connection and lifecycle
 */

import Realm from 'realm';
import { allSchemas } from './schemas';

class RealmManager {
  constructor() {
    this.realm = null;
    this.isInitialized = false;
  }

  /**
   * Initialize Realm connection
   * @returns {Promise<Realm>} Realm instance
   */
  async initialize() {
    try {
      if (this.realm) {
        console.log('✓ Realm already initialized');
        return this.realm;
      }

      console.log('🔄 Initializing Realm database...');
      
      this.realm = await Realm.open({
        schema: allSchemas,
        schemaVersion: 1,
        migration: undefined,
      });

      this.isInitialized = true;
      console.log('✓ Realm initialized successfully');
      this.printDatabaseInfo();
      
      return this.realm;
    } catch (error) {
      console.error('❌ Failed to initialize Realm:', error);
      throw error;
    }
  }

  /**
   * Get Realm instance (ensure initialized)
   * @returns {Realm} Realm instance
   */
  getRealm() {
    if (!this.realm || !this.isInitialized) {
      throw new Error('Realm not initialized. Call initialize() first.');
    }
    return this.realm;
  }

  /**
   * Close Realm connection
   */
  async close() {
    try {
      if (this.realm) {
        this.realm.close();
        this.realm = null;
        this.isInitialized = false;
        console.log('✓ Realm connection closed');
      }
    } catch (error) {
      console.error('❌ Error closing Realm:', error);
    }
  }

  /**
   * Clear all data (for testing/reset)
   */
  async clearAllData() {
    try {
      const realm = this.getRealm();
      realm.write(() => {
        realm.deleteAll();
      });
      console.log('✓ All data cleared from Realm');
    } catch (error) {
      console.error('❌ Error clearing data:', error);
      throw error;
    }
  }

  /**
   * Print database information
   */
  printDatabaseInfo() {
    try {
      if (!this.realm) {
        console.log('Realm not initialized');
        return;
      }

      const path = this.realm.path;
      console.log('📊 Realm Database Info:');
      console.log(`   Path: ${path}`);
      console.log(`   Objects by type:`);

      const schemas = this.realm.schema;
      schemas.forEach((schema) => {
        const count = this.realm.objects(schema.name).length;
        console.log(`     - ${schema.name}: ${count}`);
      });
    } catch (error) {
      console.error('Error printing database info:', error);
    }
  }

  /**
   * Get database path
   * @returns {string} Path to Realm database file
   */
  getDatabasePath() {
    try {
      return this.realm?.path || 'Unknown';
    } catch (error) {
      return 'Error getting path';
    }
  }
}

// Export singleton instance
export const realmManager = new RealmManager();

export default realmManager;
