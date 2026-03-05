import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Text, Card, Appbar, Searchbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  primary: '#FF6B35',
  success: '#4CAF50',
  error: '#d32f2f',
  background: '#f5f5f5',
  text: '#333',
  textLight: '#666',
  white: '#fff',
};

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock data - Categories
  const categories = [
    { id: '1', name: '🍔 Bánh mì', icon: '🍔' },
    { id: '2', name: '🍕 Pizza', icon: '🍕' },
    { id: '3', name: '🍜 Mì', icon: '🍜' },
    { id: '4', name: '🍱 Cơm', icon: '🍱' },
    { id: '5', name: '🥗 Salad', icon: '🥗' },
    { id: '6', name: '🍜 Phở', icon: '🍜' },
  ];

  // Mock data - Featured Products
  const featuredProducts = [
    { 
      id: '1', 
      name: 'Bánh mì thịt nướng', 
      price: 25000, 
      image: '🥖',
      rating: 4.5,
      discount: 10 
    },
    { 
      id: '2', 
      name: 'Pizza Pepperoni', 
      price: 95000, 
      image: '🍕',
      rating: 4.8,
      discount: 15 
    },
    { 
      id: '3', 
      name: 'Phở bò', 
      price: 35000, 
      image: '🍜',
      rating: 4.7,
      discount: 5 
    },
    { 
      id: '4', 
      name: 'Mì xào', 
      price: 40000, 
      image: '🍲',
      rating: 4.6,
      discount: 8 
    },
  ];

  // Mock data - All products
  const allProducts = [
    ...featuredProducts,
    { 
      id: '5', 
      name: 'Salad kale', 
      price: 45000, 
      image: '🥗',
      rating: 4.4,
      discount: 12 
    },
    { 
      id: '6', 
      name: 'Cơm tấm', 
      price: 30000, 
      image: '🍚',
      rating: 4.5,
      discount: 0 
    },
  ];

  // Fetch user data on mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const authData = await AsyncStorage.getItem('authData');
      if (authData) {
        const { user: userData } = JSON.parse(authData);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (product) => {
    Alert.alert(product.name, `Giá: ${product.price.toLocaleString('vi-VN')} đ`);
  };

  // Category horizontal list
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.categoryCard}
      activeOpacity={0.7}
    >
      <View style={styles.categoryContent}>
        <Text style={styles.categoryIcon}>{item.icon}</Text>
        <Text style={styles.categoryName}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  // Featured products carousel
  const renderFeaturedProduct = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.productImage}>
        <Text style={styles.productImageText}>{item.image}</Text>
        {item.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{item.discount}%</Text>
          </View>
        )}
      </View>
      <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingText}>⭐ {item.rating}</Text>
      </View>
      <Text style={styles.productPrice}>
        {(item.price - (item.price * item.discount / 100)).toLocaleString('vi-VN')} đ
      </Text>
    </TouchableOpacity>
  );

  // All products grid (2 columns)
  const renderProductGridItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.productGridCard}
      onPress={() => handleProductPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.productGridImage}>
        <Text style={styles.productGridImageText}>{item.image}</Text>
      </View>
      <Text style={styles.productGridName} numberOfLines={2}>{item.name}</Text>
      <View style={styles.productGridFooter}>
        <Text style={styles.productGridPrice}>
          {(item.price - (item.price * item.discount / 100)).toLocaleString('vi-VN')} đ
        </Text>
        <Text style={styles.ratingSmall}>⭐{item.rating}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="FoodApp" subtitle="Giao hàng nhanh" />
      </Appbar.Header>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingEmoji}>👋</Text>
          <Text style={styles.greetingText}>
            Xin chào, {user?.name || 'Bạn'}!
          </Text>
          <Text style={styles.greetingSubtext}>
            Chúc bạn có ngày tốt lành
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Tìm kiếm món ăn..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            iconColor={COLORS.primary}
            placeholderTextColor={COLORS.textLight}
          />
        </View>

        {/* Promotional Banner */}
        <Card style={styles.banner}>
          <Card.Content style={styles.bannerContent}>
            <Text style={styles.bannerEmoji}>🎉</Text>
            <Text style={styles.bannerTitle}>Khuyến mãi hôm nay</Text>
            <Text style={styles.bannerSubtext}>Giảm tới 20% cho đơn hàng đầu tiên</Text>
            <TouchableOpacity style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>Khám phá</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>

        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danh mục</Text>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled={true}
            style={styles.categoryList}
          />
        </View>

        {/* Featured Products Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sản phẩm nổi bật</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllLink}>Xem tất cả →</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={featuredProducts}
            renderItem={renderFeaturedProduct}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled={true}
            style={styles.productList}
          />
        </View>

        {/* All Products Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tất cả sản phẩm</Text>
          <FlatList
            data={allProducts}
            renderItem={renderProductGridItem}
            keyExtractor={item => item.id}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            scrollEnabled={false}
            style={styles.grid}
          />
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  appbar: {
    backgroundColor: COLORS.primary,
    elevation: 4,
  },

  // Greeting Section
  greetingSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginBottom: 8,
  },
  greetingEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  greetingSubtext: {
    fontSize: 14,
    color: COLORS.textLight,
  },

  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    marginBottom: 8,
  },
  searchbar: {
    backgroundColor: '#f0f0f0',
    borderRadius: 24,
  },

  // Banner
  banner: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    elevation: 3,
  },
  bannerContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  bannerEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  bannerSubtext: {
    fontSize: 13,
    color: '#ffeaa7',
    marginBottom: 12,
  },
  bannerButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
  },
  bannerButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 13,
  },

  // Section
  section: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  viewAllLink: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Category
  categoryList: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  categoryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    marginVertical: 4,
    elevation: 2,
  },
  categoryContent: {
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },

  // Featured Product
  productList: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginRight: 12,
    marginVertical: 4,
    overflow: 'hidden',
    elevation: 2,
    width: 140,
  },
  productImage: {
    backgroundColor: '#f5f5f5',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  productImageText: {
    fontSize: 48,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  productName: {
    paddingHorizontal: 12,
    paddingTop: 12,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    height: 32,
  },
  ratingContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  ratingText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  productPrice: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },

  // Product Grid
  grid: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productGridCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    width: '48%',
  },
  productGridImage: {
    backgroundColor: '#f5f5f5',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productGridImageText: {
    fontSize: 40,
  },
  productGridName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    paddingHorizontal: 12,
    paddingTop: 12,
    minHeight: 30,
  },
  productGridFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  productGridPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  ratingSmall: {
    fontSize: 12,
    color: COLORS.textLight,
  },

  bottomSpacing: {
    height: 20,
  },
});
