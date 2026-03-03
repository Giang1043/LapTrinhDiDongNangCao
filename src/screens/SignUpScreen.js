import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { TextInput, Button, Text, Appbar } from 'react-native-paper';
import { registerUser } from '../services/authService';

export default function SignUpScreen({ navigation, onSignUpSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    setError('');

    // Validation
    if (!name || !email || !phone || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải tối thiểu 6 ký tự');
      return;
    }

    // Validation email đơn giản
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email không hợp lệ');
      return;
    }

    setLoading(true);

    try {
      const result = await registerUser(email, password, name, phone);
      if (result.success) {
        // Gọi callback để lưu user info
        onSignUpSuccess(result.user);
      }
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Đăng ký tài khoản" />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>FoodApp</Text>
          <Text style={styles.headerSubtitle}>Tạo tài khoản mới</Text>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          <TextInput
            label="Họ và tên"
            value={name}
            onChangeText={setName}
            mode="outlined"
            editable={!loading}
            style={styles.input}
            placeholder="Nhập họ và tên"
          />

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            editable={!loading}
            style={styles.input}
            placeholder="Nhập email"
          />

          <TextInput
            label="Số điện thoại"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            keyboardType="phone-pad"
            editable={!loading}
            style={styles.input}
            placeholder="Nhập số điện thoại"
          />

          <TextInput
            label="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            editable={!loading}
            style={styles.input}
            placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye' : 'eye-off'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          <TextInput
            label="Xác nhận mật khẩu"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            secureTextEntry={!showConfirmPassword}
            editable={!loading}
            style={styles.input}
            placeholder="Nhập lại mật khẩu"
            right={
              <TextInput.Icon
                icon={showConfirmPassword ? 'eye' : 'eye-off'}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            }
          />

          {/* Error message */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Sign up button */}
          <Button
            mode="contained"
            onPress={handleSignUp}
            disabled={loading}
            style={styles.signupButton}
            contentStyle={styles.buttonContent}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size={20} />
            ) : (
              'Đăng ký'
            )}
          </Button>

          {/* Terms */}
          <Text style={styles.termsText}>
            Bằng cách đăng ký, bạn đồng ý với{' '}
            <Text style={styles.termsLink}>Điều khoản dịch vụ</Text>
          </Text>
        </View>

        {/* Login section */}
        <View style={styles.loginSection}>
          <Text style={styles.loginText}>Bạn đã có tài khoản? </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.loginLink}>Đăng nhập</Text>
          </TouchableOpacity>
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
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  formSection: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 12,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '500',
  },
  signupButton: {
    backgroundColor: '#FF6B35',
    marginTop: 12,
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  termsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  termsLink: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
});
