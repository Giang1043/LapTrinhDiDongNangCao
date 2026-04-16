import React from 'react';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, List, Divider, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useAuthStore from '../../store/authStore';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <ScrollView style={styles.container}>
      {/* User card */}
      <View style={styles.userCard}>
        <Image
          source={{ uri: user?.avatar || 'https://i.pravatar.cc/150?img=3' }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.fullName || 'Người dùng'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <Text style={styles.userPhone}>{user?.phone}</Text>
        </View>
      </View>

      <Divider />

      {/* Menu items */}
      <List.Section>
        <List.Subheader>Tài khoản</List.Subheader>
        <List.Item
          title="Chỉnh sửa hồ sơ"
          description="Avatar, họ tên"
          left={props => <List.Icon {...props} icon="account-edit" color="#FF6B35" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('EditProfile')}
        />
        <Divider />
        <List.Item
          title="Đổi mật khẩu"
          left={props => <List.Icon {...props} icon="lock-reset" color="#FF6B35" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('ChangePassword')}
        />
        <Divider />
        <List.Item
          title="Đổi số điện thoại"
          description={user?.phone}
          left={props => <List.Icon {...props} icon="phone" color="#FF6B35" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('ChangePhone')}
        />
        <Divider />
        <List.Item
          title="Đổi email"
          description={user?.email}
          left={props => <List.Icon {...props} icon="email" color="#FF6B35" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('ChangeEmail')}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Đơn hàng</List.Subheader>
        <List.Item
          title="Lịch sử đơn hàng"
          left={props => <List.Icon {...props} icon="history" color="#FF6B35" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Orders' })}
        />
      </List.Section>

      <View style={styles.logoutContainer}>
        <Button
          mode="outlined"
          icon="logout"
          onPress={handleLogout}
          style={styles.logoutButton}
          textColor="#FF3B30"
        >
          Đăng xuất
        </Button>
      </View>

      <Text style={styles.version}>FoodApp v1.0.0 - Hoang Ba Hieu - 20110477</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  userCard: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: '#FF6B35' },
  userInfo: { marginLeft: 16, flex: 1 },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  userEmail: { fontSize: 14, color: '#666', marginTop: 2 },
  userPhone: { fontSize: 14, color: '#666', marginTop: 2 },
  logoutContainer: { padding: 20 },
  logoutButton: { borderColor: '#FF3B30', borderRadius: 8 },
  version: { textAlign: 'center', color: '#ccc', fontSize: 12, paddingBottom: 30 },
});
