import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Appbar, Avatar } from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';

const COLORS = {
  primary: '#FF6B35',
  error: '#d32f2f',
  background: '#f5f5f5',
  text: '#333',
  textLight: '#666',
  white: '#fff',
};

export default function UserScreen({ onLogout }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', onPress: () => {} },
      {
        text: 'Đăng xuất',
        onPress: async () => {
          if (onLogout) {
            onLogout();
          }
        },
      },
    ]);
  };

  if (loading || !currentUser) {
    return (
      <View style={styles.container}>
        <Appbar.Header style={styles.appbar}>
          <Appbar.Content title="Tài khoản của tôi" />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <Text>Đang tải thông tin...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Tài khoản của tôi" />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* Avatar và thông tin cơ bản */}
        <View style={styles.profileSection}>
          <Avatar.Text
            size={100}
            label={currentUser.name.charAt(0).toUpperCase()}
            style={styles.avatar}
          />
          <Text style={styles.name}>{currentUser.name}</Text>
          {currentUser.isActive && (
            <Text style={styles.status}>✓ Tài khoản đã xác thực</Text>
          )}
        </View>

        {/* Thông tin chi tiết */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Số điện thoại:</Text>
            <Text style={styles.value}>{currentUser.phone}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{currentUser.email}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.label}>Ngày tạo tài khoản:</Text>
            <Text style={styles.value}>
              {new Date(currentUser.createdAt).toLocaleDateString('vi-VN')}
            </Text>
          </View>
        </View>

        {/* Menu tùy chỉnh */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Tài khoản</Text>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Chỉnh sửa thông tin</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Đổi mật khẩu</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Lịch sử mua hàng</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Danh sách yêu thích</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={handleLogout}
          >
            <Text style={[styles.menuText, styles.logoutText]}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  appbar: {
    backgroundColor: COLORS.primary,
    elevation: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    marginBottom: 12,
    backgroundColor: COLORS.primary,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  status: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 6,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    paddingVertical: 8,
  },
  label: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 4,
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  menuSection: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 12,
    paddingHorizontal: 0,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    fontSize: 16,
    color: COLORS.text,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: COLORS.error,
    fontWeight: '600',
  },
});
