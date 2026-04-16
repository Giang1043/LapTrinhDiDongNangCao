import React from 'react';
import { View, ScrollView, StyleSheet, Image, Alert } from 'react-native';
import { Text, Button, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { mockProducts } from '../../services/mockData';
import useCartStore from '../../store/cartStore';

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const product = mockProducts.find(p => p.id === productId);
  const addToCart = useCartStore(s => s.addToCart);

  if (!product) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Sản phẩm không tồn tại</Text>
      </View>
    );
  }

  const formatPrice = (price) => price.toLocaleString('vi-VN') + 'đ';

  const handleAddToCart = () => {
    addToCart(product);
    Alert.alert('Thành công', `Đã thêm "${product.name}" vào giỏ hàng`, [
      { text: 'Tiếp tục mua', style: 'cancel' },
      { text: 'Xem giỏ hàng', onPress: () => navigation.navigate('MainTabs', { screen: 'Cart' }) },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: product.image }} style={styles.image} />

        {product.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{product.discount}%</Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.shop}>🏪 {product.shop}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            {product.originalPrice > product.price && (
              <Text style={styles.originalPrice}>{formatPrice(product.originalPrice)}</Text>
            )}
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="star" size={18} color="#FFB800" />
              <Text style={styles.metaText}>{product.rating}</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="fire" size={18} color="#FF6B35" />
              <Text style={styles.metaText}>Đã bán {product.sold}</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <Text style={styles.descTitle}>Mô tả</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          mode="outlined"
          icon="cart-plus"
          onPress={handleAddToCart}
          style={styles.cartButton}
        >
          Thêm vào giỏ
        </Button>
        <Button
          mode="contained"
          icon="lightning-bolt"
          onPress={() => {
            addToCart(product);
            navigation.navigate('Checkout');
          }}
          style={styles.buyButton}
          buttonColor="#FF6B35"
        >
          Mua ngay
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', height: 280, backgroundColor: '#f5f5f5' },
  discountBadge: { position: 'absolute', top: 16, right: 16, backgroundColor: '#FF3B30', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  discountText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  info: { padding: 16 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  shop: { fontSize: 14, color: '#666', marginTop: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  price: { fontSize: 24, fontWeight: 'bold', color: '#FF6B35' },
  originalPrice: { fontSize: 16, color: '#999', textDecorationLine: 'line-through', marginLeft: 12 },
  metaRow: { flexDirection: 'row', marginTop: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  metaText: { fontSize: 14, color: '#666', marginLeft: 4 },
  divider: { marginVertical: 16 },
  descTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  description: { fontSize: 14, color: '#555', lineHeight: 22 },
  bottomBar: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#fff' },
  cartButton: { flex: 1, marginRight: 8, borderColor: '#FF6B35' },
  buyButton: { flex: 1, marginLeft: 8 },
  notFound: { textAlign: 'center', marginTop: 40, color: '#999' },
});
