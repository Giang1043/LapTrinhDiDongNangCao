import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { Avatar, Button, Card, Text, Chip, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext';
import * as realmService from '@/services/realmService';
import * as api from '@/services/api';
import { useRouter } from 'expo-router';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  category: string;
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const getFilteredProducts = () => {
    if (selectedCategory === 'all') {
      return products;
    }
    return products.filter((p) => p.category === selectedCategory);
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
          <Card key={product.id} style={styles.productCard}>
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
                <Button mode="contained" compact>
                  Thêm vào giỏ
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
