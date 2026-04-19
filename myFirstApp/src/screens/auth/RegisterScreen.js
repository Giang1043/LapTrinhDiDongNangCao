import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import useAuthStore from '../../store/authStore';

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading, clearError } = useAuthStore();

  const validate = () => {
    if (!fullName.trim()) return 'Vui lòng nhập họ tên';
    if (!email.trim()) return 'Vui lòng nhập email';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Email không hợp lệ';
    if (!phone.trim()) return 'Vui lòng nhập số điện thoại';
    if (!/^0\d{9}$/.test(phone)) return 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)';
    if (password.length < 6) return 'Mật khẩu phải ít nhất 6 ký tự';
    if (password !== confirmPassword) return 'Mật khẩu xác nhận không khớp';
    return null;
  };

  const handleRegister = async () => {
    const err = validate();
    if (err) {
      Alert.alert('Lỗi', err);
      return;
    }
    try {
      const result = await register({ email: email.trim(), password, fullName: fullName.trim(), phone: phone.trim() });
      Alert.alert(
        'Xác nhận OTP',
        `Mã OTP đã gửi đến ${email}. Vui lòng kiểm tra email.`,
        [{ text: 'Nhập OTP', onPress: () => navigation.navigate('OTPVerify', { type: 'register', email }) }]
      );
    } catch (e) {
      Alert.alert('Đăng ký thất bại', e.message);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Tạo tài khoản</Text>
          <Text style={styles.subtitle}>Đăng ký để đặt đồ ăn ngay</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Họ và tên"
            value={fullName}
            onChangeText={setFullName}
            mode="outlined"
            left={<TextInput.Icon icon="account" />}
            style={styles.input}
          />

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            left={<TextInput.Icon icon="email" />}
            style={styles.input}
          />

          <TextInput
            label="Số điện thoại"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            keyboardType="phone-pad"
            left={<TextInput.Icon icon="phone" />}
            style={styles.input}
          />

          <TextInput
            label="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            left={<TextInput.Icon icon="lock" />}
            right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
            style={styles.input}
          />

          <TextInput
            label="Xác nhận mật khẩu"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            left={<TextInput.Icon icon="lock-check" />}
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Đăng ký
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            style={styles.linkButton}
          >
            Đã có tài khoản? Đăng nhập
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FF6B35' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 6 },
  form: { width: '100%' },
  input: { marginBottom: 10 },
  button: { marginTop: 12, borderRadius: 8 },
  buttonContent: { paddingVertical: 6 },
  linkButton: { marginTop: 8 },
});
