import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Appbar } from 'react-native-paper';
import ProductRepository from '../database/repositories/ProductRepository';
import CategoryRepository from '../database/repositories/CategoryRepository';

const SearchBar = ({ value, onChangeText, onSearch }) => (
  <View style={styles.searchContainer}>
    <TextInput
      style={styles.searchInput}
      placeholder="Tìm kiếm sản phẩm..."
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor="#999"
    />
    <TouchableOpacity style={styles.searchButton} onPress={onSearch}>
      <Text style={styles.searchButtonText}>🔍</Text>
    </TouchableOpacity>
  </View>
);

const FilterModal = ({ visible, filters, categories, onApply, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.modalContainer}>
        <Appbar.Header style={styles.modalHeader}>
          <Appbar.BackAction onPress={onClose} color="#fff" />
          <Appbar.Content title="Lọc sản phẩm" titleStyle={{ color: '#fff' }} />
        </Appbar.Header>

        <ScrollView style={styles.modalContent}>
          {/* Category Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Danh mục</Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryTag,
                    localFilters.categoryId === cat.id && styles.categoryTagActive,
                  ]}
                  onPress={() =>
                    setLocalFilters({
                      ...localFilters,
                      categoryId: localFilters.categoryId === cat.id ? null : cat.id,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.categoryTagText,
                      localFilters.categoryId === cat.id && styles.categoryTagTextActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Price Range Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Khoảng giá</Text>
            <View style={styles.priceOptions}>
              {[
                { label: 'Dưới 100k', min: 0, max: 100000 },
                { label: '100k - 300k', min: 100000, max: 300000 },
                { label: '300k - 500k', min: 300000, max: 500000 },
                { label: 'Trên 500k', min: 500000, max: 99999999 },
              ].map((range, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.priceOption,
                    localFilters.minPrice === range.min &&
                      localFilters.maxPrice === range.max &&
                      styles.priceOptionActive,
                  ]}
                  onPress={() =>
                    setLocalFilters({
                      ...localFilters,
                      minPrice: range.min,
                      maxPrice: range.max,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.priceOptionText,
                      localFilters.minPrice === range.min &&
                        localFilters.maxPrice === range.max &&
                        styles.priceOptionTextActive,
                    ]}
                  >
                    {range.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Rating Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Đánh giá</Text>
            <View style={styles.ratingOptions}>
              {[
                { label: '4⭐ trở lên', value: 4 },
                { label: '3.5⭐ trở lên', value: 3.5 },
                { label: '3⭐ trở lên', value: 3 },
              ].map((rating, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.ratingOption,
                    localFilters.minRating === rating.value && styles.ratingOptionActive,
                  ]}
                  onPress={() =>
                    setLocalFilters({
                      ...localFilters,
                      minRating: localFilters.minRating === rating.value ? null : rating.value,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.ratingOptionText,
                      localFilters.minRating === rating.value && styles.ratingOptionTextActive,
                    ]}
                  >
                    {rating.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sort Options */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Sắp xếp theo</Text>
            <View style={styles.sortOptions}>
              {[
                { label: 'Liên quan', value: null },
                { label: 'Giá: Thấp → Cao', value: 'price_low' },
                { label: 'Giá: Cao → Thấp', value: 'price_high' },
                { label: 'Đánh giá cao', value: 'rating' },
                { label: 'Mới nhất', value: 'newest' },
              ].map((sort, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.sortOption,
                    localFilters.sortBy === sort.value && styles.sortOptionActive,
                  ]}
                  onPress={() =>
                    setLocalFilters({
                      ...localFilters,
                      sortBy: sort.value,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.sortOptionText,
                      localFilters.sortBy === sort.value && styles.sortOptionTextActive,
                    ]}
                  >
                    {sort.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.applyButton]}
            onPress={handleApply}
          >
            <Text style={styles.applyButtonText}>Áp dụng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const ProductCard = ({ product, onPress }) => (
  <TouchableOpacity 
    style={styles.productCard}
    onPress={() => onPress?.(product)}
    activeOpacity={0.8}
  >
    <View style={styles.productImagePlaceholder}>
      <Text style={styles.productImageText}>{product.name[0]}</Text>
    </View>
    <View style={styles.productInfo}>
      <Text style={styles.productName} numberOfLines={2}>
        {product.name}
      </Text>
      <View style={styles.priceRatingRow}>
        <Text style={styles.productPrice}>{product.price.toLocaleString()}₫</Text>
        <Text style={styles.productRating}>⭐ {product.rating}</Text>
      </View>
      {product.discount > 0 && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>-{product.discount}%</Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

export default function SearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    categoryId: null,
    minPrice: undefined,
    maxPrice: undefined,
    minRating: undefined,
    sortBy: null,
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    try {
      const cats = CategoryRepository.getAllCategories();
      setCategories(cats);
      const allProducts = ProductRepository.getAllProducts();
      setProducts(allProducts);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadInitialData();
      return;
    }

    setLoading(true);
    try {
      const results = ProductRepository.searchAndFilter({
        query: searchQuery,
        ...filters,
      });
      setProducts(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    // Auto-search with new filters
    setLoading(true);
    try {
      const results = ProductRepository.searchAndFilter({
        query: searchQuery,
        ...newFilters,
      });
      setProducts(results);
    } catch (error) {
      console.error('Filter error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetails', { productId: product.id });
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation?.goBack()} color="#fff" />
        <Appbar.Content title="Tìm kiếm & Lọc" titleStyle={{ color: '#fff' }} />
      </Appbar.Header>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSearch={handleSearch}
      />

      <View style={styles.toolbarContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Text style={styles.filterButtonText}>⚙️ Lọc</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => {
            setSearchQuery('');
            setFilters({
              categoryId: null,
              minPrice: undefined,
              maxPrice: undefined,
              minRating: undefined,
              sortBy: null,
            });
            loadInitialData();
          }}
        >
          <Text style={styles.clearButtonText}>↻ Xóa bộ lọc</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <ProductCard product={item} onPress={handleProductPress} />}
          contentContainerStyle={styles.scrollContent}
        />
      )}

      <FilterModal
        visible={filterModalVisible}
        filters={filters}
        categories={categories}
        onApply={handleApplyFilters}
        onClose={() => setFilterModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  appbar: {
    backgroundColor: '#FF6B6B',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 18,
  },
  toolbarContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  productCard: {
    flex: 0.48,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  productImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImageText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  productInfo: {
    padding: 8,
  },
  productName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  priceRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  productRating: {
    fontSize: 12,
    color: '#ffa500',
  },
  discountBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    backgroundColor: '#FF6B6B',
  },
  modalContent: {
    flex: 1,
    paddingVertical: 16,
  },
  filterSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryTag: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryTagActive: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FF6B6B',
  },
  categoryTagText: {
    fontSize: 12,
    color: '#333',
  },
  categoryTagTextActive: {
    color: '#fff',
  },
  priceOptions: {
    gap: 10,
  },
  priceOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  priceOptionActive: {
    borderColor: '#FF6B6B',
    backgroundColor: '#fff5f5',
  },
  priceOptionText: {
    fontSize: 14,
    color: '#333',
  },
  priceOptionTextActive: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  ratingOptions: {
    gap: 10,
  },
  ratingOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  ratingOptionActive: {
    borderColor: '#FF6B6B',
    backgroundColor: '#fff5f5',
  },
  ratingOptionText: {
    fontSize: 14,
    color: '#333',
  },
  ratingOptionTextActive: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  sortOptions: {
    gap: 10,
  },
  sortOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  sortOptionActive: {
    borderColor: '#FF6B6B',
    backgroundColor: '#fff5f5',
  },
  sortOptionText: {
    fontSize: 14,
    color: '#333',
  },
  sortOptionTextActive: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    paddingBottom: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
  applyButton: {
    backgroundColor: '#FF6B6B',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
