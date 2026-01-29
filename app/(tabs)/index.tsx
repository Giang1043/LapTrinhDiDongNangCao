import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, Text, Image, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import * as realmService from '@/services/realmService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface FoodItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image?: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
}

export default function HomeScreen() {
  const { user, logout, isSignedIn } = useAuth();
  const router = useRouter();
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<FoodItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'Tất cả', icon: 'apps' },
    { id: 'burgers', name: 'Burger', icon: 'hamburger' },
    { id: 'pizza', name: 'Pizza', icon: 'pizza' },
    { id: 'sushi', name: 'Sushi', icon: 'rice' },
    { id: 'desserts', name: 'Tráng miệng', icon: 'cake' },
  ];

  useEffect(() => {
    if (!isSignedIn) {
      router.replace('/login' as any);
      return;
    }
    
    loadFoodItems();
    loadFavorites();
  }, [isSignedIn]);

  useEffect(() => {
    filterItems();
  }, [foodItems, selectedCategory, searchQuery]);

  const loadFoodItems = useCallback(async () => {
    try {
      setIsLoading(true);
      // Sử dụng dữ liệu mẫu vì không có API thực tế
      const sampleData = generateSampleFoodItems();
      setFoodItems(sampleData);
    } catch (error) {
      console.error('Error loading food items:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadFavorites = useCallback(async () => {
    try {
      if (!user?.id) return;
      const favs = await realmService.getUserFavorites(user.id);
      const favIds = new Set(favs.map((f: any) => f.foodItemId) as string[]);
      setFavorites(favIds);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, [user?.id]);

  const filterItems = () => {
    let filtered = foodItems;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadFoodItems();
    await loadFavorites();
    setIsRefreshing(false);
  }, []);

  const toggleFavorite = async (foodItem: FoodItem) => {
    try {
      const isFav = favorites.has(foodItem.id);
      const newFavorites = new Set(favorites);

      if (isFav) {
        newFavorites.delete(foodItem.id);
        // Xóa khỏi Realm
        const favs = await realmService.getUserFavorites(user?.id || '');
        const fav = favs.find((f: any) => f.foodItemId === foodItem.id);
        if (fav) {
          await realmService.removeFavorite(fav.id);
        }
      } else {
        newFavorites.add(foodItem.id);
        // Thêm vào Realm
        const favoriteId = `fav_${user?.id}_${foodItem.id}`;
        await realmService.addFavorite({
          id: favoriteId,
          userId: user?.id || '',
          foodItemId: foodItem.id,
          foodName: foodItem.name,
          addedAt: new Date(),
        });
      }

      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleAddToCart = async (foodItem: FoodItem) => {
    try {
      const cartItemId = `cart_${user?.id}_${foodItem.id}_${Date.now()}`;
      await realmService.addToCart({
        id: cartItemId,
        userId: user?.id || '',
        foodItemId: foodItem.id,
        foodName: foodItem.name,
        price: foodItem.price,
        quantity: 1,
        image: foodItem.image,
        addedAt: new Date(),
      });
      // Show toast notification
      alert(`${foodItem.name} đã được thêm vào giỏ hàng`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Lỗi khi thêm vào giỏ hàng');
    }
  };

  const FoodItemCard = ({ item }: { item: FoodItem }) => {
    const isFav = favorites.has(item.id);

    return (
      <TouchableOpacity 
        style={styles.foodCard}
        onPress={() => router.push(`/explore?foodId=${item.id}`)}
      >
        <View style={styles.cardImageContainer}>
          {item.image ? (
            <Image 
              source={{ uri: item.image }} 
              style={styles.cardImage}
            />
          ) : (
            <View style={styles.cardImagePlaceholder}>
              <MaterialCommunityIcons name="food" size={40} color="#999" />
            </View>
          )}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(item)}
          >
            <MaterialCommunityIcons
              name={isFav ? 'heart' : 'heart-outline'}
              size={24}
              color={isFav ? '#FF6B6B' : '#666'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text>

          <View style={styles.cardFooter}>
            <View style={styles.ratingContainer}>
              <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>
                {item.rating.toFixed(1)} ({item.reviewCount})
              </Text>
            </View>
            <Text style={styles.priceText}>{item.price.toLocaleString('vi-VN')}₫</Text>
          </View>

          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => handleAddToCart(item)}
            disabled={!item.inStock}
          >
            <MaterialCommunityIcons name="cart-plus" size={20} color="white" />
            <Text style={styles.addToCartText}>
              {item.inStock ? 'Thêm vào giỏ' : 'Hết hàng'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const CategoryButton = ({ category }: { category: (typeof categories)[0] }) => {
    const isActive = selectedCategory === category.id;
    return (
      <TouchableOpacity
        style={[styles.categoryButton, isActive && styles.categoryButtonActive]}
        onPress={() => setSelectedCategory(category.id)}
      >
        <MaterialCommunityIcons
          name={category.icon as any}
          size={24}
          color={isActive ? 'white' : '#666'}
        />
        <Text style={[styles.categoryButtonText, isActive && styles.categoryButtonTextActive]}>
          {category.name}
        </Text>
      </TouchableOpacity>
    );
  };

  if (!isSignedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Xin chào, {user?.fullName || 'Bạn'}!</Text>
          <Text style={styles.tagline}>Tìm đồ ăn yêu thích của bạn</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push('/account')}
        >
          {user?.avatar ? (
            <Image 
              source={{ uri: user.avatar }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <MaterialCommunityIcons name="account-circle" size={32} color="#FF6B6B" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => <CategoryButton category={item} />}
          keyExtractor={item => item.id}
        />
      </View>

      {/* Food Items */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          numColumns={2}
          columnWrapperStyle={styles.foodGrid}
          contentContainerStyle={styles.foodListContent}
          renderItem={({ item }) => <FoodItemCard item={item} />}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#FF6B6B']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="information" size={48} color="#999" />
              <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

// Hàm tạo dữ liệu mẫu
function generateSampleFoodItems(): FoodItem[] {
  return [
    {
      id: '1',
      name: 'Hamburger Cộng',
      description: 'Bánh mì tổi, phô mai, salad',
      category: 'burgers',
      price: 45000,
      image: 'https://via.placeholder.com/200?text=Hamburger',
      rating: 4.8,
      reviewCount: 150,
      inStock: true,
    },
    {
      id: '2',
      name: 'Pizza Margherita',
      description: 'Phô mai, cà chua, rau thơm',
      category: 'pizza',
      price: 65000,
      image: 'https://via.placeholder.com/200?text=Pizza',
      rating: 4.7,
      reviewCount: 200,
      inStock: true,
    },
    {
      id: '3',
      name: 'Sushi Cá Hồi',
      description: 'Cá hồi tươi, cơm sushi, nước sốt',
      category: 'sushi',
      price: 85000,
      image: 'https://via.placeholder.com/200?text=Sushi',
      rating: 4.9,
      reviewCount: 180,
      inStock: true,
    },
    {
      id: '4',
      name: 'Bánh Chocolate',
      description: 'Bánh chocolate đen, kem tươi',
      category: 'desserts',
      price: 35000,
      image: 'https://via.placeholder.com/200?text=Cake',
      rating: 4.6,
      reviewCount: 120,
      inStock: true,
    },
    {
      id: '5',
      name: 'Burger Gà',
      description: 'Thịt gà viên, mayo, rau',
      category: 'burgers',
      price: 38000,
      image: 'https://via.placeholder.com/200?text=Chicken',
      rating: 4.5,
      reviewCount: 95,
      inStock: true,
    },
    {
      id: '6',
      name: 'Pizza Pepperoni',
      description: 'Pepperoni, phô mai, cà chua',
      category: 'pizza',
      price: 75000,
      image: 'https://via.placeholder.com/200?text=Pepperoni',
      rating: 4.8,
      reviewCount: 210,
      inStock: true,
    },
  ];
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#000',
  },
  tagline: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden' as const,
    backgroundColor: 'white',
  },
  profileImage: {
    width: 'auto' as any,
    height: 'auto' as any,
  },
  profileImagePlaceholder: {
    width: 'auto' as any,
    height: 'auto' as any,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: 'white',
  },
  categoriesSection: {
    marginVertical: 12,
  },
  categoriesList: {
    paddingHorizontal: 12,
  },
  categoryButton: {
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    marginHorizontal: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  categoryButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  categoryButtonText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  foodGrid: {
    justifyContent: 'space-between' as const,
    paddingHorizontal: 8,
  },
  foodListContent: {
    paddingBottom: 20,
  },
  foodCard: {
    flex: 0.5,
    marginHorizontal: 8,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden' as const,
    backgroundColor: 'white',
    elevation: 2,
  },
  cardImageContainer: {
    position: 'relative' as const,
    width: '100%' as any,
    height: 140,
  },
  cardImage: {
    width: '100%' as any,
    height: 140 as any,
  },
  cardImagePlaceholder: {
    width: '100%' as any,
    height: 140 as any,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  favoriteButton: {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  cardContent: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#000',
  },
  cardDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FF6B6B',
  },
  addToCartButton: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingVertical: 8,
    backgroundColor: '#FF6B6B',
    borderRadius: 6,
  },
  addToCartText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600' as const,
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
};