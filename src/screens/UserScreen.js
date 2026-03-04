import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Appbar, Avatar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UserScreen({ onLogout }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const authData = await AsyncStorage.getItem('authData');
      if (authData) {
        const parsedData = JSON.parse(authData);
        setUser(parsedData.user);
      }
    } catch (error) {
      console.log('Error loading user info:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading || !user) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
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
      <Appbar.Header>
        <Appbar.Content title="Tài khoản của tôi" />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* Avatar và thông tin cơ bản */}
        <View style={styles.profileSection}>
          <Avatar.Text
            size={100}
            label={user.name.charAt(0).toUpperCase()}
            style={styles.avatar}
          />
          <Text style={styles.name}>{user.name}</Text>
        </View>

        {/* Thông tin chi tiết */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Số điện thoại:</Text>
            <Text style={styles.value}>{user.phone}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user.email}</Text>
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
    backgroundColor: '#fff',
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
    backgroundColor: '#FF6B35',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  infoCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    paddingVertical: 8,
  },
  label: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    color: '#333',
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
    color: '#FF6B35',
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
    color: '#333',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#d32f2f',
    fontWeight: '600',
  },
});
