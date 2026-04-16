import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useOrderStore, { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../store/orderStore';

export default function OrdersScreen({ navigation }) {
  const { orders, loadOrders } = useOrderStore();

  useEffect(() => { loadOrders(); }, []);

  const formatPrice = (price) => price.toLocaleString('vi-VN') + 'đ';
  const formatDate = (ts) => new Date(ts).toLocaleString('vi-VN');

  const renderOrder = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>#{item.id}</Text>
        <Chip
          style={[styles.statusChip, { backgroundColor: ORDER_STATUS_COLORS[item.status] + '20' }]}
          textStyle={[styles.statusText, { color: ORDER_STATUS_COLORS[item.status] }]}
        >
          {ORDER_STATUS_LABELS[item.status]}
        </Chip>
      </View>
      <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
      <Text style={styles.orderItems}>
        {item.items.map(i => `${i.product.name} x${i.quantity}`).join(', ')}
      </Text>
      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>{formatPrice(item.total)}</Text>
        <Text style={styles.orderPayment}>{item.paymentMethod}</Text>
      </View>
      {item.cancelRequested && !item.cancelledAt && (
        <View style={styles.cancelRequestBadge}>
          <MaterialCommunityIcons name="alert-circle" size={14} color="#FF9800" />
          <Text style={styles.cancelRequestText}>Đã gửi yêu cầu hủy</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={80} color="#ddd" />
            <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  list: { padding: 12 },
  orderCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, elevation: 2 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  statusChip: { height: 28 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  orderDate: { fontSize: 12, color: '#999', marginTop: 4 },
  orderItems: { fontSize: 13, color: '#555', marginTop: 8, numberOfLines: 2 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  orderTotal: { fontSize: 16, fontWeight: 'bold', color: '#FF6B35' },
  orderPayment: { fontSize: 13, color: '#666', backgroundColor: '#f0f0f0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  cancelRequestBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: '#FFF3E0', padding: 6, borderRadius: 6 },
  cancelRequestText: { fontSize: 12, color: '#FF9800', marginLeft: 4 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 16, color: '#999', marginTop: 12 },
});
