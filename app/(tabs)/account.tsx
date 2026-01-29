import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Avatar, Button, Card, Text, TextInput, ActivityIndicator, Divider } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import * as realmService from '@/services/realmService';
import * as api from '@/services/api';

export default function AccountScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');

  useEffect(() => {
    loadUserData();
  }, [user?.id]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      if (user?.id) {
        const realmUser = await realmService.getUser(user.id);
        if (realmUser) {
          const userData = realmUser as any;
          setUserData(userData);
          setFullName(userData.fullName || '');
          setEmail(userData.email || '');
          setPhone(userData.phoneNumber || '');
          setAddress(userData.address || '');
          setCity(userData.city || '');
          setDistrict(userData.district || '');
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Xác nhận', 'Bạn chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          try {
            if (user?.id) {
              await realmService.deleteUserProfile(user.id);
            }
            await logout();
            router.replace('/login' as any);
          } catch (error) {
            console.error('Error logging out:', error);
            Alert.alert('Lỗi', 'Không thể đăng xuất');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Quick Access to Profile */}
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <View style={styles.profileQuickView}>
            <Avatar.Image
              size={80}
              source={{
                uri: userData?.avatar || 'https://via.placeholder.com/80',
              }}
            />
            <View style={styles.profileInfo}>
              <Text variant="headlineSmall" style={styles.name}>
                {userData?.fullName}
              </Text>
              <Text variant="bodySmall" style={styles.email}>
                {userData?.email}
              </Text>
            </View>
          </View>

          <Button
            mode="contained"
            onPress={() => router.push('/profile' as any)}
            style={styles.editProfileBtn}
          >
            Chỉnh sửa hồ sơ
          </Button>
        </Card.Content>
      </Card>

      {/* Account Information */}
      <Card style={styles.infoCard}>
        <Card.Title title="Thông tin tài khoản" />
        <Card.Content>
          <View style={styles.infoRow}>
            <Text variant="labelMedium">Họ tên:</Text>
            <Text variant="bodyMedium">{userData?.fullName || 'Chưa cập nhật'}</Text>
          </View>
          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <Text variant="labelMedium">Email:</Text>
            <Text variant="bodyMedium">{userData?.email}</Text>
          </View>
          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <Text variant="labelMedium">Số điện thoại:</Text>
            <Text variant="bodyMedium">{userData?.phoneNumber || 'Chưa cập nhật'}</Text>
          </View>
          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <Text variant="labelMedium">Địa chỉ:</Text>
            <Text variant="bodyMedium">{userData?.address || 'Chưa cập nhật'}</Text>
          </View>
          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <Text variant="labelMedium">Tỉnh/Thành phố:</Text>
            <Text variant="bodyMedium">{userData?.city || 'Chưa cập nhật'}</Text>
          </View>
          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <Text variant="labelMedium">Quận/Huyện:</Text>
            <Text variant="bodyMedium">{userData?.district || 'Chưa cập nhật'}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Account Actions */}
      <Card style={styles.actionsCard}>
        <Card.Title title="Hành động" />
        <Card.Content>
          <Button
            mode="outlined"
            style={styles.actionButton}
            onPress={() => Alert.alert('Chưa hỗ trợ', 'Tính năng này sẽ được triển khai sớm')}
          >
            Quản lý địa chỉ
          </Button>
          <Button
            mode="outlined"
            style={styles.actionButton}
            onPress={() => Alert.alert('Chưa hỗ trợ', 'Tính năng này sẽ được triển khai sớm')}
          >
            Chính sách quyền riêng tư
          </Button>
          <Button
            mode="outlined"
            style={styles.actionButton}
            onPress={() => Alert.alert('Chưa hỗ trợ', 'Tính năng này sẽ được triển khai sớm')}
          >
            Điều khoản dịch vụ
          </Button>
        </Card.Content>
      </Card>

      {/* Logout Button */}
      <Button
        mode="contained"
        buttonColor="#FF6B6B"
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        Đăng xuất
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    marginBottom: 16,
    marginTop: 8,
  },
  profileContent: {
    paddingVertical: 16,
  },
  profileQuickView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontWeight: '600',
    marginBottom: 4,
  },
  email: {
    color: '#666',
  },
  editProfileBtn: {
    marginTop: 12,
  },
  infoCard: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  divider: {
    marginVertical: 0,
  },
  actionsCard: {
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 8,
  },
  logoutButton: {
    marginHorizontal: 0,
    marginBottom: 20,
  },
});