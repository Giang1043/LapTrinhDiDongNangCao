/**
 * Seed Data
 * Initial data population for categories and products
 */

import { realmManager } from './realmManager';

const defaultCategories = [
  { id: 1, name: 'Bánh mì', icon: '🥖', description: 'Bánh mì ngon tuyệt vời' },
  { id: 2, name: 'Pizza', icon: '🍕', description: 'Pizza nóng hổi từ lò' },
  { id: 3, name: 'Phở', icon: '🍲', description: 'Phở Việt Nam truyền thống' },
  { id: 4, name: 'Cơm', icon: '🍚', description: 'Cơm ngon hàng ngày' },
  { id: 5, name: 'Salad', icon: '🥗', description: 'Salad tươi sạch' },
  { id: 6, name: 'Burger', icon: '🍔', description: 'Burger Mỹ lạ miệng' },
  { id: 7, name: 'Đồ uống', icon: '🥤', description: 'Nước uống tươi mát' },
  { id: 8, name: 'Tráng miệng', icon: '🍰', description: 'Tráng miệng ngọt ngào' },
];

const defaultProducts = [
  // Bánh mì
  {
    id: 1,
    categoryId: 1,
    name: 'Bánh mì thịt heo',
    description: 'Bánh mì thịt heo chất lượng cao',
    image: '🥖',
    price: 35000,
    discount: 10,
    rating: 4.5,
    stock: 50,
  },
  {
    id: 2,
    categoryId: 1,
    name: 'Bánh mì pâté',
    description: 'Bánh mì pâté truyền thống',
    image: '🥖',
    price: 30000,
    discount: 5,
    rating: 4.3,
    stock: 45,
  },

  // Pizza
  {
    id: 3,
    categoryId: 2,
    name: 'Pizza Pepperoni',
    description: 'Pizza Pepperoni nóng hổi',
    image: '🍕',
    price: 120000,
    discount: 15,
    rating: 4.7,
    stock: 30,
  },
  {
    id: 4,
    categoryId: 2,
    name: 'Pizza Rau cu',
    description: 'Pizza rau củ tươi sạch',
    image: '🍕',
    price: 100000,
    discount: 10,
    rating: 4.4,
    stock: 25,
  },

  // Phở
  {
    id: 5,
    categoryId: 3,
    name: 'Phở Bò',
    description: 'Phở bò thơm ngon',
    image: '🍲',
    price: 65000,
    discount: 0,
    rating: 4.6,
    stock: 40,
  },
  {
    id: 6,
    categoryId: 3,
    name: 'Phở Gà',
    description: 'Phở gà thanh mát',
    image: '🍲',
    price: 55000,
    discount: 5,
    rating: 4.5,
    stock: 35,
  },

  // Cơm
  {
    id: 7,
    categoryId: 4,
    name: 'Cơm tấm thịt nạc',
    description: 'Cơm tấm thịt nạc chiên',
    image: '🍚',
    price: 50000,
    discount: 10,
    rating: 4.4,
    stock: 60,
  },
  {
    id: 8,
    categoryId: 4,
    name: 'Cơm chiên dương châu',
    description: 'Cơm chiên với tôm và trứng',
    image: '🍚',
    price: 60000,
    discount: 8,
    rating: 4.5,
    stock: 50,
  },

  // Salad
  {
    id: 9,
    categoryId: 5,
    name: 'Salad Caesar',
    description: 'Salad Caesar với gà nướng',
    image: '🥗',
    price: 55000,
    discount: 5,
    rating: 4.3,
    stock: 30,
  },
  {
    id: 10,
    categoryId: 5,
    name: 'Salad Hoa cúc',
    description: 'Salad tươi với hoa cúc',
    image: '🥗',
    price: 45000,
    discount: 0,
    rating: 4.2,
    stock: 25,
  },

  // Burger
  {
    id: 11,
    categoryId: 6,
    name: 'Burger Bò',
    description: 'Burger bò juicy',
    image: '🍔',
    price: 75000,
    discount: 12,
    rating: 4.6,
    stock: 40,
  },
  {
    id: 12,
    categoryId: 6,
    name: 'Burger gà',
    description: 'Burger gà giòn rụm',
    image: '🍔',
    price: 65000,
    discount: 10,
    rating: 4.4,
    stock: 35,
  },

  // Đồ uống
  {
    id: 13,
    categoryId: 7,
    name: 'Cà phê đen',
    description: 'Cà phê đen đậm đà',
    image: '🥤',
    price: 20000,
    discount: 0,
    rating: 4.5,
    stock: 100,
  },
  {
    id: 14,
    categoryId: 7,
    name: 'Trà chanh',
    description: 'Trà chanh tươi mát',
    image: '🥤',
    price: 15000,
    discount: 5,
    rating: 4.3,
    stock: 80,
  },

  // Tráng miệng
  {
    id: 15,
    categoryId: 8,
    name: 'Bánh tiramisu',
    description: 'Bánh tiramisu Ý ngon',
    image: '🍰',
    price: 40000,
    discount: 10,
    rating: 4.7,
    stock: 20,
  },
  {
    id: 16,
    categoryId: 8,
    name: 'Kem ốc quế',
    description: 'Kem ốc quế mát lạnh',
    image: '🍰',
    price: 30000,
    discount: 5,
    rating: 4.4,
    stock: 50,
  },
];

/**
 * Check if data already seeded
 * @returns {boolean} True if categories exist
 */
export const isDataSeeded = () => {
  try {
    const realm = realmManager.getRealm();
    return realm.objects('Category').length > 0;
  } catch (error) {
    console.error('Error checking if data seeded:', error);
    return false;
  }
};

/**
 * Seed database with initial data
 * Only seeds if data doesn't exist
 */
export const seedDatabase = async () => {
  try {
    if (isDataSeeded()) {
      console.log('✓ Database already seeded, skipping...');
      return;
    }

    const realm = realmManager.getRealm();

    console.log('🌱 Seeding database with initial data...');

    realm.write(() => {
      // Seed categories
      defaultCategories.forEach((category) => {
        realm.create('Category', {
          id: category.id,
          name: category.name,
          icon: category.icon,
          description: category.description || '',
          createdAt: new Date(),
        });
      });
      console.log(`   ✓ Created ${defaultCategories.length} categories`);

      // Seed products
      defaultProducts.forEach((product) => {
        realm.create('Product', {
          id: product.id,
          categoryId: product.categoryId,
          name: product.name,
          description: product.description || '',
          image: product.image || '',
          price: product.price,
          discount: product.discount || 0,
          rating: product.rating || 0,
          stock: product.stock || 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });
      console.log(`   ✓ Created ${defaultProducts.length} products`);
    });

    console.log('✓ Database seeding completed');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

export default {
  seedDatabase,
  isDataSeeded,
};
