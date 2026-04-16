import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { mockUsers } from '../../services/mockData';
import useAuthStore from '../../store/authStore';

export default function ChangePasswordScreen({ navigation }) {
  const { user } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = () => {
    if (!currentPassword) return Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu hiện tại');
    if (newPassword.length < 6) return Alert.alert('Lỗi', 'Mật khẩu mới phải ít nhất 6 ký tự');
    if (newPassword !== confirmPassword) return Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');

    setLoading(true);
    setTimeout(() => {
      // Mock verify current password
      const mockUser = mockUsers.find(u => u.email === user?.email);
      if (mockUser && mockUser.password !== currentPassword) {
        setLoading(false);
        return Alert.alert('Lỗi', 'Mật khẩu hiện tại không đúng');
      }
      if (mockUser) mockUser.password = newPassword;
      setLoading(false);
      Alert.alert('Thành công', 'Đổi mật khẩu thành công');
      navigation.goBack();
    }, 500);
  };

  return (
    <View style={styles.container}>
      <TextInput label="Mật khẩu hiện tại" value={currentPassword} onChangeText={setCurrentPassword} mode="outlined" secureTextEntry style={styles.input} />
      <TextInput label="Mật khẩu mới" value={newPassword} onChangeText={setNewPassword} mode="outlined" secureTextEntry style={styles.input} />
      <TextInput label="Xác nhận mật khẩu mới" value={confirmPassword} onChangeText={setConfirmPassword} mode="outlined" secureTextEntry style={styles.input} />
      <Button mode="contained" onPress={handleChange} loading={loading} style={styles.button} buttonColor="#FF6B35">Đổi mật khẩu</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  input: { marginBottom: 12 },
  button: { marginTop: 16, borderRadius: 8 },
});
