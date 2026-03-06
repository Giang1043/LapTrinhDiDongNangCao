import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Text, Appbar, Button, Card } from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';
import ProductRepository from '../database/repositories/ProductRepository';
import CategoryRepository from '../database/repositories/CategoryRepository';
import CartRepository from '../database/repositories/CartRepository';

const COLORS = {
  primary: '#FF6B35',
  success: '#4CAF50',
  error: '#d32f2f',
  background: '#f5f5f5',
  text: '#333',
  textLight: '#666',
  white: '#fff',
};

export default function ProductDetailsScreen({ route, navigation }) {
  const { productId } = route.params;
  const { currentUser } = useAuth();
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    loadProductDetails();
  }, [productId]);

  const loadProductDetails = async () => {
    try {
      setLoading(true);

      // Lấy chi tiết sản phẩm từ Realm
      const productData = ProductRepository.getProductById(productId);
      if (!productData) {
        Alert.alert('Lỗi', 'Không tìm thấy sản phẩm');
        navigation.goBack();
        return;
      }

      setProduct(productData);

      // Lấy danh mục sản phẩm
      if (productData.categoryId) {
        const categoryData = CategoryRepository.getCategoryById(productData.categoryId);
        setCategory(categoryData);
      }
    } catch (error) {
      console.error('❌ Error loading product details:', error);
      Alert.alert('Lỗi', 'Không thể tải chi tiết sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!currentUser) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }

    try {
      setAddingToCart(true);

      // Thêm vào giỏ hàng (CartRepository.addToCart nhận object)
      CartRepository.addToCart({
        userId: currentUser.id,
        productId: productId,
        quantity: quantity,
      });

      Alert.alert('Thành công', `Đã thêm ${quantity} sản phẩm vào giỏ hàng`, [
        { text: 'Tiếp tục mua', onPress: () => navigation.goBack() },
        {
          text: 'Xem giỏ hàng',
          onPress: () => {
            navigation.pop();
            navigation.navigate('Cart');
          },
        },
      ]);
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      Alert.alert('Lỗi', 'Không thể thêm vào giỏ hàng');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Appbar.Header style={styles.appbar}>
          <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
          <Appbar.Content title="Chi tiết sản phẩm" titleStyle={{ color: '#fff' }} />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <Appbar.Header style={styles.appbar}>
          <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
          <Appbar.Content title="Chi tiết sản phẩm" titleStyle={{ color: '#fff' }} />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không tìm thấy sản phẩm</Text>
        </View>
      </View>
    );
  }

  // Tính giá sau khi giảm
  const discountedPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
        <Appbar.Content title="Chi tiết sản phẩm" titleStyle={{ color: '#fff' }} />
      </Appbar.Header>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hình ảnh sản phẩm */}
        <View style={styles.imageContainer}>
          {product.image ? (
            <Image
              source={{ uri: product.image }}
              style={styles.productImage}
              defaultSource={require('../assets/default-product.png')}
            />
          ) : (
            <View style={[styles.productImage, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>Không có hình ảnh</Text>
            </View>
          )}

          {/* Badge giảm giá */}
          {product.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{product.discount}%</Text>
            </View>
          )}
        </View>

        {/* Thông tin cơ bản */}
        <View style={styles.infoSection}>
          {category && (
            <Text style={styles.category}>{category.name}</Text>
          )}
          <Text style={styles.productName}>{product.name}</Text>

          {/* Đánh giá */}
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {product.rating || 0}</Text>
            <Text style={styles.stock}>
              {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
            </Text>
          </View>

          {/* Giá */}
          <View style={styles.priceContainer}>
            {product.discount > 0 ? (
              <>
                <Text style={styles.originalPrice}>
                  {product.price.toLocaleString('vi-VN')}₫
                </Text>
                <Text style={styles.discountedPrice}>
                  {Math.round(discountedPrice).toLocaleString('vi-VN')}₫
                </Text>
              </>
            ) : (
              <Text style={styles.discountedPrice}>
                {product.price.toLocaleString('vi-VN')}₫
              </Text>
            )}
          </View>
        </View>

        {/* Mô tả sản phẩm */}
        <Card style={styles.descriptionCard}>
          <Card.Content>
            <Text style={styles.descriptionTitle}>Mô tả sản phẩm</Text>
            <Text style={styles.description}>
              {product.description || 'Không có mô tả cho sản phẩm này'}
            </Text>
          </Card.Content>
        </Card>

        {/* Thông tin chi tiết */}
        <Card style={styles.detailsCard}>
          <Card.Content>
            <Text style={styles.detailsTitle}>Thông tin chi tiết</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>ID sản phẩm:</Text>
              <Text style={styles.detailValue}>{product.id}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Danh mục:</Text>
              <Text style={styles.detailValue}>{category?.name || 'N/A'}</Text>
            </View>
            {product.discount > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Chiết khấu:</Text>
                <Text style={styles.detailValue}>{product.discount}%</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tồn kho:</Text>
              <Text style={styles.detailValue}>{product.stock} sản phẩm</Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Footer với nút mua */}
      <View style={styles.footer}>
        {/* Chọn số lượng */}
        <View style={styles.quantitySelector}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Text style={styles.quantityButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.quantityValue}>{quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(quantity + 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Nút thêm vào giỏ */}
        <Button
          mode="contained"
          style={styles.addCartButton}
          contentStyle={styles.addCartButtonContent}
          onPress={handleAddToCart}
          loading={addingToCart}
          disabled={addingToCart || product.stock === 0}
        >
          {product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  appbar: {
    backgroundColor: COLORS.primary,
    elevation: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  imageContainer: {
    position: 'relative',
    height: 300,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.background,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  placeholderText: {
    color: COLORS.textLight,
    fontSize: 14,
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.error,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  discountText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  infoSection: {
    marginBottom: 16,
  },
  category: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 16,
    color: COLORS.text,
  },
  stock: {
    fontSize: 13,
    color: COLORS.success,
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  originalPrice: {
    fontSize: 14,
    color: COLORS.textLight,
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  descriptionCard: {
    marginBottom: 12,
    backgroundColor: COLORS.background,
    elevation: 0,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  detailsCard: {
    marginBottom: 100,
    backgroundColor: COLORS.background,
    elevation: 0,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  quantityValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    minWidth: 30,
    textAlign: 'center',
  },
  addCartButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  addCartButtonContent: {
    paddingVertical: 8,
  },
});
