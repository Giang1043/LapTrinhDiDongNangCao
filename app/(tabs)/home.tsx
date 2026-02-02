import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { Avatar, Button, Card, Text, Chip, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext';
import * as realmService from '@/services/realmService';
import * as api from '@/services/api';
import SearchFilter, { SearchFilterState } from '@/components/SearchFilter';
import { useRouter } from 'expo-router';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  category: string;
  discount?: number;
  reviewCount?: number;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<SearchFilterState | null>(null);

  // Load user from Realm on mount
  useEffect(() => {
    loadUserData();
  }, [user?.id]);

  const loadUserData = async () => {
    try {
      if (user?.id) {
        const realmUser = await realmService.getUser(user.id);
        if (realmUser) {
          setUserData(realmUser as any);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadProducts(), loadCategories()]);
      // Khởi tạo filteredProducts = products khi tải xong
      const response = await api.getProductList(1, 20);
      if (response && response.data) {
        setFilteredProducts(response.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await api.getProductList(1, 20);
      if (response && response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.getCategoryList();
      if (response && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadProducts(), loadCategories(), loadUserData()]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = async (filters: SearchFilterState) => {
    try {
      setSearchActive(true);
      setCurrentFilters(filters);
      setLoading(true);

      // Xử lý tìm kiếm nâng cao
      if (filters.query || filters.category || filters.rating) {
        const response = await api.searchProductsAdvanced(filters.query, {
          priceMin: filters.priceRange[0],
          priceMax: filters.priceRange[1],
          rating: filters.rating || undefined,
          category: filters.category || undefined,
          sortBy: filters.sortBy,
        });

        if (response && response.data) {
          setFilteredProducts(response.data);
        }
      } else {
        // Nếu không có điều kiện tìm kiếm, hiển thị tất cả sản phẩm được lọc
        setFilteredProducts(getFilteredProducts());
      }
    } catch (error) {
      console.error('Error searching products:', error);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = async () => {
    try {
      setSearchActive(false);
      setCurrentFilters(null);
      setSelectedCategory('all');
      setFilteredProducts(products);
    } catch (error) {
      console.error('Error resetting filters:', error);
    }
  };

  const handleLogout = async () => {
    try {
      if (user?.id) {
        await realmService.deleteUserProfile(user.id);
      }
      await logout();
      router.replace('/login' as any);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleProductPress = (productId: string) => {
    router.push({
      pathname: '/product-detail',
      params: { productId },
    } as any);
  };

  const getFilteredProducts = () => {
    let result = products;

    // Lọc theo danh mục
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Lọc theo khoảng giá (nếu có bộ lọc)
    if (currentFilters) {
      result = result.filter(
        (p) =>
          p.price >= currentFilters.priceRange[0] &&
          p.price <= currentFilters.priceRange[1]
      );

      // Lọc theo đánh giá
      if (currentFilters.rating) {
        result = result.filter((p) => p.rating >= currentFilters.rating!);
      }

      // Sắp xếp
      result = sortProducts(result, currentFilters.sortBy);
    }

    return result;
  };

  const sortProducts = (
    items: Product[],
    sortBy: SearchFilterState['sortBy']
  ): Product[] => {
    const sorted = [...items];
    
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'newest':
        return sorted.reverse(); // Giả sử thứ tự API là mới nhất trước
      case 'relevance':
      default:
        return sorted;
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Search Filter Component */}
      <SearchFilter
        onSearch={handleSearch}
        onReset={handleResetFilters}
        categories={categories}
      />

      {/* User Header Section */}
      <Card style={styles.userCard}>
        <Card.Content>
          <View style={styles.userHeader}>
            <Avatar.Image
              size={60}
              source={{
                uri: userData?.avatar || 'https://via.placeholder.com/60',
              }}
            />
            <View style={styles.userInfo}>
              <Text variant="headlineSmall">Xin chào, {userData?.fullName || 'Bạn'}!</Text>
              <Text variant="bodySmall" style={styles.email}>
                {userData?.email}
              </Text>
              {userData?.phoneNumber && (
                <Text variant="bodySmall">{userData.phoneNumber}</Text>
              )}
            </View>
            <Button
              mode="contained-tonal"
              onPress={handleLogout}
              style={styles.logoutBtn}
              compact
            >
              Đăng xuất
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* User Stats Section */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Text variant="displaySmall" style={styles.statNumber}>
              {products.length}
            </Text>
            <Text variant="bodySmall">Sản phẩm</Text>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Text variant="displaySmall" style={styles.statNumber}>
              4.5
            </Text>
            <Text variant="bodySmall">Đánh giá</Text>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Text variant="displaySmall" style={styles.statNumber}>
              12
            </Text>
            <Text variant="bodySmall">Đơn hàng</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Category Filter */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Danh mục
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip
            selected={selectedCategory === 'all'}
            onPress={() => setSelectedCategory('all')}
            style={styles.categoryChip}
          >
            Tất cả
          </Chip>
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              selected={selectedCategory === cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              style={styles.categoryChip}
            >
              {cat.name}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* Products Grid */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Sản phẩm nổi bật
        </Text>
        {getFilteredProducts().map((product) => (
          <Card key={product.id} style={styles.productCard} onPress={() => handleProductPress(product.id)}>
            <Card.Cover source={{ uri: product.image }} />
            <Card.Content style={styles.productContent}>
              <Text variant="titleMedium" numberOfLines={1}>
                {product.name}
              </Text>
              <Text
                variant="bodySmall"
                style={styles.productDescription}
                numberOfLines={2}
              >
                {product.description}
              </Text>
              <View style={styles.productFooter}>
                <View>
                  <Text variant="labelLarge" style={styles.price}>
                    {product.price.toLocaleString('vi-VN')} ₫
                  </Text>
                  <Text variant="labelSmall">⭐ {product.rating}</Text>
                </View>
                <Button 
                  mode="contained" 
                  compact
                  onPress={() => handleProductPress(product.id)}
                >
                  Chi tiết
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>

      {/* Bottom Action Buttons */}
      <View style={styles.actionButtons}>
        <Button mode="outlined" style={styles.actionBtn}>
          Giỏ hàng
        </Button>
        <Button mode="outlined" style={styles.actionBtn}>
          Đơn hàng
        </Button>
        <Button mode="outlined" style={styles.actionBtn}>
          Cài đặt
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
  },
  userCard: {
    marginBottom: 16,
    marginTop: 8,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  userInfo: {
    flex: 1,
  },
  email: {
    marginTop: 4,
    color: '#666',
  },
  logoutBtn: {
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  categoryChip: {
    marginRight: 8,
  },
  productCard: {
    marginBottom: 12,
  },
  productContent: {
    paddingTop: 12,
  },
  productDescription: {
    marginVertical: 4,
    color: '#666',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    color: '#FF6B6B',
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 16,
    paddingBottom: 20,
  },
  actionBtn: {
    flex: 1,
  },
});
