import React, { useState, useEffect, useFocusEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Appbar, Card, Button } from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';
import CartRepository from '../database/repositories/CartRepository';
import ProductRepository from '../database/repositories/ProductRepository';
import { useFocusEffect as useNavFocusEffect } from '@react-navigation/native';

const COLORS = {
  primary: '#FF6B35',
  error: '#d32f2f',
  success: '#4CAF50',
  background: '#f5f5f5',
  text: '#333',
  textLight: '#666',
  white: '#fff',
};

export default function CartScreen({ navigation }) {
  const { currentUser } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // Reload cart when screen is focused
  useNavFocusEffect(
    React.useCallback(() => {
      if (currentUser) {
        loadCartItems();
      }
    }, [currentUser])
  );

  const loadCartItems = async () => {
    try {
      setLoading(true);

      if (!currentUser?.id) {
        console.log('No user logged in');
        return;
      }

      // Get cart items
      const items = CartRepository.getCartItems(currentUser.id);

      // Enrich with product data
      const enrichedItems = items.map((cartItem) => {
        const product = ProductRepository.getProductById(cartItem.productId);
        return {
          ...cartItem,
          product,
        };
      });

      setCartItems(enrichedItems);

      // Calculate total
      const cartTotal = enrichedItems.reduce((sum, item) => {
        const price = item.product?.price || 0;
        const discount = item.product?.discount || 0;
        const discountedPrice = price - (price * discount) / 100;
        return sum + discountedPrice * item.quantity;
      }, 0);

      setTotal(cartTotal);
    } catch (error) {
      console.error('❌ Error loading cart:', error);
      Alert.alert('Lỗi', 'Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        CartRepository.removeFromCart(cartItemId);
      } else {
        CartRepository.updateCartItem(cartItemId, newQuantity);
      }

      // Reload cart
      await loadCartItems();
    } catch (error) {
      console.error('❌ Error updating cart:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật giỏ hàng');
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      CartRepository.removeFromCart(cartItemId);
      await loadCartItems();
      Alert.alert('Thành công', 'Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (error) {
      console.error('❌ Error removing item:', error);
      Alert.alert('Lỗi', 'Không thể xóa sản phẩm');
    }
  };

  const handleClearCart = async () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa tất cả sản phẩm?',
      [
        { text: 'Hủy', onPress: () => {}, style: 'cancel' },
        {
          text: 'Xóa',
          onPress: async () => {
            try {
              CartRepository.clearCart(currentUser.id);
              await loadCartItems();
              Alert.alert('Thành công', 'Đã xóa tất cả sản phẩm');
            } catch (error) {
              console.error('❌ Error clearing cart:', error);
              Alert.alert('Lỗi', 'Không thể xóa giỏ hàng');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Vui lòng thêm sản phẩm trước khi thanh toán');
      return;
    }

    navigation.navigate('Checkout', { cartItems, total });
  };

  const renderCartItem = ({ item }) => (
    <Card style={styles.cartCard}>
      <View style={styles.cartItemContent}>
        <View style={styles.itemImage}>
          <Text style={styles.itemImageText}>{item.product?.image || '🍽️'}</Text>
        </View>

        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.product?.name}</Text>
          <Text style={styles.itemPrice}>
            {((item.product?.price || 0) - ((item.product?.price || 0) * (item.product?.discount || 0)) / 100).toLocaleString('vi-VN')} đ
          </Text>

          <View style={styles.quantityControl}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.quantityText}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.itemActions}>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveItem(item.id)}
          >
            <Text style={styles.removeButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <Appbar.Header style={styles.appbar}>
          <Appbar.Content title="Giỏ hàng" />
        </Appbar.Header>

        <View style={styles.emptyContent}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyText}>Giỏ hàng của bạn trống</Text>
          <Text style={styles.subText}>Hãy thêm sản phẩm vào giỏ hàng</Text>

          <Button
            mode="contained"
            style={styles.continueButton}
            onPress={() => navigation.goBack()}
          >
            Tiếp tục mua sắm
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title={`Giỏ hàng (${cartItems.length} sản phẩm)`} />
      </Appbar.Header>

      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => String(item.id)}
        style={styles.cartList}
        contentContainerStyle={styles.listContent}
      />

      {/* Summary Footer */}
      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tổng tiền:</Text>
          <Text style={styles.summaryValue}>
            {total.toLocaleString('vi-VN')} đ
          </Text>
        </View>

        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearCart}
        >
          <Text style={styles.clearButtonText}>Xóa tất cả</Text>
        </TouchableOpacity>

        <Button
          mode="contained"
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          Thanh toán
        </Button>
      </View>
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
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 24,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  cartList: {
    flex: 1,
  },
  listContent: {
    padding: 12,
  },
  cartCard: {
    marginBottom: 12,
    elevation: 2,
    backgroundColor: COLORS.white,
  },
  cartItemContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemImageText: {
    fontSize: 32,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 6,
    overflow: 'hidden',
    width: 90,
  },
  quantityButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  quantityText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
    color: COLORS.text,
  },
  itemActions: {
    marginLeft: 8,
  },
  removeButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 6,
  },
  removeButtonText: {
    fontSize: 18,
  },
  footer: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  clearButton: {
    paddingVertical: 10,
    marginBottom: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '600',
  },
  checkoutButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
  },
});
