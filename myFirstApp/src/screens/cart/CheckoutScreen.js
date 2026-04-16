import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, RadioButton, Divider } from 'react-native-paper';
import useCartStore from '../../store/cartStore';
import useOrderStore from '../../store/orderStore';
import useAuthStore from '../../store/authStore';

export default function CheckoutScreen({ navigation }) {
  const { items, getTotal, clearCart } = useCartStore();
  const placeOrder = useOrderStore(s => s.placeOrder);
  const user = useAuthStore(s => s.user);

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);

  const formatPrice = (price) => price.toLocaleString('vi-VN') + 'đ';
  const total = getTotal();

  const handleCheckout = async () => {
    if (!address.trim()) return Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ giao hàng');
    if (!phone.trim()) return Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
    if (items.length === 0) return Alert.alert('Lỗi', 'Giỏ hàng trống');

    setLoading(true);
    try {
      const order = await placeOrder({
        items: [...items],
        address: address.trim(),
        phone: phone.trim(),
        paymentMethod,
        note: note.trim(),
      });
      await clearCart();
      setLoading(false);
      Alert.alert(
        'Đặt hàng thành công! 🎉',
        `Mã đơn: ${order.id}\nTổng: ${formatPrice(order.total)}\nThanh toán: ${paymentMethod}`,
        [
          { text: 'Xem đơn hàng', onPress: () => navigation.replace('OrderDetail', { orderId: order.id }) },
          { text: 'Về trang chủ', onPress: () => navigation.navigate('MainTabs', { screen: 'Home' }) },
        ]
      );
    } catch (e) {
      setLoading(false);
      Alert.alert('Lỗi', e.message);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Order items summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Đơn hàng ({items.length} món)</Text>
        {items.map(item => (
          <View key={item.product.id} style={styles.orderItem}>
            <Text style={styles.itemName}>{item.product.name} x{item.quantity}</Text>
            <Text style={styles.itemPrice}>{formatPrice(item.product.price * item.quantity)}</Text>
          </View>
        ))}
        <Divider style={styles.divider} />
        <View style={styles.orderItem}>
          <Text style={styles.totalLabel}>Tổng cộng</Text>
          <Text style={styles.totalPrice}>{formatPrice(total)}</Text>
        </View>
      </View>

      {/* Delivery info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
        <TextInput
          label="Địa chỉ giao hàng *"
          value={address}
          onChangeText={setAddress}
          mode="outlined"
          style={styles.input}
          multiline
          numberOfLines={2}
        />
        <TextInput
          label="Số điện thoại *"
          value={phone}
          onChangeText={setPhone}
          mode="outlined"
          keyboardType="phone-pad"
          style={styles.input}
        />
        <TextInput
          label="Ghi chú (tùy chọn)"
          value={note}
          onChangeText={setNote}
          mode="outlined"
          style={styles.input}
          multiline
        />
      </View>

      {/* Payment method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
        <RadioButton.Group onValueChange={setPaymentMethod} value={paymentMethod}>
          <RadioButton.Item label="Thanh toán khi nhận hàng (COD)" value="COD" />
          <RadioButton.Item label="Ví điện tử (MoMo)" value="MOMO" />
          <RadioButton.Item label="Chuyển khoản ngân hàng" value="BANK" />
        </RadioButton.Group>
      </View>

      <Button
        mode="contained"
        onPress={handleCheckout}
        loading={loading}
        disabled={loading}
        style={styles.checkoutButton}
        buttonColor="#FF6B35"
        icon="check-circle"
        contentStyle={styles.checkoutButtonContent}
      >
        Xác nhận đặt hàng - {formatPrice(total)}
      </Button>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  section: { backgroundColor: '#fff', padding: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  orderItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  itemName: { fontSize: 14, color: '#333', flex: 1 },
  itemPrice: { fontSize: 14, fontWeight: '600', color: '#FF6B35' },
  divider: { marginVertical: 8 },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  totalPrice: { fontSize: 18, fontWeight: 'bold', color: '#FF6B35' },
  input: { marginBottom: 12 },
  checkoutButton: { margin: 16, borderRadius: 8 },
  checkoutButtonContent: { paddingVertical: 6 },
});
