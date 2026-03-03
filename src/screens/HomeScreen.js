import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Appbar } from 'react-native-paper';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="FoodApp - Trang Chủ" />
      </Appbar.Header>
      
      <ScrollView style={styles.content}>
        <Text style={styles.heading}>Chào mừng bạn đến với FoodApp</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danh mục sản phẩm</Text>
          <Text style={styles.sectionText}>
            Dữ liệu danh mục sẽ được tải từ API
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản phẩm bán chạy nhất</Text>
          <Text style={styles.sectionText}>
            Hiển thị 10 sản phẩm bán chạy nhất theo chiều ngang
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản phẩm giảm giá</Text>
          <Text style={styles.sectionText}>
            Hiển thị 20 sản phẩm giảm giá cao nhất chia 2 cột
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#FF6B35',
  },
  sectionText: {
    fontSize: 14,
    color: '#666',
  },
});
