import React from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Button, Divider, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useOrderStore, { ORDER_STATUS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../store/orderStore';

const STATUS_ICONS = {
  1: 'clipboard-text',
  2: 'clipboard-check',
  3: 'chef-hat',
  4: 'truck-delivery',
  5: 'check-circle',
  6: 'close-circle',
};

export default function OrderDetailScreen({ route, navigation }) {
  const { orderId } = route.params;
  const { orders, cancelOrder, advanceOrderStatus } = useOrderStore();
  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return (
      <View style={styles.container}><Text style={styles.notFound}>Đơn hàng không tồn tại</Text></View>
    );
  }

  const formatPrice = (price) => price.toLocaleString('vi-VN') + 'đ';
  const formatDate = (ts) => ts ? new Date(ts).toLocaleString('vi-VN') : '-';

  const minutesSinceOrder = (Date.now() - order.createdAt) / (1000 * 60);
  const canCancel = order.status < ORDER_STATUS.DELIVERING && order.status !== ORDER_STATUS.CANCELLED;
  const isDirectCancel = minutesSinceOrder <= 30 || order.status <= ORDER_STATUS.CONFIRMED;

  const handleCancel = () => {
    const message = order.status === ORDER_STATUS.PREPARING
      ? 'Đơn hàng đang được chuẩn bị. Bạn chỉ có thể gửi yêu cầu hủy cho shop.'
      : 'Bạn có chắc muốn hủy đơn hàng?';
    Alert.alert('Hủy đơn hàng', message, [
      { text: 'Không', style: 'cancel' },
      {
        text: order.status === ORDER_STATUS.PREPARING ? 'Gửi yêu cầu' : 'Hủy đơn',
        style: 'destructive',
        onPress: async () => {
          try {
            const result = await cancelOrder(order.id, 'Khách yêu cầu hủy');
            Alert.alert('Thông báo', result.message);
          } catch (e) {
            Alert.alert('Lỗi', e.message);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Order ID and status */}
      <View style={styles.headerCard}>
        <Text style={styles.orderId}>Đơn #{order.id}</Text>
        <Chip
          style={[styles.statusChip, { backgroundColor: ORDER_STATUS_COLORS[order.status] + '20' }]}
          textStyle={{ color: ORDER_STATUS_COLORS[order.status], fontWeight: 'bold' }}
          icon={() => <MaterialCommunityIcons name={STATUS_ICONS[order.status]} size={16} color={ORDER_STATUS_COLORS[order.status]} />}
        >
          {ORDER_STATUS_LABELS[order.status]}
        </Chip>
      </View>

      {/* Status timeline */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trạng thái đơn hàng</Text>
        {[1, 2, 3, 4, 5].map(status => {
          const isActive = order.status >= status;
          const isCurrent = order.status === status;
          const isCancelled = order.status === ORDER_STATUS.CANCELLED;
          return (
            <View key={status} style={styles.timelineItem}>
              <View style={[styles.timelineDot, isActive && !isCancelled ? styles.timelineDotActive : {}, isCurrent && !isCancelled ? styles.timelineDotCurrent : {}]}>
                <MaterialCommunityIcons name={STATUS_ICONS[status]} size={16} color={isActive && !isCancelled ? '#fff' : '#ccc'} />
              </View>
              {status < 5 && <View style={[styles.timelineLine, isActive && !isCancelled && order.status > status ? styles.timelineLineActive : {}]} />}
              <Text style={[styles.timelineLabel, isActive && !isCancelled ? styles.timelineLabelActive : {}]}>
                {ORDER_STATUS_LABELS[status]}
              </Text>
            </View>
          );
        })}
        {order.status === ORDER_STATUS.CANCELLED && (
          <View style={styles.cancelledInfo}>
            <MaterialCommunityIcons name="close-circle" size={20} color="#F44336" />
            <Text style={styles.cancelledText}>Đã hủy: {order.cancelReason}</Text>
          </View>
        )}
      </View>

      {/* Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chi tiết đơn hàng</Text>
        {order.items.map((item, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.product.name} x{item.quantity}</Text>
            <Text style={styles.itemPrice}>{formatPrice(item.product.price * item.quantity)}</Text>
          </View>
        ))}
        <Divider style={{ marginVertical: 8 }} />
        <View style={styles.itemRow}>
          <Text style={styles.totalLabel}>Tổng cộng</Text>
          <Text style={styles.totalPrice}>{formatPrice(order.total)}</Text>
        </View>
      </View>

      {/* Delivery info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
        <Text style={styles.infoText}>📍 {order.address}</Text>
        <Text style={styles.infoText}>📱 {order.phone}</Text>
        <Text style={styles.infoText}>💳 {order.paymentMethod}</Text>
        {order.note ? <Text style={styles.infoText}>📝 {order.note}</Text> : null}
        <Text style={styles.infoText}>🕐 Đặt lúc: {formatDate(order.createdAt)}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {canCancel && (
          <Button
            mode="outlined"
            onPress={handleCancel}
            style={styles.cancelButton}
            textColor="#FF3B30"
            icon="close-circle-outline"
          >
            {order.status === ORDER_STATUS.PREPARING ? 'Gửi yêu cầu hủy' : 'Hủy đơn hàng'}
          </Button>
        )}

        {/* API endpoint advanceOrderStatus(orderId) sẵn sàng cho Flutter admin */}
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  headerCard: { backgroundColor: '#fff', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  statusChip: { height: 30 },
  section: { backgroundColor: '#fff', padding: 16, marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  // Timeline
  timelineItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  timelineDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' },
  timelineDotActive: { backgroundColor: '#4CAF50' },
  timelineDotCurrent: { backgroundColor: '#FF6B35', borderWidth: 2, borderColor: '#FFB74D' },
  timelineLine: { position: 'absolute', left: 15, top: 32, width: 2, height: 12, backgroundColor: '#e0e0e0' },
  timelineLineActive: { backgroundColor: '#4CAF50' },
  timelineLabel: { marginLeft: 12, fontSize: 14, color: '#999' },
  timelineLabelActive: { color: '#333', fontWeight: '600' },
  cancelledInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 8, padding: 10, backgroundColor: '#FFEBEE', borderRadius: 8 },
  cancelledText: { marginLeft: 8, color: '#F44336', fontSize: 13 },
  // Items
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  itemName: { fontSize: 14, color: '#333', flex: 1 },
  itemPrice: { fontSize: 14, fontWeight: '600', color: '#FF6B35' },
  totalLabel: { fontSize: 16, fontWeight: 'bold' },
  totalPrice: { fontSize: 18, fontWeight: 'bold', color: '#FF6B35' },
  // Info
  infoText: { fontSize: 14, color: '#555', marginBottom: 6 },
  // Actions
  actions: { padding: 16 },
  cancelButton: { borderColor: '#FF3B30', borderRadius: 8, marginBottom: 10 },
  notFound: { textAlign: 'center', color: '#999', marginTop: 40 },
});
