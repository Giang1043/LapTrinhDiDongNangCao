import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { TextInput, Button, Text, Appbar } from 'react-native-paper';
import { loginUser } from '../services/authService';

export default function LoginScreen({ navigation, onLoginSuccess }) {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await loginUser(email, password);
      if (result.success && result.token) {
        // Gọi callback để lưu user info và JWT token
        onLoginSuccess({
          user: result.user,
          token: result.token,
        });
      }
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Đăng nhập" />
      </Appbar.Header>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Logo */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>FoodApp</Text>
          <Text style={styles.headerSubtitle}>Giao hàng nhanh, ăn ngon lành</Text>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            editable={!loading}
            style={styles.input}
            placeholder="Nhập email của bạn"
          />

          <TextInput
            label="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            editable={!loading}
            style={styles.input}
            placeholder="Nhập mật khẩu"
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye' : 'eye-off'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          {/* Error message */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Demo credentials hint
          <View style={styles.hintBox}>
            <Text style={styles.hintText}>
              📌 Tài khoản demo:
            </Text>
            <Text style={styles.hintValue}>Email: tigiang2004@gmail.com</Text>
            <Text style={styles.hintValue}>Mật khẩu: 123456</Text>
          </View> */}

          {/* Login button */}
          <Button
            mode="contained"
            onPress={handleLogin}
            disabled={loading}
            style={styles.loginButton}
            contentStyle={styles.buttonContent}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size={20} />
            ) : (
              'Đăng nhập'
            )}
          </Button>

          {/* Forgot password link */}
          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={() => navigation.navigate('ForgotPassword')}
            disabled={loading}
          >
            <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
          </TouchableOpacity>
        </View>

        {/* Sign up section */}
        <View style={styles.signupSection}>
          <Text style={styles.signupText}>Bạn chưa có tài khoản? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('SignUp')}
            disabled={loading}
          >
            <Text style={styles.signupLink}>Đăng ký ngay</Text>
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
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
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
    marginBottom: 30,
  },
  input: {
    marginBottom: 16,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '500',
  },
  hintBox: {
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  hintText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 4,
  },
  hintValue: {
    fontSize: 12,
    color: '#E65100',
    marginBottom: 2,
  },
  loginButton: {
    backgroundColor: '#FF6B35',
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '600',
  },
  signupSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  signupText: {
    fontSize: 14,
    color: '#666',
  },
  signupLink: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
});
