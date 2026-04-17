import React, { useState, useMemo, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Searchbar, Text, Chip, IconButton, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import realmDB from '../../database/realmDB';

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeSearch = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load history first
        await loadHistory();
        
        // Load products and categories
        let realmProducts = await realmDB.getAllProducts();
        let realmCategories = await realmDB.getAllCategories();
        
        // If no products, try to initialize database and retry
        if (!realmProducts || realmProducts.length === 0) {
          await realmDB.initializeDatabase();
          
          // Retry loading
          realmProducts = await realmDB.getAllProducts();
          realmCategories = await realmDB.getAllCategories();
        }
        
        // Validate and set data
        setProducts(Array.isArray(realmProducts) ? realmProducts : []);
        setCategories(Array.isArray(realmCategories) ? realmCategories : []);
        
        if (!realmProducts || realmProducts.length === 0) {
          setError('Không có sản phẩm nào. Vui lòng thử lại sau.');
        }
      } catch (error) {
        console.error('❌ Error loading data:', error);
        setError('Lỗi tải dữ liệu. Vui lòng thử lại.');
        setProducts([]);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeSearch();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await AsyncStorage.getItem('searchHistory');
      if (data) {
        const parsed = JSON.parse(data);
        setSearchHistory(Array.isArray(parsed) ? parsed : []);
      }
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

  const handleRetry = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let realmProducts = await realmDB.getAllProducts();
      let realmCategories = await realmDB.getAllCategories();
      
      if (!realmProducts || realmProducts.length === 0) {
        await realmDB.initializeDatabase();
        realmProducts = await realmDB.getAllProducts();
        realmCategories = await realmDB.getAllCategories();
      }
      
      setProducts(Array.isArray(realmProducts) ? realmProducts : []);
      setCategories(Array.isArray(realmCategories) ? realmCategories : []);
    } catch (error) {
      setError('Lỗi tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
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
    let results = [...products];

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

  const formatPrice = (price) => {
    if (typeof price !== 'number' || isNaN(price)) return '0đ';
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: item.image }} 
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name || 'Không tên'}</Text>
        <Text style={styles.productShop}>{item.shop || 'Không có shop'}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
          {item.discount && item.discount > 0 && <Text style={styles.discount}>-{item.discount}%</Text>}
        </View>
        <Text style={styles.sold}>Đã bán {item.sold || 0} | ⭐ {item.rating || 0}</Text>
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
        editable={!isLoading}
      />

      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button 
            mode="contained" 
            onPress={handleRetry}
            compact
            buttonColor="#FF6B35"
            style={{ marginTop: 10 }}
          >
            Thử lại
          </Button>
        </View>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      )}

      {/* Search history */}
      {!isLoading && showHistory && searchHistory.length > 0 && (
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
      {!isLoading && (
        <View style={styles.filterSection}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>📂 Danh mục</Text>
          </View>
          <FlatList
            data={[{ id: null, name: 'Tất cả' }, ...categories]}
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
            contentContainerStyle={styles.categoryChipList}
            scrollEnabled={categories.length > 0}
          />
        </View>
      )}

      {/* Sort options */}
      {!isLoading && (
        <View style={styles.filterSection}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>🔄 Sắp xếp</Text>
          </View>
          <FlatList
            data={[
              { key: null, label: 'Mặc định' },
              { key: 'popular', label: 'Bán chạy' },
              { key: 'price_asc', label: 'Giá thấp' },
              { key: 'price_desc', label: 'Giá cao' },
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
            contentContainerStyle={styles.sortChipList}
          />
        </View>
      )}

      {!isLoading && <Text style={styles.resultCount}>{filteredProducts.length} kết quả</Text>}

      {/* Results */}
      {!isLoading && (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>Không tìm thấy sản phẩm</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchBar: { margin: 12, elevation: 2, borderRadius: 12, height: 50 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 40 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#666' },
  errorContainer: { backgroundColor: '#FFE5E5', paddingVertical: 12, paddingHorizontal: 12, marginHorizontal: 12, marginVertical: 8, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#D32F2F' },
  errorText: { color: '#D32F2F', fontSize: 13, fontWeight: '500' },
  // Filter sections
  filterSection: { backgroundColor: '#fff', marginVertical: 8, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  filterHeader: { paddingHorizontal: 16, marginBottom: 10 },
  filterTitle: { fontSize: 14, fontWeight: '700', color: '#333' },
  categoryChipList: { paddingHorizontal: 12, paddingBottom: 0 },
  sortChipList: { paddingHorizontal: 12, paddingBottom: 0 },
  chip: { marginHorizontal: 5, marginVertical: 4, backgroundColor: '#e8e8e8' },
  chipSelected: { backgroundColor: '#FF6B35' },
  chipText: { color: '#333', fontSize: 12, fontWeight: '500' },
  chipTextSelected: { color: '#fff', fontSize: 12, fontWeight: '600' },
  sortChip: { marginHorizontal: 5, marginVertical: 4, backgroundColor: '#f0f0f0' },
  sortChipSelected: { backgroundColor: '#333' },
  resultCount: { fontSize: 13, color: '#999', marginLeft: 16, marginBottom: 8, marginTop: 8 },
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
