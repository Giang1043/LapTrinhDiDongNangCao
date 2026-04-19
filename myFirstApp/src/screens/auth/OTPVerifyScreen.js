import React, { useState, useRef } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import useAuthStore from '../../store/authStore';

export default function OTPVerifyScreen({ navigation, route }) {
  const { type, email } = route.params; // type: 'register' | 'forgot'
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { verifyRegisterOTP, resetPassword, isLoading, otpData } = useAuthStore();

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert('Lỗi', 'Mã OTP phải có 6 chữ số');
      return;
    }

    try {
      if (type === 'register') {
        const result = await verifyRegisterOTP(otp);
        Alert.alert('Thành công', 'Đăng ký thành công! Vui lòng đăng nhập.', [
          { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
        ]);
      } else if (type === 'forgot') {
        if (newPassword.length < 6) {
          Alert.alert('Lỗi', 'Mật khẩu mới phải ít nhất 6 ký tự');
          return;
        }
        if (newPassword !== confirmPassword) {
          Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
          return;
        }
        const result = await resetPassword({ otp, newPassword });
        Alert.alert('Thành công', 'Đặt lại mật khẩu thành công!', [
          { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
        ]);
      }
    } catch (e) {
      Alert.alert('Lỗi', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Xác nhận OTP</Text>
        <Text style={styles.subtitle}>
          Mã OTP đã được gửi đến{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>

        <View style={styles.emailHint}>
          <Text style={styles.emailHintText}>📧 Mã OTP đã gửi qua email. Kiểm tra hộp thư (cả Spam).</Text>
        </View>

        <TextInput
          label="Nhập mã OTP (6 số)"
          value={otp}
          onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))}
          mode="outlined"
          keyboardType="number-pad"
          maxLength={6}
          style={styles.input}
          left={<TextInput.Icon icon="shield-key" />}
        />

        {type === 'forgot' && (
          <>
            <TextInput
              label="Mật khẩu mới"
              value={newPassword}
              onChangeText={setNewPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
            />
            <TextInput
              label="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
              left={<TextInput.Icon icon="lock-check" />}
            />
          </>
        )}

        <Button
          mode="contained"
          onPress={handleVerify}
          loading={isLoading}
          disabled={isLoading}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          {type === 'register' ? 'Xác nhận đăng ký' : 'Đặt lại mật khẩu'}
        </Button>

        <Button mode="text" onPress={() => navigation.goBack()} style={styles.linkButton}>
          Quay lại
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', padding: 24 },
  content: { alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FF6B35', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 10 },
  email: { fontWeight: 'bold', color: '#333' },
  emailHint: { backgroundColor: '#e8f5e9', padding: 12, borderRadius: 8, marginBottom: 16, alignItems: 'center', width: '100%', borderWidth: 1, borderColor: '#a5d6a7' },
  emailHintText: { fontSize: 13, color: '#2e7d32', textAlign: 'center' },
  input: { width: '100%', marginBottom: 12 },
  button: { width: '100%', marginTop: 8, borderRadius: 8 },
  buttonContent: { paddingVertical: 6 },
  linkButton: { marginTop: 8 },
});
