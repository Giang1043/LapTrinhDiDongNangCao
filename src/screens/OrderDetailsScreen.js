import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Appbar, Card, Button, Divider } from 'react-native-paper';
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
 * Order Details Screen
 * Display detailed order information with status tracking and action buttons
 */
export default function OrderDetailsScreen({ route, navigation }) {
  const { orderId } = route.params;
  const { currentUser } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Load order details when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      loadOrderDetails();
    }, [orderId])
  );

  /**
   * Load order details and set up auto-update timer
   */
  const loadOrderDetails = async () => {
    try {
      setLoading(true);

      // Check and auto-update order status
      OrderRepository.updateOrderStatuses(currentUser.id);

      // Fetch order details
      const orderData = OrderRepository.getOrderById(orderId);
      setOrder(orderData);

      // Update time remaining
      const remaining = OrderRepository.getTimeUntilAutoConfirm(orderId);
      setTimeRemaining(remaining);

      console.log('✓ Loaded order details:', orderId);
    } catch (error) {
      console.error('❌ Error loading order details:', error);
      Alert.alert('Lỗi', 'Không thể tải chi tiết đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle cancel order
   * Only allow if status = 1 and within 30 minutes
   */
  const handleCancelOrder = () => {
    if (!OrderRepository.canCancelOrder(orderId)) {
      Alert.alert(
        'Không thể hủy',
        'Đơn hàng chỉ có thể hủy trong vòng 30 phút từ khi đặt. Nếu cần trợ giúp, vui lòng liên hệ hỗ trợ.'
      );
      return;
    }

    Alert.alert(
      'Xác nhận hủy đơn',
      'Bạn chắc chắn muốn hủy đơn hàng này? Tiền sẽ được hoàn lại vào tài khoản của bạn.',
      [
        { text: 'Quay lại', style: 'cancel' },
        {
          text: 'Hủy đơn',
          onPress: async () => {
            try {
              setUpdating(true);
              OrderRepository.cancelOrder(orderId);
              Alert.alert('Thành công', 'Đơn hàng đã được hủy');
              // Reload order details
              await loadOrderDetails();
            } catch (error) {
              console.error('❌ Error cancelling order:', error);
              Alert.alert('Lỗi', 'Không thể hủy đơn hàng');
            } finally {
              setUpdating(false);
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
  const handleRequestCancel = () => {
    Alert.alert(
      'Yêu cầu hủy đơn',
      'Chúng tôi sẽ liên hệ với bạn sớm để xác nhận yêu cầu hủy đơn hàng. Vui lòng chờ tin nhắn từ shop.',
      [
        {
          text: 'Gửi yêu cầu',
          onPress: () => {
            // In production, send this request to server
            console.log(`User requested to cancel order ${orderId}`);
            Alert.alert('Thành công', 'Yêu cầu hủy đơn đã được gửi. Shop sẽ xem xét và liên hệ với bạn.');
          },
        },
        { text: 'Hủy bỏ', style: 'cancel' },
      ]
    );
  };

  /**
   * Format time remaining until auto-confirm
   */
  const getTimeRemainingText = () => {
    if (!timeRemaining) return null;
    const minutes = Math.floor(timeRemaining / 60000);
    if (minutes > 0) {
      return `Tự động xác nhận trong ${minutes} phút`;
    }
    return 'Sắp xác nhận...';
  };

  /**
   * Render status timeline
   */
  const renderStatusTimeline = () => {
    const statuses = [1, 2, 3, 4, 5];
    const currentStatus = order?.status || 0;

    return (
      <View style={styles.timelineContainer}>
        <Text style={styles.timelineTitle}>Tiến trình đơn hàng</Text>
        <View style={styles.timeline}>
          {statuses.map((status, index) => {
            const isCompleted = currentStatus >= status;
            const isActive = currentStatus === status;

            return (
              <View key={status} style={styles.timelineItemWrapper}>
                {/* Circle */}
                <View
                  style={[
                    styles.timelineCircle,
                    isCompleted && { backgroundColor: STATUS_COLORS[status] },
                    isActive && { borderWidth: 2, borderColor: STATUS_COLORS[status] },
                  ]}
                >
                  {isCompleted && (
                    <Text style={styles.statusEmoji}>{STATUS_EMOJI[status]}</Text>
                  )}
                </View>

                {/* Label */}
                <Text
                  style={[
                    styles.timelineLabel,
                    isCompleted && { color: COLORS.text, fontWeight: '600' },
                  ]}
                >
                  {OrderRepository.getStatusText(status)}
                </Text>

                {/* Connector line (between items) */}
                {index < statuses.length - 1 && (
                  <View
                    style={[
                      styles.timelineConnector,
                      isCompleted && { backgroundColor: STATUS_COLORS[status] },
                    ]}
                  />
                )}
              </View>
            );
          })}

          {/* Cancelled state (if applicable) */}
          {currentStatus === 6 && (
            <View style={styles.cancelledContainer}>
              <Text style={styles.cancelledText}>❌ Đơn hàng đã bị hủy</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  /**
   * Render order items list
   */
  const renderOrderItems = () => {
    if (!order?.items || order.items.length === 0) {
      return <Text style={styles.noItems}>Không có sản phẩm</Text>;
    }

    return (
      <View>
        <Text style={styles.sectionTitle}>Sản phẩm đã đặt</Text>
        {order.items.map((item, index) => {
          const product = ProductRepository.getProductById(item.productId);
          const itemTotal = item.priceAtOrder * item.quantity;

          return (
            <Card key={index} style={styles.itemCard}>
              <View style={styles.itemRowContainer}>
                {/* Product Image/Emoji */}
                <View style={styles.itemImageLarge}>
                  <Text style={styles.itemImageTextLarge}>
                    {product?.image || '🍽️'}
                  </Text>
                </View>

                {/* Product Info */}
                <View style={styles.itemDetailsLarge}>
                  <Text style={styles.itemNameLarge} numberOfLines={2}>
                    {product?.name || 'Sản phẩm'}
                  </Text>
                  <Text style={styles.itemDescLarge}>
                    Giá: {item.priceAtOrder.toLocaleString('vi-VN')} đ
                  </Text>
                  <Text style={styles.itemDescLarge}>
                    Số lượng: {item.quantity}
                  </Text>
                  <Text style={styles.itemTotalLarge}>
                    Tổng: {itemTotal.toLocaleString('vi-VN')} đ
                  </Text>
                </View>
              </View>
            </Card>
          );
        })}
      </View>
    );
  };

  /**
   * Render order summary
   */
  const renderOrderSummary = () => {
    return (
      <Card style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Mã đơn hàng:</Text>
          <Text style={styles.summaryValue}>#{order?.id}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Đặt lúc:</Text>
          <Text style={styles.summaryValue}>
            {new Date(order?.createdAt).toLocaleString('vi-VN')}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Địa chỉ giao:</Text>
          <Text style={styles.summaryValue}>{order?.deliveryAddress}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Phương thức thanh toán:</Text>
          <Text style={styles.summaryValue}>
            {order?.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : order?.paymentMethod}
          </Text>
        </View>

        {order?.notes && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Ghi chú:</Text>
            <Text style={styles.summaryValue}>{order.notes}</Text>
          </View>
        )}

        <Divider style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tổng tiền:</Text>
          <Text style={styles.totalValue}>
            {order?.totalPrice.toLocaleString('vi-VN')} đ
          </Text>
        </View>
      </Card>
    );
  };

  /**
   * Render action buttons
   */
  const renderActionButtons = () => {
    if (loading || !order) return null;

    const canCancel = OrderRepository.canCancelOrder(orderId);
    const shouldShowRequestCancel = order.status === 3;

    if (order.status === 6) {
      // Cancelled order - show go back button only
      return (
        <View style={styles.actionContainer}>
          <Button
            mode="contained"
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            Quay lại
          </Button>
        </View>
      );
    }

    return (
      <View style={styles.actionContainer}>
        {canCancel && (
          <Button
            mode="contained"
            style={[styles.actionButton, styles.cancelButtonStyle]}
            loading={updating}
            disabled={updating}
            onPress={handleCancelOrder}
          >
            Hủy đơn hàng
          </Button>
        )}

        {shouldShowRequestCancel && (
          <Button
            mode="outlined"
            style={[styles.actionButton, styles.requestCancelButtonStyle]}
            onPress={handleRequestCancel}
          >
            Yêu cầu hủy
          </Button>
        )}

        {!canCancel && !shouldShowRequestCancel && (
          <Button
            mode="contained"
            style={styles.actionButton}
            onPress={() => navigation.goBack()}
          >
            Quay lại
          </Button>
        )}
      </View>
    );
  };

  // Loading state
  if (loading || !order) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Appbar.Header style={styles.appbar}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Chi tiết đơn hàng" />
        </Appbar.Header>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Main view
  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={`Đơn hàng #${order.id}`} />
      </Appbar.Header>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Header */}
        <View style={[styles.statusHeader, { borderLeftColor: STATUS_COLORS[order.status] }]}>
          <Text style={styles.statusEmoji}>{STATUS_EMOJI[order.status]}</Text>
          <View style={styles.statusHeaderText}>
            <Text style={styles.statusTitle}>
              {OrderRepository.getStatusText(order.status)}
            </Text>
            {order.status === 1 && (
              <Text style={styles.autoConfirmText}>
                {getTimeRemainingText()}
              </Text>
            )}
          </View>
        </View>

        {/* Status Timeline */}
        {renderStatusTimeline()}

        {/* Order Items */}
        {renderOrderItems()}

        {/* Order Summary */}
        {renderOrderSummary()}

        {/* Action Buttons */}
        {renderActionButtons()}
      </ScrollView>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },

  // Status Header
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    elevation: 2,
  },
  statusEmoji: {
    fontSize: 40,
    marginRight: 12,
  },
  statusHeaderText: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  autoConfirmText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Timeline
  timelineContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  timeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  timelineItemWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  timelineCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.textLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    textAlign: 'center',
    fontWeight: '500',
  },
  timelineConnector: {
    position: 'absolute',
    height: 2,
    width: '100%',
    left: '50%',
    top: 20,
    backgroundColor: COLORS.textLight,
  },
  cancelledContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#ffe0e0',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelledText: {
    color: COLORS.error,
    fontWeight: 'bold',
    fontSize: 14,
  },

  // Items
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
    marginTop: 12,
  },
  noItems: {
    color: COLORS.textLight,
    textAlign: 'center',
    fontSize: 14,
  },
  itemCard: {
    marginBottom: 12,
    elevation: 1,
  },
  itemRowContainer: {
    flexDirection: 'row',
    padding: 12,
  },
  itemImageLarge: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemImageTextLarge: {
    fontSize: 32,
  },
  itemDetailsLarge: {
    flex: 1,
  },
  itemNameLarge: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  itemDescLarge: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  itemTotalLarge: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 4,
  },

  // Summary
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },

  // Actions
  actionContainer: {
    gap: 10,
    marginTop: 12,
  },
  actionButton: {
    paddingVertical: 8,
  },
  cancelButtonStyle: {
    backgroundColor: COLORS.error,
  },
  requestCancelButtonStyle: {
    borderColor: COLORS.warning,
    borderWidth: 2,
  },
  backButton: {
    marginTop: 8,
  },
});
