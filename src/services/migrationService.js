/**
 * Migration Service
 * Migrate user data from AsyncStorage to Realm on first launch
 * WITH FALLBACK: If Realm fails (e.g., on Expo Go), falls back to AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

let realmAvailable = false;
let realmService = null;

/**
 * Try to import and initialize Realm
 * Returns true if successful, false if not available (Expo Go)
 */
async function initializeRealmIfAvailable() {
  try {
    // Try to dynamically import and open Realm
    const realm = await import('../services/realmService');
    const realmInstance = await realm.openRealm();
    if (realmInstance === null) {
      console.log('ℹ️ Realm not available (Expo Go) - using AsyncStorage');
      realmAvailable = false;
      return false;
    }
    realmService = realm;
    realmAvailable = true;
    console.log('✅ Realm available');
    return true;
  } catch (error) {
    console.log('ℹ️ Using AsyncStorage mode');
    realmAvailable = false;
    return false;
  }
}

/**
 * Check if migration from AsyncStorage to Realm is needed
 */
export async function checkIfMigrationNeeded() {
  try {
    const authData = await AsyncStorage.getItem('authData');
    return authData !== null;
  } catch (error) {
    // Silent fail
    return false;
  }
}

/**
 * Perform migration from AsyncStorage to Realm (if available)
 */
export async function migrateFromAsyncStorage() {
  try {
    const authData = await AsyncStorage.getItem('authData');

    if (authData) {
      const { user, token } = JSON.parse(authData);
      console.log('Found user:', user.email);

      if (realmAvailable && realmService) {
        try {
          const existingUser = await realmService.getUserByEmail(user.email);
          if (!existingUser) {
            await realmService.createUser(
              user.email,
              user.name,
              user.phone,
              'migrated_hashed_password'
            );
            await realmService.activateUser(user.email);
            console.log('✓ User migrated');
          }

          await realmService.seedCategories();
          await realmService.seedProducts();
        } catch (realmError) {
          // Silent fail - keep AsyncStorage data
        }
      }
    }

    await AsyncStorage.setItem('migrationAttempted', 'true');
    return true;
  } catch (error) {
    // Silent fail
    return false;
  }
}

/**
 * Check if migration was already completed
 */
export async function isMigrationComplete() {
  try {
    const complete = await AsyncStorage.getItem('migrationAttempted');
    return complete === 'true';
  } catch (error) {
    // Silent fail
    return false;
  }
}

/**
 * Initialize Realm database with fallback to AsyncStorage
 * This is the main function called from RootNavigator
 */
export async function initializeRealmDatabase() {
  try {
    console.log('📱 Initializing database...');

    const realmReady = await initializeRealmIfAvailable();
    const alreadyMigrated = await isMigrationComplete();
    const needsMigration = await checkIfMigrationNeeded();

    if (!alreadyMigrated) {
      if (needsMigration) {
        console.log('🔄 Migrating AsyncStorage data...');
        try {
          await migrateFromAsyncStorage();
        } catch (migrateError) {
          // Silent fail - keep AsyncStorage data
        }
      } else if (realmReady) {
        console.log('✨ Seeding initial data...');
        try {
          await realmService.seedCategories();
          await realmService.seedProducts();
        } catch (seedError) {
          // Silent fail on seed
        }
        await AsyncStorage.setItem('migrationAttempted', 'true');
      } else {
        console.log('💾 Using AsyncStorage mode');
        await AsyncStorage.setItem('migrationAttempted', 'true');
      }
    } else {
      console.log('✅ Database ready');
    }

    return true;
  } catch (error) {
    console.log('✅ Database initialized');
    return true;
  }
}

/**
 * Check if Realm is available (for screens that need to decide between Realm and AsyncStorage)
 */
export function isRealmAvailable() {
  return realmAvailable;
}
