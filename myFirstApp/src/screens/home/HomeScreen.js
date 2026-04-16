import React, { useEffect } from 'react';
import { View, ScrollView, FlatList, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Text, Card, Chip, Searchbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { mockCategories, mockProducts } from '../../services/mockData';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BANNERS = [
  { id: '1', title: '🎉 Giảm 30% đơn đầu tiên', subtitle: 'Áp dụng cho tất cả món ăn', color: '#FF6B35' },
  { id: '2', title: '🚚 Freeship đơn từ 50K', subtitle: 'Giao nhanh trong 30 phút', color: '#4CAF50' },
  { id: '3', title: '🔥 Flash Sale 12H-14H', subtitle: 'Giảm đến 50% nhiều món hot', color: '#E91E63' },
];

export default function HomeScreen({ navigation }) {
  const { user } = useAuthStore();
  const loadCart = useCartStore(s => s.loadCart);

  useEffect(() => { loadCart(); }, []);

  // Top 10 best sellers (sorted by sold count)
  const topSelling = [...mockProducts].sort((a, b) => b.sold - a.sold).slice(0, 10);

  // Top 20 discounted (sorted by discount %)
  const discounted = [...mockProducts].sort((a, b) => b.discount - a.discount).slice(0, 20);

  const formatPrice = (price) => price.toLocaleString('vi-VN') + 'đ';

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => navigation.navigate('CategoryProducts', { categoryId: item.id, categoryName: item.name })}
    >
      <Image source={{ uri: item.image }} style={styles.categoryImage} />
      <Text style={styles.categoryName} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderHorizontalProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.hProductCard}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.hProductImage} />
      <Text style={styles.hProductName} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.hProductPrice}>{formatPrice(item.price)}</Text>
      <View style={styles.hProductMeta}>
        <MaterialCommunityIcons name="fire" size={12} color="#FF6B35" />
        <Text style={styles.hProductSold}>Đã bán {item.sold}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderGridProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.gridProductCard}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <View style={styles.discountBadge}>
        <Text style={styles.discountText}>-{item.discount}%</Text>
      </View>
      <Image source={{ uri: item.image }} style={styles.gridProductImage} />
      <View style={styles.gridProductInfo}>
        <Text style={styles.gridProductName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.gridProductPrice}>{formatPrice(item.price)}</Text>
        <Text style={styles.gridProductOriginal}>{formatPrice(item.originalPrice)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header greeting */}
      <View style={styles.greeting}>
        <View>
          <Text style={styles.greetingHi}>Xin chào 👋</Text>
          <Text style={styles.greetingName}>{user?.fullName || 'Bạn'}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image source={{ uri: user?.avatar || 'https://i.pravatar.cc/150?img=3' }} style={styles.avatar} />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <TouchableOpacity onPress={() => navigation.navigate('Search')} activeOpacity={0.8}>
        <Searchbar
          placeholder="Tìm kiếm món ăn..."
          style={styles.searchBar}
          editable={false}
          icon="magnify"
        />
      </TouchableOpacity>

      {/* Promotional banners */}
      <FlatList
        data={BANNERS}
        renderItem={({ item }) => (
          <View style={[styles.bannerCard, { backgroundColor: item.color }]}>  
            <Text style={styles.bannerTitle}>{item.title}</Text>
            <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
          </View>
        )}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bannerList}
        pagingEnabled
        snapToInterval={SCREEN_WIDTH - 40}
        decelerationRate="fast"
      />

      {/* Categories - horizontal scroll*/}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📂 Danh mục</Text>
        </View>
        <FlatList
          data={mockCategories}
          renderItem={renderCategory}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {/* Top 10 best sellers - horizontal*/}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔥 Top 10 bán chạy nhất</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <Text style={styles.seeAll}>Xem tất cả →</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={topSelling}
          renderItem={renderHorizontalProduct}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hProductList}
        />
      </View>

      {/* Top 20 discounted - 2 column grid*/}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🏷️ Giảm giá sốc (Top 20)</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <Text style={styles.seeAll}>Xem tất cả →</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={discounted}
          renderItem={renderGridProduct}
          keyExtractor={item => item.id}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridList}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  greeting: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 8 },
  greetingHi: { fontSize: 14, color: '#666' },
  greetingName: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#FF6B35' },
  searchBar: { marginHorizontal: 16, marginBottom: 12, elevation: 2, borderRadius: 12, backgroundColor: '#fff' },
  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginLeft: 16, marginBottom: 12 },
  seeAll: { fontSize: 13, color: '#FF6B35', fontWeight: '600' },
  // Categories
  categoryList: { paddingHorizontal: 12 },
  categoryItem: { alignItems: 'center', marginHorizontal: 6, width: 72 },
  categoryImage: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff', elevation: 2 },
  categoryName: { fontSize: 11, color: '#333', marginTop: 6, textAlign: 'center' },
  // Horizontal products
  hProductList: { paddingHorizontal: 12 },
  hProductCard: { width: 140, marginHorizontal: 6, backgroundColor: '#fff', borderRadius: 12, padding: 10, elevation: 2 },
  hProductImage: { width: 120, height: 90, borderRadius: 8, alignSelf: 'center' },
  hProductName: { fontSize: 13, fontWeight: '600', color: '#333', marginTop: 8, height: 34 },
  hProductPrice: { fontSize: 14, fontWeight: 'bold', color: '#FF6B35', marginTop: 4 },
  hProductMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  hProductSold: { fontSize: 11, color: '#999', marginLeft: 2 },
  // Grid products
  gridList: { paddingHorizontal: 12 },
  gridRow: { justifyContent: 'space-between', marginBottom: 12 },
  gridProductCard: { width: '48%', backgroundColor: '#fff', borderRadius: 12, elevation: 2, overflow: 'hidden' },
  gridProductImage: { width: '100%', height: 120, backgroundColor: '#f9f9f9' },
  gridProductInfo: { padding: 10 },
  gridProductName: { fontSize: 13, fontWeight: '600', color: '#333', height: 34 },
  gridProductPrice: { fontSize: 15, fontWeight: 'bold', color: '#FF6B35', marginTop: 4 },
  gridProductOriginal: { fontSize: 12, color: '#999', textDecorationLine: 'line-through' },
  discountBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#FF3B30', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, zIndex: 1 },
  discountText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  // Banners
  bannerList: { paddingHorizontal: 16, marginBottom: 16 },
  bannerCard: { width: SCREEN_WIDTH - 48, marginRight: 12, borderRadius: 16, padding: 20, justifyContent: 'center' },
  bannerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  bannerSubtitle: { fontSize: 13, color: '#ffffffcc', marginTop: 4 },
});
