import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  Share,
  ActivityIndicator,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  Icon,
  Chip,
  Divider,
  FAB,
  Snackbar,
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as api from '@/services/api';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  reviewCount?: number;
  category: string;
  stock?: number;
  discount?: number;
  tags?: string[];
  details?: string;
  specifications?: {
    [key: string]: string;
  };
  seller?: {
    name: string;
    rating: number;
  };
}

export default function ProductDetailScreen() {
  const router = useRouter();
  const { productId } = useLocalSearchParams<{ productId: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadProductDetail();
  }, [productId]);

  const loadProductDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!productId) {
        setError('Product ID not found');
        return;
      }

      const response = await api.getProductById(productId);
      if (response && response.data) {
        setProduct(response.data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load product';
      setError(message);
      console.error('Error loading product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    setSnackbarMessage(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
    setShowSnackbar(true);
    // TODO: Implement add to cart logic
    console.log('Add to cart:', { productId, quantity });
  };

  const handleBuyNow = () => {
    setSnackbarMessage('Chuyển đến thanh toán...');
    setShowSnackbar(true);
    // TODO: Implement buy now logic
    console.log('Buy now:', { productId, quantity });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${product?.name} - ${product?.price.toLocaleString('vi-VN')} ₫\n${product?.description}`,
        title: product?.name,
        url: `product/${productId}`,
      });
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    setSnackbarMessage(
      isFavorite ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích'
    );
    setShowSnackbar(true);
    // TODO: Implement favorite logic
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Sản phẩm không tìm thấy'}</Text>
        <Button mode="contained" onPress={() => router.back()} style={styles.backBtn}>
          Quay lại
        </Button>
      </View>
    );
  }

  const finalPrice =
    product.price * (1 - (product.discount || 0) / 100);
  const originalPrice = product.price;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with back button */}
        <View style={styles.header}>
          <Button icon="arrow-left" onPress={() => router.back()}>Quay lại</Button>
          <Text variant="titleMedium" style={styles.headerTitle}>
            Chi tiết sản phẩm
          </Text>
          <Button icon="share-variant" onPress={handleShare}>Chia sẻ</Button>
        </View>

        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.image }}
            style={styles.productImage}
            resizeMode="cover"
          />
          {product.discount && product.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{product.discount}%</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <Card style={styles.infoCard}>
          <Card.Content>
            {/* Category and Tags */}
            <View style={styles.categoryRow}>
              <Chip>{product.category}</Chip>
              {product.tags && product.tags.slice(0, 2).map((tag) => (
                <Chip key={tag} style={styles.tagChip}>
                  {tag}
                </Chip>
              ))}
            </View>

            {/* Product Name */}
            <Text variant="headlineMedium" style={styles.productName}>
              {product.name}
            </Text>

            {/* Rating */}
            <View style={styles.ratingRow}>
              <View style={styles.ratingStars}>
                <Text style={styles.starIcon}>⭐ {product.rating}</Text>
                {product.reviewCount && (
                  <Text style={styles.reviewCount}>
                    ({product.reviewCount} đánh giá)
                  </Text>
                )}
              </View>
              <Chip
                mode="flat"
                style={styles.stockChip}
                icon={product.stock && product.stock > 0 ? 'check-circle' : 'alert-circle'}
              >
                {product.stock && product.stock > 0
                  ? `Còn ${product.stock}`
                  : 'Hết hàng'}
              </Chip>
            </View>

            <Divider style={styles.divider} />

            {/* Price */}
            <View style={styles.priceContainer}>
              <View>
                {product.discount && product.discount > 0 && (
                  <Text
                    variant="bodyMedium"
                    style={styles.originalPrice}
                  >
                    {originalPrice.toLocaleString('vi-VN')} ₫
                  </Text>
                )}
                <Text variant="displaySmall" style={styles.finalPrice}>
                  {finalPrice.toLocaleString('vi-VN')} ₫
                </Text>
              </View>
              {product.seller && (
                <View style={styles.sellerInfo}>
                  <Text variant="labelMedium">Từ</Text>
                  <Text variant="bodySmall" style={styles.sellerName}>
                    {product.seller.name}
                  </Text>
                  <Text variant="labelSmall">
                    ⭐ {product.seller.rating}
                  </Text>
                </View>
              )}
            </View>

            <Divider style={styles.divider} />

            {/* Description */}
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Mô tả sản phẩm
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              {product.description}
            </Text>

            {product.details && (
              <>
                <Text variant="bodySmall" style={styles.details}>
                  {product.details}
                </Text>
              </>
            )}

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <>
                <Divider style={styles.divider} />
                <Text variant="titleSmall" style={styles.sectionTitle}>
                  Thông số kỹ thuật
                </Text>
                {Object.entries(product.specifications).map(([key, value]) => (
                  <View key={key} style={styles.specItem}>
                    <Text variant="bodySmall" style={styles.specLabel}>
                      {key}
                    </Text>
                    <Text variant="bodySmall" style={styles.specValue}>
                      {value}
                    </Text>
                  </View>
                ))}
              </>
            )}

            <Divider style={styles.divider} />

            {/* Quantity Selector */}
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Số lượng
            </Text>
            <View style={styles.quantitySelector}>
              <Button
                mode="outlined"
                compact
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                −
              </Button>
              <Text variant="bodyLarge" style={styles.quantityText}>
                {quantity}
              </Text>
              <Button
                mode="outlined"
                compact
                onPress={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </View>

            <View style={styles.bottomPadding} />
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <Button
          mode="outlined"
          icon={isFavorite ? 'heart' : 'heart-outline'}
          onPress={handleFavorite}
          style={styles.favoriteBtn}
        >
          {isFavorite ? 'Yêu thích' : 'Thích'}
        </Button>
        <Button
          mode="outlined"
          onPress={handleAddToCart}
          style={styles.addToCartBtn}
        >
          Thêm vào giỏ
        </Button>
        <Button
          mode="contained"
          onPress={handleBuyNow}
          style={styles.buyNowBtn}
        >
          Mua ngay
        </Button>
      </View>

      {/* Snackbar */}
      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={2000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  loadingText: {
    marginTop: 12,
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 16,
    textAlign: 'center',
  },
  backBtn: {
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: '#fff',
    paddingTop: 16,
  },
  productImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  discountBadge: {
    position: 'absolute',
    top: 24,
    right: 16,
    backgroundColor: '#FF6B6B',
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoCard: {
    marginHorizontal: 12,
    marginVertical: 12,
    marginBottom: 80,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  tagChip: {
    backgroundColor: '#e3f2fd',
  },
  productName: {
    fontWeight: '700',
    marginBottom: 12,
    lineHeight: 28,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starIcon: {
    fontSize: 16,
    fontWeight: '600',
  },
  reviewCount: {
    fontSize: 14,
    color: '#999',
  },
  stockChip: {
    backgroundColor: '#c8e6c9',
  },
  divider: {
    marginVertical: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    color: '#999',
    marginBottom: 4,
  },
  finalPrice: {
    color: '#FF6B6B',
    fontWeight: '700',
  },
  sellerInfo: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sellerName: {
    fontWeight: '600',
    marginVertical: 2,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: '600',
    color: '#333',
  },
  description: {
    lineHeight: 22,
    color: '#666',
    marginBottom: 8,
  },
  details: {
    lineHeight: 20,
    color: '#666',
    marginBottom: 8,
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  specLabel: {
    fontWeight: '600',
    color: '#333',
  },
  specValue: {
    color: '#666',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
  },
  quantityText: {
    minWidth: 40,
    textAlign: 'center',
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  favoriteBtn: {
    flex: 0.8,
  },
  addToCartBtn: {
    flex: 1,
  },
  buyNowBtn: {
    flex: 1.2,
  },
});
