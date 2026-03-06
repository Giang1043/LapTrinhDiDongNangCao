import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import profileService from '../../services/profileService';
import { verifyPassword } from '../../utils/authHelpers';

const ChangePasswordScreen = ({ navigation }) => {
  const { currentUser, logout, updateAuthData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const validate = () => {
    if (!form.currentPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu hiện tại');
      return false;
    }
    if (!form.newPassword || form.newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu mới tối thiểu 6 ký tự');
      return false;
    }
    if (form.newPassword !== form.confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return false;
    }
    if (form.currentPassword === form.newPassword) {
      Alert.alert('Lỗi', 'Mật khẩu mới không được trùng với mật khẩu cũ');
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const result = await profileService.changePassword(
        currentUser.id,
        form.currentPassword,
        form.newPassword
      );

      if (!result.success) {
        Alert.alert('Lỗi', result.message);
        return;
      }

      // Update currentUser state immediately
      if (updateAuthData) {
        await updateAuthData(result.user);
      }

      Alert.alert('Thành công', 'Mật khẩu đã được thay đổi!\n\nVui lòng đăng nhập lại bằng mật khẩu mới', [
        {
          text: 'OK',
          onPress: async () => {
            try {
              // Verify logout is a function before calling
              if (typeof logout === 'function') {
                await logout();
              } else {
                // If logout doesn't exist, force navigate to Login manually
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              }
            } catch (e) {
              console.log('Logout error:', e);
              // Ensure we navigate even if logout fails
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  const PasswordInput = ({ label, placeholder, value, field, secureTextEntry }) => (
    <View style={styles.section}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={(text) => setForm({ ...form, [field]: text })}
          secureTextEntry={!showPasswords[field]}
          editable={!loading}
        />
        <TouchableOpacity
          onPress={() =>
            setShowPasswords({
              ...showPasswords,
              [field]: !showPasswords[field],
            })
          }
        >
          <Text style={styles.toggleText}>{showPasswords[field] ? 'Ẩn' : 'Hiện'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <PasswordInput
        label="Mật khẩu hiện tại"
        placeholder="Nhập mật khẩu hiện tại"
        value={form.currentPassword}
        field="current"
      />

      <PasswordInput
        label="Mật khẩu mới"
        placeholder="Nhập mật khẩu mới"
        value={form.newPassword}
        field="new"
      />

      <PasswordInput
        label="Xác nhận mật khẩu mới"
        placeholder="Nhập lại mật khẩu mới"
        value={form.confirmPassword}
        field="confirm"
      />

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleChangePassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Đổi mật khẩu</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingRight: 12,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 14,
  },
  toggleText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#FF6B6B',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChangePasswordScreen;
