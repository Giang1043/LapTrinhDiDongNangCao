import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, Image, Alert } from 'react-native';
import { Text, Button, IconButton, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useCartStore from '../../store/cartStore';

export default function CartScreen({ navigation }) {
  const { items, updateQuantity, removeFromCart, getTotal, loadCart } = useCartStore();

  useEffect(() => { loadCart(); }, []);

  const formatPrice = (price) => price.toLocaleString('vi-VN') + 'đ';
  const total = getTotal();

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.product.image }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
        <Text style={styles.itemShop}>{item.product.shop}</Text>
        <Text style={styles.itemPrice}>{formatPrice(item.product.price)}</Text>
        <View style={styles.quantityRow}>
          <IconButton icon="minus-circle-outline" size={24} onPress={() => updateQuantity(item.product.id, item.quantity - 1)} iconColor="#FF6B35" />
          <Text style={styles.quantity}>{item.quantity}</Text>
          <IconButton icon="plus-circle-outline" size={24} onPress={() => updateQuantity(item.product.id, item.quantity + 1)} iconColor="#FF6B35" />
          <View style={{ flex: 1 }} />
          <IconButton icon="delete-outline" size={22} onPress={() => {
            Alert.alert('Xóa', `Xóa "${item.product.name}" khỏi giỏ hàng?`, [
              { text: 'Hủy', style: 'cancel' },
              { text: 'Xóa', onPress: () => removeFromCart(item.product.id), style: 'destructive' },
            ]);
          }} iconColor="#FF3B30" />
        </View>
      </View>
    </View>
  );

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="cart-outline" size={80} color="#ddd" />
        <Text style={styles.emptyText}>Giỏ hàng trống</Text>
        <Button mode="contained" onPress={() => navigation.navigate('Home')} style={styles.shopButton} buttonColor="#FF6B35">
          Mua sắm ngay
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.product.id}
        ItemSeparatorComponent={() => <Divider />}
        contentContainerStyle={styles.list}
      />
      <View style={styles.bottomBar}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tổng cộng ({items.reduce((s, i) => s + i.quantity, 0)} món):</Text>
          <Text style={styles.totalPrice}>{formatPrice(total)}</Text>
        </View>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Checkout')}
          style={styles.checkoutButton}
          buttonColor="#FF6B35"
          icon="cart-check"
        >
          Thanh toán
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  list: { padding: 12 },
  cartItem: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 10, marginBottom: 8 },
  itemImage: { width: 80, height: 80, borderRadius: 8 },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#333' },
  itemShop: { fontSize: 12, color: '#999', marginTop: 2 },
  itemPrice: { fontSize: 15, fontWeight: 'bold', color: '#FF6B35', marginTop: 4 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  quantity: { fontSize: 16, fontWeight: 'bold', minWidth: 28, textAlign: 'center' },
  bottomBar: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  totalLabel: { fontSize: 15, color: '#333' },
  totalPrice: { fontSize: 20, fontWeight: 'bold', color: '#FF6B35' },
  checkoutButton: { borderRadius: 8 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  emptyText: { fontSize: 16, color: '#999', marginTop: 12, marginBottom: 20 },
  shopButton: { borderRadius: 8 },
});
