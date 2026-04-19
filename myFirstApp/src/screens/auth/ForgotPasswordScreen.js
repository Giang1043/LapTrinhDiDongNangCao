import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import useAuthStore from '../../store/authStore';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const { forgotPassword, isLoading } = useAuthStore();

  const handleForgot = async () => {
    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }
    try {
      const result = await forgotPassword({ email: email.trim() });
      Alert.alert(
        'Gửi OTP thành công',
        `Mã OTP đã gửi đến ${email}. Vui lòng kiểm tra email.`,
        [{ text: 'Nhập OTP', onPress: () => navigation.navigate('OTPVerify', { type: 'forgot', email: email.trim() }) }]
      );
    } catch (e) {
      Alert.alert('Lỗi', e.message);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <Text style={styles.title}>Quên mật khẩu</Text>
        <Text style={styles.subtitle}>Nhập email để nhận mã OTP đặt lại mật khẩu</Text>

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

        <Button
          mode="contained"
          onPress={handleForgot}
          loading={isLoading}
          disabled={isLoading}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Gửi mã OTP
        </Button>

        <Button mode="text" onPress={() => navigation.goBack()} style={styles.linkButton}>
          Quay lại đăng nhập
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', padding: 24 },
  content: { width: '100%' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FF6B35', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24 },
  input: { marginBottom: 16 },
  button: { marginTop: 8, borderRadius: 8 },
  buttonContent: { paddingVertical: 6 },
  linkButton: { marginTop: 12 },
});
