import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';

export interface ProductCardDetailProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount?: number;
  category: string;
  discount?: number;
  onPress: () => void;
}

export default function ProductCardDetail({
  id,
  name,
  price,
  originalPrice,
  image,
  rating,
  reviewCount,
  category,
  discount,
  onPress,
}: ProductCardDetailProps) {
  return (
    <Card
      style={styles.card}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: image }}
          style={styles.image}
          resizeMode="cover"
        />
        {discount && discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discount}%</Text>
          </View>
        )}
      </View>

      <Card.Content style={styles.content}>
        <View style={styles.categoryRow}>
          <Chip style={styles.categoryChip}>
            {category}
          </Chip>
          {discount && discount > 0 && (
            <Chip style={styles.hotChip}>
              🔥 Hot
            </Chip>
          )}
        </View>

        <Text
          variant="titleMedium"
          numberOfLines={2}
          style={styles.name}
        >
          {name}
        </Text>

        <View style={styles.ratingRow}>
          <Text variant="labelSmall">⭐ {rating}</Text>
          {reviewCount && (
            <Text variant="labelSmall" style={styles.reviewCount}>
              ({reviewCount})
            </Text>
          )}
        </View>

        <View style={styles.priceRow}>
          {originalPrice && (
            <Text
              variant="labelSmall"
              style={styles.originalPrice}
            >
              {originalPrice.toLocaleString('vi-VN')} ₫
            </Text>
          )}
          <Text variant="labelLarge" style={styles.price}>
            {price.toLocaleString('vi-VN')} ₫
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF6B6B',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  discountText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  content: {
    paddingTop: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  categoryChip: {
    height: 24,
  },
  hotChip: {
    height: 24,
    backgroundColor: '#ffebee',
  },
  name: {
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 20,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  reviewCount: {
    color: '#999',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  price: {
    color: '#FF6B6B',
    fontWeight: '700',
  },
});
