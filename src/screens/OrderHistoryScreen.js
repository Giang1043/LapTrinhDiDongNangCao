import React, { useState, useEffect } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import OrderRepository from '../database/repositories/OrderRepository';
import ProductRepository from '../database/repositories/ProductRepository';

const COLORS = {
  primary: '#FF6B35',
  error: '#d32f2f',
  success: '#4CAF50',
  warning: '#FFA726',
  background: '#f5f5f5',
  text: '#333',
  textLight: '#666',
  white: '#fff',
};

const STATUS_COLORS = {
  1: COLORS.warning,  // Mới
  2: COLORS.warning,  // Đã xác nhận
  3: COLORS.primary,  // Đang chuẩn bị
  4: COLORS.primary,  // Đang giao
  5: COLORS.success,  // Hoàn thành
  6: COLORS.error,    // Đã hủy
};

const STATUS_EMOJI = {
  1: '📋', // Mới
  2: '✅', // Đã xác nhận
  3: '👨‍🍳', // Đang chuẩn bị
  4: '🚚', // Đang giao
  5: '🎉', // Hoàn thành
  6: '❌', // Đã hủy
};

/**
 * Order History Screen
 * Display user's order history with auto-update logic
 * Every 30 minutes: orders with status 1 auto-update to status 2
 */
export default function OrderHistoryScreen({ navigation }) {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load and auto-update orders when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      if (currentUser?.id) {
        loadOrders();
      }
    }, [currentUser])
  );

  /**
   * Load orders and check for auto-updates
   * Auto-update orders with status 1 if 30 minutes have passed
   */
  const loadOrders = async () => {
    try {
      setLoading(true);

      if (!currentUser?.id) {
        console.log('No user logged in');
        return;
      }

      // Check and auto-update order statuses
      const updatedOrders = OrderRepository.updateOrderStatuses(currentUser.id);
      if (updatedOrders.length > 0) {
        console.log(`✓ Auto-updated ${updatedOrders.length} orders`);
      }

      // Fetch order history
      const userOrders = OrderRepository.getOrderHistory(currentUser.id);
      setOrders(userOrders);

      console.log('✓ Loaded order history:', userOrders.length);
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      Alert.alert('Lỗi', 'Không thể tải lịch sử đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle cancel order
   * Only allow if status = 1 and within 30 minutes
   */
  const handleCancelOrder = (orderId, status, createdAt) => {
    // Check eligibility
    if (!OrderRepository.canCancelOrder(orderId)) {
      Alert.alert(
        'Không thể hủy',
        'Đơn hàng chỉ có thể hủy trong vòng 30 phút từ khi đặt. Nếu cần trợ giúp, vui lòng liên hệ hỗ trợ.'
      );
      return;
    }

    Alert.alert(
      'Xác nhận hủy đơn',
      'Bạn chắc chắn muốn hủy đơn hàng này?',
      [
        { text: 'Quay lại', style: 'cancel' },
        {
          text: 'Hủy đơn',
          onPress: () => {
            try {
              OrderRepository.cancelOrder(orderId);
              Alert.alert('Thành công', 'Đơn hàng đã được hủy');
              loadOrders(); // Refresh
            } catch (error) {
              console.error('❌ Error cancelling order:', error);
              Alert.alert('Lỗi', 'Không thể hủy đơn hàng');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  /**
   * Handle cancel request (for status 3+)
   */
  const handleRequestCancel = (orderId) => {
    Alert.alert(
      'Yêu cầu hủy đơn',
      'Chúng tôi sẽ liên hệ với bạn sớm để xác nhận yêu cầu hủy. Vui lòng chờ.',
      [{ text: 'OK', onPress: () => {} }]
    );

    console.log(`User requested to cancel order ${orderId}`);
    // In production, send this request to server
  };

  /**
   * Format time remaining until auto-confirm
   */
  const getTimeRemainingText = (orderId) => {
    const remaining = OrderRepository.getTimeUntilAutoConfirm(orderId);
    if (!remaining) return null;

    const minutes = Math.floor(remaining / 60000);
    if (minutes > 0) {
      return `Tự động xác nhận trong ${minutes} phút`;
    }
    return 'Sắp xác nhận...';
  };

  /**
   * Render single order item
   */
  const renderOrderItem = ({ item }) => (
    <Card style={styles.orderCard}>
      {/* Order Header - Status */}
      <View style={[styles.orderHeader, { borderLeftColor: STATUS_COLORS[item.status] }]}>
        <View style={styles.statusInfo}>
          <Text style={styles.statusEmoji}>{STATUS_EMOJI[item.status]}</Text>
          <View style={styles.statusText}>
            <Text style={styles.statusTitle}>
              {OrderRepository.getStatusText(item.status)}
            </Text>
            <Text style={styles.statusTime}>
              {new Date(item.createdAt).toLocaleString('vi-VN')}
            </Text>
            {item.status === 1 && (
              <Text style={styles.autoConfirmText}>
                {getTimeRemainingText(item.id)}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Order Items */}
      <View style={styles.itemsContainer}>
        {item.items && item.items.map((orderItem, index) => {
          const product = ProductRepository.getProductById(orderItem.productId);
          return (
            <View key={index} style={styles.orderItemRow}>
              <View style={styles.itemImageSmall}>
                <Text style={styles.itemImageTextSmall}>
                  {product?.image || '🍽️'}
                </Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {product?.name || 'Sản phẩm'}
                </Text>
                <Text style={styles.itemQuantity}>
                  x{orderItem.quantity}
                </Text>
              </View>
              <Text style={styles.itemPrice}>
                {(orderItem.priceAtOrder * orderItem.quantity).toLocaleString('vi-VN')} đ
              </Text>
            </View>
          );
        })}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Order Footer - Total & Actions */}
      <View style={styles.orderFooter}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tổng tiền:</Text>
          <Text style={styles.totalValue}>
            {item.totalPrice.toLocaleString('vi-VN')} đ
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {/* Button 1: Cancel (only if status 1 and within 30 mins) */}
          {item.status === 1 && OrderRepository.canCancelOrder(item.id) && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleCancelOrder(item.id, item.status, item.createdAt)}
            >
              <Text style={styles.cancelButtonText}>Hủy đơn</Text>
            </TouchableOpacity>
          )}

          {/* Button 2: Request Cancel (if status 3) */}
          {item.status === 3 && (
            <TouchableOpacity
              style={[styles.actionButton, styles.requestCancelButton]}
              onPress={() => handleRequestCancel(item.id)}
            >
              <Text style={styles.requestCancelButtonText}>Yêu cầu hủy</Text>
            </TouchableOpacity>
          )}

          {/* Button 3: View Details */}
          <TouchableOpacity
            style={[styles.actionButton, styles.detailsButton]}
            onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
          >
            <Text style={styles.detailsButtonText}>Chi tiết</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  // Empty state
  if (!loading && orders.length === 0) {
    return (
      <View style={styles.container}>
        <Appbar.Header style={styles.appbar}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Lịch sử mua hàng" />
        </Appbar.Header>

        <View style={styles.emptyContent}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyText}>Chưa có đơn hàng</Text>
          <Text style={styles.emptySubtext}>Bắt đầu mua sắm ngay thôi</Text>

          <Button
            mode="contained"
            style={styles.shoppingButton}
            onPress={() => navigation.navigate('Home')}
          >
            Về trang chủ
          </Button>
        </View>
      </View>
    );
  }

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Orders list
  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content
          title="Lịch sử mua hàng"
          subtitle={`${orders.length} đơn hàng`}
        />
      </Appbar.Header>

      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => String(item.id)}
        style={styles.ordersList}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          loadOrders().finally(() => setRefreshing(false));
        }}
      />
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

  // Empty state
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 24,
    textAlign: 'center',
  },
  shoppingButton: {
    backgroundColor: COLORS.primary,
    width: '100%',
  },

  // Orders list
  ordersList: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },

  // Order card
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },

  // Order header with status
  orderHeader: {
    backgroundColor: '#fafafa',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  statusEmoji: {
    fontSize: 28,
  },
  statusText: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  statusTime: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  autoConfirmText: {
    fontSize: 11,
    color: COLORS.warning,
    fontWeight: '500',
    marginTop: 2,
  },
  orderId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },

  // Order items
  itemsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemImageSmall: {
    width: 50,
    height: 50,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImageTextSmall: {
    fontSize: 24,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  itemQuantity: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginHorizontal: 16,
  },

  // Order footer
  orderFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primary,
  },

  // Action buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  cancelButton: {
    backgroundColor: COLORS.error + '20',
    borderColor: COLORS.error,
    borderWidth: 1,
  },
  cancelButtonText: {
    color: COLORS.error,
    fontWeight: '600',
    fontSize: 12,
  },
  requestCancelButton: {
    backgroundColor: COLORS.warning + '20',
    borderColor: COLORS.warning,
    borderWidth: 1,
  },
  requestCancelButtonText: {
    color: COLORS.warning,
    fontWeight: '600',
    fontSize: 12,
  },
  detailsButton: {
    backgroundColor: COLORS.primary,
  },
  detailsButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 12,
  },
});
