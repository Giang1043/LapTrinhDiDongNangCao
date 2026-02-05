import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const itemWidth = (width - 48) / 2; // 48 = padding left + padding right + gap between items

const ProductItemGrid = ({ item }) => (
  <TouchableOpacity style={styles.productItem} activeOpacity={0.8}>
    <View style={styles.productImageContainer}>
      <Text style={styles.productImage}>{item.image}</Text>
      <View style={styles.discountBadge}>
        <Text style={styles.discountText}>{item.discount}%</Text>
      </View>
    </View>
    <Text style={styles.productName} numberOfLines={2}>
      {item.name}
    </Text>
    <Text style={styles.category}>{item.category}</Text>
    <View style={styles.priceContainer}>
      <Text style={styles.price}>{(item.price / 1000000).toFixed(1)}M</Text>
    </View>
    <View style={styles.originalPriceContainer}>
      <Text style={styles.originalPrice}>
        {(item.originalPrice / 1000000).toFixed(1)}M
      </Text>
    </View>
  </TouchableOpacity>
);

export const DiscountedProductsGrid = ({ data, loading }) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>💰 Ưu đãi & Khuyến mãi</Text>
      <FlatList
        data={data}
        renderItem={({ item }) => <ProductItemGrid item={item} />}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        scrollEnabled={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    marginHorizontal: 16,
    color: '#000',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productItem: {
    width: itemWidth,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  productImageContainer: {
    width: '100%',
    height: 110,
    backgroundColor: '#FFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  productImage: {
    fontSize: 44,
  },
  discountBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  productName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
    minHeight: 28,
  },
  category: {
    fontSize: 10,
    color: '#999',
    marginBottom: 8,
  },
  priceContainer: {
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF3B30',
  },
  originalPriceContainer: {
    marginBottom: 0,
  },
  originalPrice: {
    fontSize: 11,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
