import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Button, Text, Appbar } from 'react-native-paper';
import { activateAccount } from '../services/authService';

export default function OTPActivationScreen({
  navigation,
  route,
  onActivationSuccess,
}) {
  const { email } = route?.params || {};
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleActivate = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await activateAccount(email);
      if (result.success && result.token) {
        // Gọi callback để lưu token và user info
        onActivationSuccess({
          user: result.user,
          token: result.token,
        });
      }
    } catch (err) {
      setError(err.message || 'Kích hoạt tài khoản thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Kích hoạt tài khoản" />
      </Appbar.Header>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Success check */}
        <View style={styles.successSection}>
          <Text style={styles.checkmark}>✓</Text>
          <Text style={styles.successTitle}>OTP xác thực thành công!</Text>
          <Text style={styles.successSubtitle}>
            Email của bạn đã được xác thực thành công
          </Text>
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📋 Thông tin tài khoản:</Text>
          <Text style={styles.infoText}>Email: {email}</Text>
          <Text style={[styles.infoText, { marginTop: 8 }]}> 
            Nhấn "Kích hoạt tài khoản" để hoàn thành quy trình đăng ký 
            </Text>
        </View>

        {/* Error message */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Activate button */}
        <Button
          mode="contained"
          onPress={handleActivate}
          disabled={loading}
          style={styles.activateButton}
          contentStyle={styles.buttonContent}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size={20} />
          ) : (
            'Kích hoạt tài khoản'
          )}
        </Button>

        {/* Go to login */}
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Login')}
          disabled={loading}
          style={styles.backButton}
          contentStyle={styles.buttonContent}
        >
          Quay lại đăng nhập
        </Button>
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
    paddingVertical: 40,
  },
  successSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  checkmark: {
    fontSize: 60,
    color: '#4CAF50',
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 13,
    color: '#2E7D32',
    lineHeight: 20,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    marginBottom: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  activateButton: {
    backgroundColor: '#4CAF50',
    marginBottom: 12,
  },
  backButton: {
    borderColor: '#FF6B35',
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
