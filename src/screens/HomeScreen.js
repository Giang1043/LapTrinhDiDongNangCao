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
import { useAuth } from '../hooks/useAuth';
import { useCartStore } from '../store/useCartStore';
import ProductRepository from '../database/repositories/ProductRepository';
import CategoryRepository from '../database/repositories/CategoryRepository';

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
  const { currentUser } = useAuth();
  const addToCart = useCartStore((state) => state.addToCart);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [topDiscountProducts, setTopDiscountProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  // Load data from Realm on mount
  useEffect(() => {
    // Add small delay to ensure Realm is initialized
    const timer = setTimeout(() => {
      loadData();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load categories from Realm
      const realmCategories = CategoryRepository.getAllCategories();
      setCategories(realmCategories);

      // Load all products for search functionality
      const realmAllProducts = ProductRepository.getAllProducts();
      setAllProducts(realmAllProducts);

      // Load best selling products (top 10)
      const bestSelling = ProductRepository.getBestSellingProducts(10);
      setBestSellingProducts(bestSelling);

      // Load top discount products (top 20)
      const topDiscount = ProductRepository.getTopDiscountProducts(20);
      setTopDiscountProducts(topDiscount);

      console.log('✓ Loaded data from Realm:', {
        categories: realmCategories.length,
        allProducts: realmAllProducts.length,
        bestSelling: bestSelling.length,
        topDiscount: topDiscount.length,
      });
    } catch (error) {
      console.error('❌ Error loading data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetails', { productId: product.id });
  };

  const handleAddToCart = (product) => {
    if (!currentUser?.id) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập trước');
      return;
    }

    addToCart(currentUser.id, product.id, 1);
    Alert.alert('Thành công', `Đã thêm ${product.name} vào giỏ hàng`);
  };

  // Filter products by search
  const filteredProducts = allProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <View style={styles.productCard}>
      <TouchableOpacity 
        style={styles.productImageContainer}
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
      </TouchableOpacity>
      <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingText}>⭐ {item.rating}</Text>
      </View>
      <Text style={styles.productPrice}>
        {(item.price - (item.price * item.discount / 100)).toLocaleString('vi-VN')} đ
      </Text>
      <TouchableOpacity 
        style={styles.addToCartButton}
        onPress={() => handleAddToCart(item)}
      >
        <Text style={styles.addToCartText}>🛒 Thêm vào giỏ</Text>
      </TouchableOpacity>
    </View>
  );

  // All products grid (2 columns)
  const renderProductGridItem = ({ item }) => (
    <View style={styles.productGridCard}>
      <TouchableOpacity 
        style={styles.productGridImageContainer}
        onPress={() => handleProductPress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.productGridImage}>
          <Text style={styles.productGridImageText}>{item.image}</Text>
        </View>
      </TouchableOpacity>
      <Text style={styles.productGridName} numberOfLines={2}>{item.name}</Text>
      <View style={styles.productGridFooter}>
        <Text style={styles.productGridPrice}>
          {(item.price - (item.price * item.discount / 100)).toLocaleString('vi-VN')} đ
        </Text>
        <Text style={styles.ratingSmall}>⭐{item.rating}</Text>
      </View>
      <TouchableOpacity 
        style={styles.gridAddToCartButton}
        onPress={() => handleAddToCart(item)}
      >
        <Text style={styles.gridAddToCartText}>Thêm vào giỏ</Text>
      </TouchableOpacity>
    </View>
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
            Xin chào, {currentUser?.name || 'Bạn'}!
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
          <TouchableOpacity 
            style={styles.advancedSearchButton}
            onPress={() => navigation?.navigate('Search')}
          >
            <Text style={styles.advancedSearchButtonText}>⚙️</Text>
          </TouchableOpacity>
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
            keyExtractor={item => String(item.id)}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled={true}
            style={styles.categoryList}
          />
        </View>

        {/* Best Selling Products Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sản phẩm bán chạy</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllLink}>Xem tất cả →</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={bestSellingProducts}
            renderItem={renderFeaturedProduct}
            keyExtractor={item => String(item.id)}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled={true}
            style={styles.productList}
          />
        </View>

        {/* Top Discount Products Grid or Search Results */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {searchQuery ? 'Kết quả tìm kiếm' : 'Sản phẩm theo thứ tự giảm giá dần'}
          </Text>
          <FlatList
            data={searchQuery ? filteredProducts : topDiscountProducts}
            renderItem={renderProductGridItem}
            keyExtractor={item => String(item.id)}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchbar: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 24,
  },
  advancedSearchButton: {
    backgroundColor: COLORS.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  advancedSearchButtonText: {
    fontSize: 20,
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

  // Add to cart button styles
  addToCartButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  addToCartText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 12,
  },
  productImageContainer: {
    flex: 1,
  },

  // Grid add to cart button
  gridAddToCartButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridAddToCartText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 11,
  },
  productGridImageContainer: {
    flex: 1,
  },

  bottomSpacing: {
    height: 20,
  },
});
