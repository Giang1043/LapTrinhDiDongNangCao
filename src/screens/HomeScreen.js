import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';
import { CategoryList } from '../components/CategoryList';
import { BestSellingList } from '../components/BestSellingList';
import { DiscountedProductsGrid } from '../components/DiscountedProductsGrid';
import { apiService } from '../services/apiService';

export const HomeScreen = () => {
  const [categories, setCategories] = useState([]);
  const [bestSelling, setBestSelling] = useState([]);
  const [discounted, setDiscounted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      const [categoriesRes, bestSellingRes, discountedRes] = await Promise.all([
        apiService.getCategories(),
        apiService.getBestSellingProducts(),
        apiService.getDiscountedProducts(),
      ]);

      if (categoriesRes.success) {
        setCategories(categoriesRes.data);
      }
      if (bestSellingRes.success) {
        setBestSelling(bestSellingRes.data);
      }
      if (discountedRes.success) {
        setDiscounted(discountedRes.data);
      }
    } catch (err) {
      setError('Lỗi tải dữ liệu. Vui lòng thử lại!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && categories.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🍽️ Quán ăn</Text>
          <Text style={styles.headerSubtitle}>Khám phá những món ăn ngon lành</Text>
        </View>

        {/* Categories Section */}
        {categories.length > 0 && (
          <CategoryList data={categories} loading={false} />
        )}

        {/* Best Selling Section */}
        {bestSelling.length > 0 && (
          <BestSellingList data={bestSelling} loading={false} />
        )}

        {/* Discounted Products Section */}
        {discounted.length > 0 && (
          <DiscountedProductsGrid data={discounted} loading={false} />
        )}

        {/* Footer Spacing */}
        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#007AFF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E8E8E8',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  footer: {
    height: 20,
  },
});
