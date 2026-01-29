/**
 * Realm Database Configuration
 * Quản lý lưu trữ dữ liệu cục bộ - hỗ trợ offline-first
 */

import Realm from 'realm';

// ===== DEFINE SCHEMAS =====

export class UserModel extends Realm.Object {
  id!: string; // UUID
  email!: string;
  username!: string;
  fullName!: string;
  phoneNumber?: string;
  avatar?: string;
  address?: string;
  dateOfBirth?: Date;
  city?: string;
  district?: string;
  role!: 'user' | 'admin' | 'moderator';
  isEmailVerified!: boolean;
  profileCompleteness!: number; // 0-100
  createdAt!: Date;
  updatedAt!: Date;

  static schema = {
    name: 'User',
    primaryKey: 'id',
    properties: {
      id: 'string',
      email: { type: 'string', indexed: true },
      username: { type: 'string', indexed: true },
      fullName: 'string',
      phoneNumber: 'string?',
      avatar: 'string?',
      address: 'string?',
      dateOfBirth: 'date?',
      city: 'string?',
      district: 'string?',
      role: 'string', // 'user' | 'admin' | 'moderator'
      isEmailVerified: 'bool',
      profileCompleteness: { type: 'int', default: 0 },
      createdAt: 'date',
      updatedAt: 'date',
    },
  };
}

export class SessionModel extends Realm.Object {
  id!: string;
  userId!: string;
  accessToken!: string;
  refreshToken!: string;
  accessTokenExpiresAt!: Date;
  refreshTokenExpiresAt!: Date;
  createdAt!: Date;
  lastActivity!: Date;
  deviceInfo!: string; // JSON string with device info
  ipAddress?: string;

  static schema = {
    name: 'Session',
    primaryKey: 'id',
    properties: {
      id: 'string',
      userId: { type: 'string', indexed: true },
      accessToken: 'string',
      refreshToken: 'string',
      accessTokenExpiresAt: 'date',
      refreshTokenExpiresAt: 'date',
      createdAt: 'date',
      lastActivity: 'date',
      deviceInfo: 'string',
      ipAddress: 'string?',
    },
  };
}

export class FoodItemModel extends Realm.Object {
  id!: string;
  name!: string;
  description!: string;
  category!: string;
  price!: number;
  image?: string;
  rating!: number;
  reviewCount!: number;
  inStock!: boolean;
  createdAt!: Date;

  static schema = {
    name: 'FoodItem',
    primaryKey: 'id',
    properties: {
      id: 'string',
      name: { type: 'string', indexed: true },
      description: 'string',
      category: { type: 'string', indexed: true },
      price: 'double',
      image: 'string?',
      rating: 'float',
      reviewCount: 'int',
      inStock: 'bool',
      createdAt: 'date',
    },
  };
}

export class CartItemModel extends Realm.Object {
  id!: string;
  userId!: string;
  foodItemId!: string;
  foodName!: string;
  price!: number;
  quantity!: number;
  image?: string;
  addedAt!: Date;

  static schema = {
    name: 'CartItem',
    primaryKey: 'id',
    properties: {
      id: 'string',
      userId: { type: 'string', indexed: true },
      foodItemId: { type: 'string', indexed: true },
      foodName: 'string',
      price: 'double',
      quantity: 'int',
      image: 'string?',
      addedAt: 'date',
    },
  };
}

export class OrderModel extends Realm.Object {
  id!: string;
  userId!: string;
  orderNumber!: string;
  totalAmount!: number;
  items!: Realm.List<OrderItemModel>;
  status!: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  deliveryAddress!: string;
  specialInstructions?: string;
  createdAt!: Date;
  updatedAt!: Date;

  static schema = {
    name: 'Order',
    primaryKey: 'id',
    properties: {
      id: 'string',
      userId: { type: 'string', indexed: true },
      orderNumber: { type: 'string', indexed: true },
      totalAmount: 'double',
      items: { type: 'list', objectType: 'OrderItem' },
      status: 'string',
      deliveryAddress: 'string',
      specialInstructions: 'string?',
      createdAt: 'date',
      updatedAt: 'date',
    },
  };
}

export class OrderItemModel extends Realm.Object {
  id!: string;
  foodName!: string;
  price!: number;
  quantity!: number;

  static schema = {
    name: 'OrderItem',
    primaryKey: 'id',
    properties: {
      id: 'string',
      foodName: 'string',
      price: 'double',
      quantity: 'int',
    },
  };
}

export class FavoriteModel extends Realm.Object {
  id!: string;
  userId!: string;
  foodItemId!: string;
  foodName!: string;
  addedAt!: Date;

  static schema = {
    name: 'Favorite',
    primaryKey: 'id',
    properties: {
      id: 'string',
      userId: { type: 'string', indexed: true },
      foodItemId: { type: 'string', indexed: true },
      foodName: 'string',
      addedAt: 'date',
    },
  };
}

// ===== REALM INSTANCE =====

let realmInstance: Realm | null = null;

export const getRealm = async (): Promise<Realm> => {
  if (realmInstance && !realmInstance.isClosed) {
    return realmInstance;
  }

  try {
    const realmConfig: any = {
      schema: [UserModel, SessionModel, FoodItemModel, CartItemModel, OrderModel, OrderItemModel, FavoriteModel],
      schemaVersion: 1,
      onMigration: (oldRealm: any, newRealm: any) => {
        // Handle migrations if schema changes
        console.log('Realm migration completed');
      },
    };
    realmInstance = await Realm.open(realmConfig);
    return realmInstance;
  } catch (error) {
    console.error('Failed to open Realm:', error);
    throw error;
  }
};

export const closeRealm = () => {
  if (realmInstance && !realmInstance.isClosed) {
    realmInstance.close();
    realmInstance = null;
  }
};

// ===== USER OPERATIONS =====

export const saveUser = async (user: any): Promise<void> => {
  const realm = await getRealm();
  realm.write(() => {
    realm.create('User', user, Realm.UpdateMode.Modified);
  });
};

export const getUser = async (userId: string): Promise<UserModel | null> => {
  const realm = await getRealm();
  return realm.objectForPrimaryKey('User', userId) as any;
};

export const getAllUsers = async (): Promise<Realm.Results<UserModel>> => {
  const realm = await getRealm();
  return realm.objects('User') as any;
};

export const deleteUser = async (userId: string): Promise<void> => {
  const realm = await getRealm();
  const user = realm.objectForPrimaryKey('User', userId);
  if (user) {
    realm.write(() => {
      realm.delete(user);
    });
  }
};

// ===== SESSION OPERATIONS =====

export const saveSession = async (session: any): Promise<void> => {
  const realm = await getRealm();
  realm.write(() => {
    realm.create('Session', session, Realm.UpdateMode.Modified);
  });
};

export const getSession = async (sessionId: string): Promise<SessionModel | null> => {
  const realm = await getRealm();
  return realm.objectForPrimaryKey('Session', sessionId) as any;
};

export const getUserSessions = async (userId: string): Promise<Realm.Results<SessionModel>> => {
  const realm = await getRealm();
  return realm.objects('Session').filtered(`userId = '${userId}'`) as any;
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  const realm = await getRealm();
  const session = realm.objectForPrimaryKey('Session', sessionId);
  if (session) {
    realm.write(() => {
      realm.delete(session);
    });
  }
};

export const deleteExpiredSessions = async (): Promise<void> => {
  const realm = await getRealm();
  const now = new Date();
  const expiredSessions = realm.objects('Session').filtered(`refreshTokenExpiresAt < $0`, now);
  
  if (expiredSessions.length > 0) {
    realm.write(() => {
      realm.delete(expiredSessions);
    });
  }
};

// ===== CART OPERATIONS =====

export const addToCart = async (item: any): Promise<void> => {
  const realm = await getRealm();
  realm.write(() => {
    realm.create('CartItem', item, Realm.UpdateMode.Modified);
  });
};

export const getCart = async (userId: string): Promise<Realm.Results<CartItemModel>> => {
  const realm = await getRealm();
  return realm.objects('CartItem').filtered(`userId = '${userId}'`) as any;
};

export const removeFromCart = async (cartItemId: string): Promise<void> => {
  const realm = await getRealm();
  const item = realm.objectForPrimaryKey('CartItem', cartItemId);
  if (item) {
    realm.write(() => {
      realm.delete(item);
    });
  }
};

export const clearCart = async (userId: string): Promise<void> => {
  const realm = await getRealm();
  const cartItems = realm.objects('CartItem').filtered(`userId = '${userId}'`);
  
  if (cartItems.length > 0) {
    realm.write(() => {
      realm.delete(cartItems);
    });
  }
};

// ===== ORDER OPERATIONS =====

export const saveOrder = async (order: any): Promise<void> => {
  const realm = await getRealm();
  realm.write(() => {
    realm.create('Order', order, Realm.UpdateMode.Modified);
  });
};

export const getOrder = async (orderId: string): Promise<OrderModel | null> => {
  const realm = await getRealm();
  return realm.objectForPrimaryKey('Order', orderId) as any;
};

export const getUserOrders = async (userId: string): Promise<Realm.Results<OrderModel>> => {
  const realm = await getRealm();
  return realm.objects('Order').filtered(`userId = '${userId}'`).sorted('createdAt', true) as any;
};

export const updateOrderStatus = async (orderId: string, status: string): Promise<void> => {
  const realm = await getRealm();
  const order = realm.objectForPrimaryKey('Order', orderId);
  if (order) {
    realm.write(() => {
      order.status = status as any;
      order.updatedAt = new Date();
    });
  }
};

// ===== FAVORITE OPERATIONS =====

export const addFavorite = async (favorite: any): Promise<void> => {
  const realm = await getRealm();
  realm.write(() => {
    realm.create('Favorite', favorite, Realm.UpdateMode.Modified);
  });
};

export const removeFavorite = async (favoriteId: string): Promise<void> => {
  const realm = await getRealm();
  const favorite = realm.objectForPrimaryKey('Favorite', favoriteId);
  if (favorite) {
    realm.write(() => {
      realm.delete(favorite);
    });
  }
};

export const getUserFavorites = async (userId: string): Promise<Realm.Results<FavoriteModel>> => {
  const realm = await getRealm();
  return realm.objects('Favorite').filtered(`userId = '${userId}'`) as any;
};

export const isFavorite = async (userId: string, foodItemId: string): Promise<boolean> => {
  const realm = await getRealm();
  const favorite = realm.objects('Favorite').filtered(`userId = '${userId}' AND foodItemId = '${foodItemId}'`);
  return favorite.length > 0;
};

// ===== CLEANUP =====

export const clearAllData = async (): Promise<void> => {
  const realm = await getRealm();
  realm.write(() => {
    realm.deleteAll();
  });
};

// ===== USER PROFILE OPERATIONS =====

export const saveUserProfile = async (user: Partial<UserModel>): Promise<void> => {
  const realm = await getRealm();
  realm.write(() => {
    realm.create('User', {
      ...user,
      updatedAt: new Date(),
    }, Realm.UpdateMode.Modified);
  });
};

export const updateUserProfile = async (userId: string, updates: Partial<UserModel>): Promise<void> => {
  const realm = await getRealm();
  realm.write(() => {
    const user = realm.objectForPrimaryKey('User', userId);
    if (user) {
      Object.assign(user, {
        ...updates,
        updatedAt: new Date(),
      });
    }
  });
};

export const deleteUserProfile = async (userId: string): Promise<void> => {
  const realm = await getRealm();
  realm.write(() => {
    const user = realm.objectForPrimaryKey('User', userId);
    if (user) {
      realm.delete(user);
    }
  });
};
