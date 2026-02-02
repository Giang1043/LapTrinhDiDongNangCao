import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput as RNTextInput,
  TouchableOpacity,
} from 'react-native';
import {
  Chip,
  Button,
  Card,
  Text,
  Icon,
} from 'react-native-paper';

export interface SearchFilterState {
  query: string;
  priceRange: [number, number];
  rating: number | null;
  sortBy: 'relevance' | 'price-low' | 'price-high' | 'rating' | 'newest';
  category: string | null;
}

interface SearchFilterProps {
  onSearch: (filters: SearchFilterState) => void;
  onReset: () => void;
  showAdvanced?: boolean;
  categories?: Array<{ id: string; name: string }>;
}

export default function SearchFilter({
  onSearch,
  onReset,
  showAdvanced = false,
  categories = [],
}: SearchFilterProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(showAdvanced);
  const [priceMin, setPriceMin] = useState('0');
  const [priceMax, setPriceMax] = useState('1000000');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedSort, setSelectedSort] = useState<SearchFilterState['sortBy']>('relevance');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSearch = () => {
    const filters: SearchFilterState = {
      query,
      priceRange: [parseInt(priceMin) || 0, parseInt(priceMax) || 1000000],
      rating: selectedRating,
      sortBy: selectedSort,
      category: selectedCategory,
    };
    onSearch(filters);
  };

  const handleReset = () => {
    setQuery('');
    setPriceMin('0');
    setPriceMax('1000000');
    setSelectedRating(null);
    setSelectedSort('relevance');
    setSelectedCategory(null);
    onReset();
  };

  const ratingOptions = [1, 2, 3, 4, 5];
  const sortOptions: Array<{ label: string; value: SearchFilterState['sortBy'] }> = [
    { label: 'Liên quan', value: 'relevance' },
    { label: 'Giá: Thấp → Cao', value: 'price-low' },
    { label: 'Giá: Cao → Thấp', value: 'price-high' },
    { label: 'Đánh giá cao', value: 'rating' },
    { label: 'Mới nhất', value: 'newest' },
  ];

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Icon
          source="magnify"
          size={24}
        />
        <RNTextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sản phẩm..."
          placeholderTextColor="#999"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Icon
              source="close"
              size={20}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Search and Filter Buttons */}
      <View style={styles.buttonRow}>
        <Button
          mode="contained"
          onPress={handleSearch}
          style={styles.searchBtn}
          compact
        >
          Tìm kiếm
        </Button>
        <Button
          mode="outlined"
          onPress={() => setShowFilters(!showFilters)}
          icon="tune"
          style={styles.filterBtn}
          compact
        >
          Bộ lọc
        </Button>
        {(query || selectedRating || selectedCategory) && (
          <Button
            mode="outlined"
            onPress={handleReset}
            icon="refresh"
            style={styles.resetBtn}
            compact
          >
            Xóa
          </Button>
        )}
      </View>

      {/* Advanced Filters */}
      {showFilters && (
        <Card style={styles.filtersCard}>
          <Card.Content>
            {/* Sort Options */}
            <Text variant="labelMedium" style={styles.filterLabel}>
              Sắp xếp theo:
            </Text>
            <View style={styles.chipsContainer}>
              {sortOptions.map((option) => (
                <Chip
                  key={option.value}
                  selected={selectedSort === option.value}
                  onPress={() => setSelectedSort(option.value)}
                  style={styles.sortChip}
                >
                  {option.label}
                </Chip>
              ))}
            </View>

            {/* Category Filter */}
            {categories.length > 0 && (
              <>
                <Text variant="labelMedium" style={styles.filterLabel}>
                  Danh mục:
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryScroll}
                >
                  <Chip
                    selected={selectedCategory === null}
                    onPress={() => setSelectedCategory(null)}
                    style={styles.categoryChip}
                  >
                    Tất cả
                  </Chip>
                  {categories.map((cat) => (
                    <Chip
                      key={cat.id}
                      selected={selectedCategory === cat.id}
                      onPress={() => setSelectedCategory(cat.id)}
                      style={styles.categoryChip}
                    >
                      {cat.name}
                    </Chip>
                  ))}
                </ScrollView>
              </>
            )}

            {/* Price Range */}
            <Text variant="labelMedium" style={styles.filterLabel}>
              Giá tiền:
            </Text>
            <View style={styles.priceRow}>
              <RNTextInput
                style={styles.priceInput}
                placeholder="Từ"
                placeholderTextColor="#999"
                value={priceMin}
                onChangeText={setPriceMin}
                keyboardType="numeric"
              />
              <Text style={styles.priceRangeSeparator}>-</Text>
              <RNTextInput
                style={styles.priceInput}
                placeholder="Đến"
                placeholderTextColor="#999"
                value={priceMax}
                onChangeText={setPriceMax}
                keyboardType="numeric"
              />
              <Text style={styles.priceCurrency}>₫</Text>
            </View>

            {/* Rating Filter */}
            <Text variant="labelMedium" style={styles.filterLabel}>
              Đánh giá tối thiểu:
            </Text>
            <View style={styles.ratingRow}>
              {ratingOptions.map((rating) => (
                <Chip
                  key={rating}
                  selected={selectedRating === rating}
                  onPress={() => setSelectedRating(selectedRating === rating ? null : rating)}
                  style={styles.ratingChip}
                >
                  ⭐ {rating}+
                </Chip>
              ))}
            </View>

            {/* Apply Button */}
            <Button
              mode="contained"
              onPress={handleSearch}
              style={styles.applyButton}
            >
              Áp dụng bộ lọc
            </Button>
          </Card.Content>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 8,
    fontSize: 16,
    color: '#000',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  searchBtn: {
    flex: 1,
  },
  filterBtn: {
    flex: 1,
  },
  resetBtn: {
    flex: 1,
  },
  filtersCard: {
    marginTop: 8,
    marginBottom: 12,
  },
  filterLabel: {
    marginTop: 12,
    marginBottom: 8,
    fontWeight: '600',
    color: '#333',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  sortChip: {
    marginBottom: 4,
  },
  categoryScroll: {
    marginBottom: 12,
  },
  categoryChip: {
    marginRight: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#000',
  },
  priceRangeSeparator: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  priceCurrency: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  ratingChip: {
    marginBottom: 4,
  },
  applyButton: {
    marginTop: 8,
  },
});
