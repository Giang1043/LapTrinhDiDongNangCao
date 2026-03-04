import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  Text as RNText,
} from 'react-native';
import { TextInput, Button, Text, Appbar } from 'react-native-paper';
import { resetPasswordWithOTP } from '../services/passwordService';

export default function ResetPasswordScreen({ navigation, route }) {
  const { email, otp: initialOtp } = route?.params || {};
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleResetPassword = async () => {
    setError('');

    // Validation
    if (!initialOtp || initialOtp.length !== 6) {
      setError('OTP không hợp lệ');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('Mật khẩu phải tối thiểu 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPasswordWithOTP(email, initialOtp, newPassword);
      if (result.success) {
        // Thông báo thành công và quay về login
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'Login',
              params: {
                message: 'Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại.',
              },
            },
          ],
        });
      }
    } catch (err) {
      setError(err.message || 'Đặt lại mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Đặt lại mật khẩu" />
      </Appbar.Header>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>🔐 Đặt lại mật khẩu</Text>
          <Text style={styles.headerSubtitle}>
            Nhập mật khẩu mới của bạn
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          {/* Email display */}
          <View style={styles.emailBox}>
            <Text style={styles.emailLabel}>Email:</Text>
            <Text style={styles.emailValue}>{email}</Text>
          </View>

          {/* New Password */}
          <TextInput
            label="Mật khẩu mới"
            value={newPassword}
            onChangeText={setNewPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            editable={!loading}
            style={styles.input}
            placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye' : 'eye-off'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          {/* Confirm Password */}
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

          {/* Info box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 Mật khẩu phải có tối thiểu 6 ký tự. Chọn mật khẩu mạnh để bảo vệ tài khoản của bạn.
            </Text>
          </View>

          {/* Reset button */}
          <Button
            mode="contained"
            onPress={handleResetPassword}
            disabled={loading || !newPassword || !confirmPassword}
            style={styles.resetButton}
            contentStyle={styles.buttonContent}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size={20} />
            ) : (
              'Đặt lại mật khẩu'
            )}
          </Button>

          {/* Back to login */}
          <RNText style={styles.backText}>
            Quụy lại{' '}
            <RNText
              style={styles.backLink}
              onPress={() => navigation.navigate('Login')}
            >
              Đăng nhập
            </RNText>
          </RNText>
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
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 20,
  },
  emailBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  emailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    fontWeight: '600',
  },
  emailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
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
  infoBox: {
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
    borderRadius: 4,
    padding: 12,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 12,
    color: '#E65100',
    lineHeight: 18,
  },
  resetButton: {
    backgroundColor: '#FF6B35',
    marginBottom: 20,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  backText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  backLink: {
    color: '#FF6B35',
    fontWeight: '600',
  },
});
