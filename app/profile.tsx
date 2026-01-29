import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { ActivityIndicator, Button, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import * as realmService from '@/services/realmService';
import { Colors } from '@/constants/colors';
import {
  ProfileHeader,
  ProfileSection,
  EditModalSheet,
  ChangePasswordSheet,
} from '@/components/profile';

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  avatar?: string;
  [key: string]: any;
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  // User data
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modal states
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, [user?.id]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      if (user?.id) {
        const realmUser = await realmService.getUser(user.id);
        if (realmUser) {
          setUserData(realmUser as UserProfile);
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu người dùng');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserProfile();
    setRefreshing(false);
  };

  const handleEditField = (field: string, value: string) => {
    setEditingField(field);
    setEditValue(value);
  };

  const handleSaveField = async (newValue: string) => {
    if (!editingField || !user?.id || !newValue.trim()) return;

    try {
      setSaving(true);

      const updateData: Partial<UserProfile> = {};
      if (editingField === 'fullName') {
        updateData.fullName = newValue;
      } else if (editingField === 'phoneNumber') {
        updateData.phoneNumber = newValue;
      }

      await realmService.updateUserProfile(user.id, {
        ...updateData,
        updatedAt: new Date(),
      });

      setUserData((prev) => (prev ? { ...prev, ...updateData } : null));
      setEditingField(null);
      Alert.alert('Thành công', 'Cập nhật thành công');
    } catch (error) {
      console.error('Error saving field:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu không khớp');
      return;
    }

    try {
      setSaving(true);
      // TODO: Gọi API để đổi mật khẩu
      console.log('Change password:', {
        oldPassword,
        newPassword,
        confirmPassword,
      });

      Alert.alert('Thành công', 'Mật khẩu đã được cập nhật');
      setShowChangePassword(false);
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Lỗi', 'Không thể đổi mật khẩu');
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
          } catch (error) {
            console.error('Error logging out:', error);
            Alert.alert('Lỗi', 'Không thể đăng xuất');
          }
        },
      },
    ]);
  };

  if (loading || !userData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <ProfileHeader
          fullName={userData.fullName}
          email={userData.email}
          avatar={userData.avatar}
          onEditAvatar={() => Alert.alert('Chức năng', 'Tính năng chỉnh sửa avatar sẽ được triển khai')}
        />

        {/* Personal Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="account-details"
              size={20}
              color={Colors.primary}
            />
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Thông tin cá nhân
            </Text>
          </View>

          <View style={styles.sectionContent}>
            <ProfileSection
              title="Họ và tên"
              icon="account"
              value={userData.fullName}
              isEditable
              onPress={() => handleEditField('fullName', userData.fullName)}
            />

            <ProfileSection
              title="Email"
              icon="email"
              value={userData.email}
              isEditable={false}
            />

            <ProfileSection
              title="Số điện thoại"
              icon="phone"
              value={userData.phoneNumber}
              isEditable
              onPress={() => handleEditField('phoneNumber', userData.phoneNumber || '')}
            />
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="security"
              size={20}
              color={Colors.primary}
            />
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Bảo mật
            </Text>
          </View>

          <View style={styles.sectionContent}>
            <ProfileSection
              title="Đổi mật khẩu"
              icon="lock"
              value="Cập nhật mật khẩu của bạn"
              isEditable
              onPress={() => setShowChangePassword(true)}
            />
          </View>
        </View>

        {/* Additional Actions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="cog"
              size={20}
              color={Colors.primary}
            />
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Khác
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              icon="delete"
              onPress={() =>
                Alert.alert(
                  'Xóa tài khoản',
                  'Chức năng này sẽ được triển khai sớm'
                )
              }
              style={styles.actionButton}
            >
              Xóa tài khoản
            </Button>

            <Button
              mode="outlined"
              icon="file-document"
              onPress={() =>
                Alert.alert(
                  'Chính sách',
                  'Chức năng này sẽ được triển khai sớm'
                )
              }
              style={styles.actionButton}
            >
              Chính sách quyền riêng tư
            </Button>

            <Button
              mode="outlined"
              icon="file-document"
              onPress={() =>
                Alert.alert(
                  'Điều khoản',
                  'Chức năng này sẽ được triển khai sớm'
                )
              }
              style={styles.actionButton}
            >
              Điều khoản dịch vụ
            </Button>
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <Button
            mode="contained"
            buttonColor={Colors.error}
            icon="logout"
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            Đăng xuất
          </Button>
        </View>
      </ScrollView>

      {/* Edit Modal Sheets */}
      {editingField && (
        <EditModalSheet
          visible={!!editingField}
          title={
            editingField === 'fullName'
              ? 'Chỉnh sửa tên'
              : 'Chỉnh sửa số điện thoại'
          }
          label={
            editingField === 'fullName'
              ? 'Họ và tên'
              : 'Số điện thoại'
          }
          value={editValue}
          icon={editingField === 'fullName' ? 'account' : 'phone'}
          keyboardType={editingField === 'phoneNumber' ? 'phone-pad' : 'default'}
          onClose={() => setEditingField(null)}
          onSave={handleSaveField}
          loading={saving}
        />
      )}

      {/* Change Password Modal */}
      <ChangePasswordSheet
        visible={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        onSave={handleChangePassword}
        loading={saving}
      />
    </SafeAreaView>
  );
}

// Import Text from react-native-paper at the top if not already imported
import { Text } from 'react-native-paper';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 12,
    backgroundColor: Colors.white,
    marginHorizontal: 0,
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  sectionContent: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  actionButtons: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 10,
  },
  actionButton: {
    borderColor: Colors.gray300,
  },
  logoutSection: {
    paddingHorizontal: 12,
    paddingVertical: 24,
  },
  logoutButton: {
    borderRadius: 8,
  },
});
