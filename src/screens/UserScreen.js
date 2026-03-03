import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Appbar, Avatar } from 'react-native-paper';

export default function UserScreen() {
  // Dữ liệu mẫu - sẽ lấy từ AsyncStorage/API sau
  const user = {
    name: 'Cao Cự Giang',
    phone: '0375104778',
    email: 'tigiang2004@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Tài khoản của tôi" />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* Avatar và thông tin cơ bản */}
        <View style={styles.profileSection}>
          <Avatar.Image
            size={100}
            source={{ uri: user.avatar }}
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
          <View style={styles.menuItem}>
            <Text style={styles.menuText}>Chỉnh sửa thông tin</Text>
          </View>
          <View style={styles.menuItem}>
            <Text style={styles.menuText}>Đổi mật khẩu</Text>
          </View>
          <View style={styles.menuItem}>
            <Text style={styles.menuText}>Lịch sử mua hàng</Text>
          </View>
          <View style={styles.menuItem}>
            <Text style={styles.menuText}>Đăng xuất</Text>
          </View>
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
});
