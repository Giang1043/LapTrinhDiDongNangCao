import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { TouchableOpacity, Image } from 'react-native';
import { mockProducts } from '../../services/mockData';

const PAGE_SIZE = 10;

export default function CategoryProductsScreen({ route, navigation }) {
  const { categoryId, categoryName } = route.params;
  const allProducts = mockProducts.filter(p => p.categoryId === categoryId);
  const [displayedProducts, setDisplayedProducts] = useState(allProducts.slice(0, PAGE_SIZE));
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const loadMore = useCallback(() => {
    if (loading || displayedProducts.length >= allProducts.length) return;
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      const nextPage = page + 1;
      const newProducts = allProducts.slice(0, nextPage * PAGE_SIZE);
      setDisplayedProducts(newProducts);
      setPage(nextPage);
      setLoading(false);
    }, 800);
  }, [loading, displayedProducts.length, allProducts.length, page]);

  const formatPrice = (price) => price.toLocaleString('vi-VN') + 'đ';

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productShop}>{item.shop}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
          {item.discount > 0 && (
            <Text style={styles.productDiscount}>-{item.discount}%</Text>
          )}
        </View>
        <Text style={styles.productSold}>Đã bán {item.sold}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#FF6B35" />
        <Text style={styles.footerText}>Đang tải thêm...</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{categoryName} ({allProducts.length} sản phẩm)</Text>
      <FlatList
        data={displayedProducts}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={<Text style={styles.empty}>Không có sản phẩm nào</Text>}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  title: { fontSize: 16, fontWeight: 'bold', color: '#333', padding: 16 },
  list: { paddingHorizontal: 16 },
  productCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, elevation: 2, overflow: 'hidden' },
  productImage: { width: 110, height: 110 },
  productInfo: { flex: 1, padding: 12 },
  productName: { fontSize: 14, fontWeight: '600', color: '#333' },
  productShop: { fontSize: 12, color: '#999', marginTop: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: '#FF6B35' },
  productDiscount: { fontSize: 12, color: '#fff', backgroundColor: '#FF3B30', borderRadius: 4, paddingHorizontal: 6, marginLeft: 8 },
  productSold: { fontSize: 11, color: '#999', marginTop: 4 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16 },
  footerText: { marginLeft: 8, color: '#999' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 },
});
