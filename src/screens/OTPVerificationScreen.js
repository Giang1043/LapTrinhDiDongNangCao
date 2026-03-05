import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { TextInput, Button, Text, Appbar } from 'react-native-paper';
import { verifyOTP, sendOTP, requestForgotPasswordOTP } from '../services/otpService';
import { activateAccount } from '../services/authService';

export default function OTPVerificationScreen({
  navigation,
  route,
  onActivationSuccess,
}) {
  const { email, type = 'signup', skipSendOTP = false } = route?.params || {};
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (email && !skipSendOTP) {
      sendOTPToEmail();
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsExpired(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Xử lý thông minh: Gửi đúng loại OTP dựa vào flow đang chạy
  const sendOTPToEmail = async () => {
    try {
      if (type === 'forgot_password') {
        await requestForgotPasswordOTP(email);
      } else {
        await sendOTP(email);
      }
    } catch (err) {
      console.log('Send OTP error:', err.message);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Vui lòng nhập đúng 6 chữ số OTP');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Truyền thêm 'type' vào hàm verifyOTP
      const result = await verifyOTP(email, otp, type);
      
      if (result.success) {
        if (type === 'signup') {
          try {
            const activationResult = await activateAccount(email);
            if (activationResult.success && activationResult.token && onActivationSuccess) {
              onActivationSuccess({
                user: activationResult.user,
                token: activationResult.token,
              });
              
              navigation.replace('Success', {
                message: 'Tạo tài khoản thành công',
                countdown: 3,
              });
            }
          } catch (activationErr) {
            setError(activationErr.message || 'Kích hoạt tài khoản thất bại');
          }
        } 
        else if (type === 'forgot_password') {
          navigation.replace('ResetPassword', { email, otp });
        }
      } else {
        setError(result.message || 'Mã OTP không chính xác');
      }
    } catch (err) {
      setError(err.message || 'Xác thực OTP thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    Alert.alert(
      'Gửi lại OTP',
      'Bạn có muốn gửi lại OTP không? Một OTP mới sẽ được gửi tới email của bạn.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Gửi lại',
          onPress: () => {
            setOtp('');
            setTimeLeft(300);
            setIsExpired(false);
            setError('');
            // Gọi lại hàm dùng chung
            sendOTPToEmail(); 
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Xác thực OTP" />
      </Appbar.Header>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>🔐 Xác thực OTP</Text>
          <Text style={styles.headerSubtitle}>Mã OTP đã được gửi tới {email}</Text>
        </View>

        {/* Timer */}
        <View style={[styles.timerBox, isExpired && styles.timerBoxExpired]}>
          <Text style={[styles.timerText, isExpired && styles.timerTextExpired]}>
            {isExpired ? 'OTP đã hết hạn' : formatTime(timeLeft)}
          </Text>
          <Text style={styles.timerLabel}>
            {isExpired ? 'Vui lòng yêu cầu OTP mới' : 'Còn lại'}
          </Text>
        </View>

        {/* OTP Input */}
        <View style={styles.formSection}>
          <Text style={styles.label}>Nhập mã OTP (6 chữ số):</Text>
          <TextInput
            label="OTP"
            value={otp}
            onChangeText={(text) => {
              if (/^\d{0,6}$/.test(text)) setOtp(text);
            }}
            mode="outlined"
            keyboardType="number-pad"
            maxLength={6}
            editable={!loading && !isExpired}
            style={styles.otpInput}
            placeholder="000000"
            placeholderTextColor="#ccc"
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 Tip: Nhập 6 chữ số OTP được gửi tới email của bạn. Nếu không nhận được, kiểm tra thư mục Spam.
            </Text>
          </View>

          <Button
            mode="contained"
            onPress={handleVerifyOTP}
            disabled={loading || !otp || otp.length !== 6 || isExpired}
            style={styles.verifyButton}
            contentStyle={styles.buttonContent}
          >
            {loading ? <ActivityIndicator color="#fff" size={20} /> : 'Xác thực OTP'}
          </Button>

          <Text style={styles.resendText}>
            Không nhận được OTP?{' '}
            <Text
              style={[styles.resendLink, (loading || !isExpired) && styles.resendLinkDisabled]}
              onPress={loading || !isExpired ? null : handleResendOTP}
            >
              Gửi lại
            </Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1 },
  contentContainer: { paddingHorizontal: 16, paddingVertical: 20 },
  headerSection: { alignItems: 'center', marginBottom: 30 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  headerSubtitle: { fontSize: 14, color: '#666', textAlign: 'center' },
  timerBox: { backgroundColor: '#E3F2FD', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 30, borderLeftWidth: 4, borderLeftColor: '#2196F3' },
  timerBoxExpired: { backgroundColor: '#FFEBEE', borderLeftColor: '#F44336' },
  timerText: { fontSize: 36, fontWeight: 'bold', color: '#2196F3', fontFamily: 'monospace' },
  timerTextExpired: { color: '#F44336' },
  timerLabel: { fontSize: 12, color: '#666', marginTop: 8 },
  formSection: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 12 },
  otpInput: { marginBottom: 16, fontSize: 24, letterSpacing: 8, textAlign: 'center' },
  errorText: { color: '#d32f2f', fontSize: 14, marginBottom: 12, fontWeight: '500' },
  infoBox: { backgroundColor: '#F5F5F5', borderRadius: 8, padding: 12, marginBottom: 20 },
  infoText: { fontSize: 12, color: '#666', lineHeight: 18 },
  verifyButton: { backgroundColor: '#FF6B35', marginBottom: 16 },
  buttonContent: { paddingVertical: 8 },
  resendText: { fontSize: 13, color: '#666', textAlign: 'center' },
  resendLink: { color: '#FF6B35', fontWeight: '600' },
  resendLinkDisabled: { opacity: 0.5 },
});
