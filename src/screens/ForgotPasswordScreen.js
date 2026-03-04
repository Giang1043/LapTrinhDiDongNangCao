import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { TextInput, Button, Text, Appbar } from 'react-native-paper';
import { requestForgotPasswordOTP } from '../services/authService';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOTP = async () => {
    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await requestForgotPasswordOTP(email);
      
      // Thông báo OTP đã được gửi
      Alert.alert(
        'Thành công',
        'OTP đã được gửi tới email của bạn. Vui lòng kiểm tra email (bao gồm thư mục Spam).',
        [
          {
            text: 'OK',
            onPress: () => {
              // Chuyển sang OTP verification screen (skipSendOTP=true để tránh gửi lại OTP)
              navigation.navigate('OTPVerification', {
                email,
                type: 'forgot_password',
                skipSendOTP: true, // Không gửi lại OTP, vì đã gửi rồi
              });
            },
          },
        ]
      );
    } catch (err) {
      setError(err.message || 'Yêu cầu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Quên mật khẩu" />
      </Appbar.Header>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>🔑 Quên mật khẩu?</Text>
          <Text style={styles.headerSubtitle}>
            Nhập email của bạn để nhận OTP đặt lại mật khẩu
          </Text>
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

          {/* Error message */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Info box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              📧 Một mã OTP sẽ được gửi đến email của bạn. Sử dụng mã này để xác thực và đặt lại mật khẩu.
            </Text>
          </View>

          {/* Request button */}
          <Button
            mode="contained"
            onPress={handleRequestOTP}
            disabled={loading || !email}
            style={styles.requestButton}
            contentStyle={styles.buttonContent}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size={20} />
            ) : (
              'Gửi mã OTP'
            )}
          </Button>

          {/* Back to login */}
          <Text style={styles.backText}>
            Quay lại{' '}
            <Text
              style={styles.backLink}
              onPress={() => navigation.navigate('Login')}
            >
              Đăng nhập
            </Text>
          </Text>
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
    lineHeight: 20,
  },
  formSection: {
    marginBottom: 20,
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
  infoBox: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    borderRadius: 4,
    padding: 12,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 13,
    color: '#2E7D32',
    lineHeight: 18,
  },
  requestButton: {
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
