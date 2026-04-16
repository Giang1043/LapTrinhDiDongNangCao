import React, { useState, useMemo, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Searchbar, Text, Chip, IconButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockProducts, mockCategories } from '../../services/mockData';

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await AsyncStorage.getItem('searchHistory');
      if (data) setSearchHistory(JSON.parse(data));
    } catch (e) {}
  };

  const saveToHistory = async (text) => {
    if (!text.trim()) return;
    const updated = [text.trim(), ...searchHistory.filter(h => h !== text.trim())].slice(0, 10);
    setSearchHistory(updated);
    await AsyncStorage.setItem('searchHistory', JSON.stringify(updated));
  };

  const clearHistory = async () => {
    setSearchHistory([]);
    await AsyncStorage.removeItem('searchHistory');
  };

  const handleSearch = (text) => {
    setQuery(text);
    setShowHistory(!text.trim());
  };

  const handleSubmit = () => {
    if (query.trim()) {
      saveToHistory(query.trim());
      setShowHistory(false);
    }
  };

  const filteredProducts = useMemo(() => {
    let results = [...mockProducts];

    // Filter by search query
    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.shop.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    // Filter by category
    if (selectedCategory) {
      results = results.filter(p => p.categoryId === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'price_asc': results.sort((a, b) => a.price - b.price); break;
      case 'price_desc': results.sort((a, b) => b.price - a.price); break;
      case 'popular': results.sort((a, b) => b.sold - a.sold); break;
      case 'discount': results.sort((a, b) => b.discount - a.discount); break;
    }

    return results;
  }, [query, selectedCategory, sortBy]);

  const formatPrice = (price) => price.toLocaleString('vi-VN') + 'đ';

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productShop}>{item.shop}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
          {item.discount > 0 && <Text style={styles.discount}>-{item.discount}%</Text>}
        </View>
        <Text style={styles.sold}>Đã bán {item.sold} | ⭐ {item.rating}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Tìm kiếm món ăn, quán..."
        onChangeText={handleSearch}
        onSubmitEditing={handleSubmit}
        value={query}
        style={styles.searchBar}
      />

      {/* Search history */}
      {showHistory && searchHistory.length > 0 && (
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Lịch sử tìm kiếm</Text>
            <IconButton icon="delete-outline" size={18} onPress={clearHistory} />
          </View>
          <View style={styles.historyChips}>
            {searchHistory.map((h, i) => (
              <Chip key={i} onPress={() => { setQuery(h); setShowHistory(false); saveToHistory(h); }} style={styles.historyChip} icon="history">
                {h}
              </Chip>
            ))}
          </View>
        </View>
      )}

      {/* Category filter */}
      <FlatList
        data={[{ id: null, name: 'Tất cả' }, ...mockCategories]}
        renderItem={({ item }) => (
          <Chip
            selected={selectedCategory === item.id}
            onPress={() => setSelectedCategory(item.id)}
            style={[styles.chip, selectedCategory === item.id && styles.chipSelected]}
            textStyle={selectedCategory === item.id ? styles.chipTextSelected : styles.chipText}
          >
            {item.name}
          </Chip>
        )}
        keyExtractor={(item) => String(item.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipList}
      />

      {/* Sort options */}
      <FlatList
        data={[
          { key: null, label: 'Mặc định' },
          { key: 'popular', label: 'Bán chạy' },
          { key: 'price_asc', label: 'Giá tăng' },
          { key: 'price_desc', label: 'Giá giảm' },
          { key: 'discount', label: 'Giảm giá' },
        ]}
        renderItem={({ item }) => (
          <Chip
            selected={sortBy === item.key}
            onPress={() => setSortBy(item.key)}
            style={[styles.sortChip, sortBy === item.key && styles.sortChipSelected]}
            textStyle={sortBy === item.key ? styles.chipTextSelected : styles.chipText}
            icon={sortBy === item.key ? 'check' : undefined}
          >
            {item.label}
          </Chip>
        )}
        keyExtractor={item => String(item.key)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipList}
      />

      <Text style={styles.resultCount}>{filteredProducts.length} kết quả</Text>

      {/* Results */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Không tìm thấy sản phẩm</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchBar: { margin: 12, elevation: 2, borderRadius: 12, height: 50 },
  chipList: { paddingHorizontal: 12, paddingBottom: 8 },
  chip: { marginHorizontal: 4, backgroundColor: '#e8e8e8' },
  chipSelected: { backgroundColor: '#FF6B35' },
  chipText: { color: '#333', fontSize: 12 },
  chipTextSelected: { color: '#fff', fontSize: 12 },
  sortChip: { marginHorizontal: 4, backgroundColor: '#f0f0f0' },
  sortChipSelected: { backgroundColor: '#333' },
  resultCount: { fontSize: 13, color: '#999', marginLeft: 16, marginBottom: 8 },
  list: { paddingHorizontal: 12 },
  productCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, marginBottom: 10, elevation: 2, overflow: 'hidden' },
  productImage: { width: 100, height: 100 },
  productInfo: { flex: 1, padding: 10 },
  productName: { fontSize: 14, fontWeight: '600', color: '#333' },
  productShop: { fontSize: 12, color: '#999', marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  productPrice: { fontSize: 15, fontWeight: 'bold', color: '#FF6B35' },
  discount: { fontSize: 11, color: '#fff', backgroundColor: '#FF3B30', borderRadius: 4, paddingHorizontal: 5, marginLeft: 6 },
  sold: { fontSize: 11, color: '#999', marginTop: 4 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 },
  // History
  historySection: { paddingHorizontal: 12, marginBottom: 8 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyTitle: { fontSize: 14, fontWeight: '600', color: '#333' },
  historyChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  historyChip: { marginBottom: 4, backgroundColor: '#f0f0f0', height: 36 },
});
