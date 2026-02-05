import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';

const CategoryItem = ({ item }) => (
  <View style={styles.categoryItem}>
    <Text style={styles.categoryIcon}>{item.icon}</Text>
    <Text style={styles.categoryName}>{item.name}</Text>
  </View>
);

export const CategoryList = ({ data, loading }) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Danh mục</Text>
      <FlatList
        data={data}
        renderItem={({ item }) => <CategoryItem item={item} />}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        scrollEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    backgroundColor: '#fff',
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
  categoryItem: {
    alignItems: 'center',
    marginRight: 16,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    minWidth: 80,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  loadingContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
