import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Avatar, Button, Card, Text, TextInput, ActivityIndicator, Divider } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext';
import * as realmService from '@/services/realmService';
import * as api from '@/services/api';
import { useRouter } from 'expo-router';

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

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      if (!user?.id) return;

      // Update Realm
      await realmService.updateUserProfile(user.id, {
        fullName,
        phoneNumber: phone,
        address,
        city,
        district,
        updatedAt: new Date(),
      });

      // Update server (optional)
      try {
        await api.updateUserProfile(user.id, {
          fullName,
          phoneNumber: phone,
          address,
          city,
          district,
        });
      } catch (error) {
        console.warn('Server update failed, but local update succeeded', error);
      }

      setEditMode(false);
      await loadUserData();
      Alert.alert('Thành công', 'Hồ sơ đã được cập nhật');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật hồ sơ');
    } finally {
      setSaving(false);
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
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileHeader}>
          <Avatar.Image
            size={100}
            source={{
              uri: userData?.avatar || 'https://via.placeholder.com/100',
            }}
          />
          <Text variant="headlineSmall" style={styles.name}>
            {userData?.fullName}
          </Text>
          <Text variant="bodySmall" style={styles.email}>
            {userData?.email}
          </Text>
          <Text variant="labelSmall" style={styles.role}>
            {userData?.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
          </Text>
        </Card.Content>
      </Card>

      {/* Profile Completion */}
      <Card style={styles.completionCard}>
        <Card.Content>
          <Text variant="titleSmall">Hoàn thành hồ sơ</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${userData?.profileCompleteness || 0}%`,
                },
              ]}
            />
          </View>
          <Text variant="labelSmall">
            {userData?.profileCompleteness || 0}% hoàn thành
          </Text>
        </Card.Content>
      </Card>

      {/* Edit Profile Form */}
      {editMode ? (
        <Card style={styles.formCard}>
          <Card.Title title="Chỉnh sửa hồ sơ" />
          <Card.Content>
            <TextInput
              label="Họ và tên"
              value={fullName}
              onChangeText={setFullName}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Email"
              value={email}
              editable={false}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Số điện thoại"
              value={phone}
              onChangeText={setPhone}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
            />
            <TextInput
              label="Địa chỉ"
              value={address}
              onChangeText={setAddress}
              mode="outlined"
              style={styles.input}
              multiline
            />
            <TextInput
              label="Tỉnh/Thành phố"
              value={city}
              onChangeText={setCity}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Quận/Huyện"
              value={district}
              onChangeText={setDistrict}
              mode="outlined"
              style={styles.input}
            />

            <View style={styles.buttonGroup}>
              <Button
                mode="contained"
                onPress={handleSaveProfile}
                loading={saving}
                disabled={saving}
                style={styles.saveBtn}
              >
                Lưu
              </Button>
              <Button
                mode="outlined"
                onPress={() => setEditMode(false)}
                disabled={saving}
                style={styles.cancelBtn}
              >
                Hủy
              </Button>
            </View>
          </Card.Content>
        </Card>
      ) : (
        <Card style={styles.infoCard}>
          <Card.Title title="Thông tin cá nhân" />
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

            <Button
              mode="contained"
              onPress={() => setEditMode(true)}
              style={styles.editBtn}
            >
              Chỉnh sửa
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Account Actions */}
      <Card style={styles.actionsCard}>
        <Card.Title title="Hành động" />
        <Card.Content>
          <Button mode="outlined" style={styles.actionButton}>
            Thay đổi mật khẩu
          </Button>
          <Button
            mode="contained-tonal"
            style={styles.actionButton}
            onPress={() => Alert.alert('Chưa hỗ trợ', 'Tính năng này sẽ được triển khai sớm')}
          >
            Quản lý địa chỉ
          </Button>
          <Button
            mode="contained-tonal"
            style={styles.actionButton}
            onPress={() => Alert.alert('Chưa hỗ trợ', 'Tính năng này sẽ được triển khai sớm')}
          >
            Chính sách quyền riêng tư
          </Button>
          <Button
            mode="contained-tonal"
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  name: {
    marginTop: 12,
    fontWeight: '600',
  },
  email: {
    marginTop: 4,
    color: '#666',
  },
  role: {
    marginTop: 4,
    color: '#999',
  },
  completionCard: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginVertical: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B6B',
  },
  formCard: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  saveBtn: {
    flex: 1,
  },
  cancelBtn: {
    flex: 1,
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
  editBtn: {
    marginTop: 16,
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