import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, Avatar, Divider, ActivityIndicator } from 'react-native-paper';
import * as api from '@/services/api';

interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  avatar?: string;
  verified?: boolean;
}

interface ReviewListProps {
  productId: string;
  maxItems?: number;
}

export default function ReviewList({ productId, maxItems = 5 }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await api.getProductReviews(productId, 1, maxItems);
      if (response && response.data) {
        setReviews(response.data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi tải đánh giá';
      setError(message);
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderReviewItem = (review: Review) => (
    <View key={review.id} style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <Avatar.Image
          size={40}
          source={{
            uri: review.avatar || 'https://via.placeholder.com/40',
          }}
        />
        <View style={styles.reviewInfo}>
          <View style={styles.authorRow}>
            <Text variant="bodyMedium" style={styles.author}>
              {review.author}
            </Text>
            {review.verified && (
              <Text variant="labelSmall" style={styles.verified}>
                ✓ Đã mua
              </Text>
            )}
          </View>
          <View style={styles.ratingRow}>
            <Text style={styles.rating}>
              {'⭐'.repeat(review.rating)}
            </Text>
            <Text variant="labelSmall" style={styles.date}>
              {review.date}
            </Text>
          </View>
        </View>
      </View>
      <Text variant="bodySmall" style={styles.comment}>
        {review.comment}
      </Text>
      <Divider style={styles.reviewDivider} />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="bodySmall" style={styles.errorText}>
          {error}
        </Text>
      </View>
    );
  }

  if (reviews.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="bodySmall" style={styles.noReviewsText}>
          Chưa có đánh giá nào
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {reviews.map((review) => renderReviewItem(review))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  centerContainer: {
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewItem: {
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  reviewInfo: {
    flex: 1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  author: {
    fontWeight: '600',
  },
  verified: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rating: {
    fontSize: 14,
  },
  date: {
    color: '#999',
  },
  comment: {
    lineHeight: 20,
    color: '#666',
    marginBottom: 8,
  },
  reviewDivider: {
    marginTop: 12,
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
  },
  noReviewsText: {
    color: '#999',
    textAlign: 'center',
  },
});
