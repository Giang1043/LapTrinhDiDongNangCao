import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import {
  isValidEmail,
  validateResetPasswordForm,
} from '@/utils/validation';

const ForgotPasswordScreen: React.FC = () => {
  const router = useRouter();
  const { forgotPassword, resetPassword, isLoading } = useAuth();

  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetData, setResetData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState(0);

  const handleEmailSubmit = useCallback(async () => {
    if (!email) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    try {
      await forgotPassword({ email });

      // Chuyển sang step xác minh OTP
      setStep('otp');
      setOtpExpiry(300); // 5 phút

      // Timer countdown
      const timer = setInterval(() => {
        setOtpExpiry((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      Alert.alert('Thành công', 'OTP đã được gửi đến email của bạn');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Yêu cầu khôi phục thất bại');
    }
  }, [email, forgotPassword]);

  const handleOTPSubmit = useCallback(async () => {
    if (otp.length !== 6) {
      Alert.alert('Lỗi', 'OTP phải có 6 chữ số');
      return;
    }

    // Chuyển sang step đặt lại mật khẩu
    setStep('reset');
    setOtp('');
    setResetData({
      newPassword: '',
      confirmPassword: '',
    });
  }, [otp]);

  const handleResetSubmit = useCallback(async () => {
    // Validate form
    const { valid, errors: formErrors } = validateResetPasswordForm(resetData);

    if (!valid) {
      setErrors(formErrors);
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ và chính xác thông tin');
      return;
    }

    setErrors({});

    try {
      // Lấy OTP ID từ storage
      const { getResetPasswordOtpId } = await import('@/utils/storage');
      const otpId = await getResetPasswordOtpId();

      if (!otpId) {
        Alert.alert('Lỗi', 'Không tìm thấy OTP ID');
        return;
      }

      await resetPassword({
        otpId,
        otp,
        newPassword: resetData.newPassword,
        confirmPassword: resetData.confirmPassword,
      });

      Alert.alert('Thành công', 'Đặt lại mật khẩu thành công!');
      router.replace('../login');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Đặt lại mật khẩu thất bại');
    }
  }, [resetData, otp, resetPassword, router]);

  const handleResendOTP = useCallback(async () => {
    try {
      await forgotPassword({ email });

      setOtp('');
      setOtpExpiry(300);

      const timer = setInterval(() => {
        setOtpExpiry((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      Alert.alert('Thành công', 'OTP mới đã được gửi');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Gửi lại OTP thất bại');
    }
  }, [email, forgotPassword]);

  const handleInputChange = useCallback(
    (field: string, value: string) => {
      setResetData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Step 1: Email
  if (step === 'email') {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Quên Mật Khẩu?</Text>
            <Text style={styles.subtitle}>Nhập email để nhận OTP xác minh</Text>
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputContainer, errors.email && styles.inputError]}>
              <TextInput
                style={styles.input}
                placeholder="example@email.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                editable={!isLoading}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.buttonDisabled]}
            onPress={handleEmailSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>Tiếp Tục</Text>
            )}
          </TouchableOpacity>

          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.push('../login')}
            disabled={isLoading}
          >
            <Text style={styles.backText}>← Quay lại đăng nhập</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Step 2: OTP
  if (step === 'otp') {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Xác Minh OTP</Text>
            <Text style={styles.subtitle}>Nhập mã OTP được gửi tới {email}</Text>
          </View>

          {/* OTP Input */}
          <View style={styles.otpSection}>
            <Text style={styles.label}>Mã OTP</Text>
            <TextInput
              style={[styles.otpInput, otp.length !== 6 && styles.otpInputInvalid]}
              placeholder="000000"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              editable={!isLoading}
              placeholderTextColor="#CCC"
            />
            {otp.length === 6 && <Text style={styles.otpValid}>✓</Text>}
          </View>

          {/* Expiry Timer */}
          {otpExpiry > 0 && (
            <Text style={styles.expiryText}>
              OTP hết hạn trong: <Text style={styles.expiryTimer}>{formatTime(otpExpiry)}</Text>
            </Text>
          )}

          {otpExpiry === 0 && (
            <Text style={styles.expiredText}>OTP của bạn đã hết hạn</Text>
          )}

          {/* Verify Button */}
          <TouchableOpacity
            style={[styles.verifyButton, (isLoading || otp.length !== 6) && styles.buttonDisabled]}
            onPress={handleOTPSubmit}
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.verifyButtonText}>Tiếp Tục</Text>
            )}
          </TouchableOpacity>

          {/* Resend OTP */}
          <TouchableOpacity
            onPress={handleResendOTP}
            disabled={isLoading || otpExpiry > 0}
            style={styles.resendContainer}
          >
            <Text style={[styles.resendText, otpExpiry > 0 && styles.resendDisabled]}>
              {otpExpiry > 0 ? `Gửi lại OTP sau ${formatTime(otpExpiry)}` : 'Gửi lại OTP'}
            </Text>
          </TouchableOpacity>

          {/* Back Button */}
          <TouchableOpacity
            onPress={() => {
              setStep('email');
              setOtp('');
            }}
            disabled={isLoading}
          >
            <Text style={styles.backText}>← Quay lại</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Step 3: Reset Password
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Đặt Lại Mật Khẩu</Text>
          <Text style={styles.subtitle}>Nhập mật khẩu mới</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* New Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật Khẩu Mới</Text>
            <View style={[styles.inputContainer, errors.newPassword && styles.inputError]}>
              <TextInput
                style={styles.input}
                placeholder="Ít nhất 8 ký tự, chữ hoa, chữ thường, số"
                placeholderTextColor="#999"
                value={resetData.newPassword}
                onChangeText={(value) => handleInputChange('newPassword', value)}
                secureTextEntry={!showPassword}
                editable={!isLoading}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                <Text style={styles.passwordToggleText}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Xác Nhận Mật Khẩu</Text>
            <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
              <TextInput
                style={styles.input}
                placeholder="Nhập lại mật khẩu"
                placeholderTextColor="#999"
                value={resetData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                secureTextEntry={!showPassword}
                editable={!isLoading}
                autoCapitalize="none"
              />
            </View>
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>
        </View>

        {/* Reset Button */}
        <TouchableOpacity
          style={[styles.resetButton, isLoading && styles.buttonDisabled]}
          onPress={handleResetSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.resetButtonText}>Đặt Lại Mật Khẩu</Text>
          )}
        </TouchableOpacity>

        {/* Back Button */}
        <TouchableOpacity
          onPress={() => setStep('otp')}
          disabled={isLoading}
        >
          <Text style={styles.backText}>← Quay lại</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 14,
    color: '#333',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 5,
  },
  passwordToggle: {
    padding: 8,
  },
  passwordToggleText: {
    fontSize: 18,
  },
  submitButton: {
    backgroundColor: '#FF6B35',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  verifyButton: {
    backgroundColor: '#FF6B35',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: '#FF6B35',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  verifyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resetButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  backText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  // OTP Styles
  otpSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  otpInput: {
    width: '100%',
    height: 60,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: '#333',
    letterSpacing: 12,
  },
  otpInputInvalid: {
    borderColor: '#FF6B6B',
  },
  otpValid: {
    position: 'absolute',
    right: 10,
    fontSize: 24,
    color: '#4CAF50',
  },
  expiryText: {
    textAlign: 'center',
    color: '#999',
    marginBottom: 20,
  },
  expiryTimer: {
    fontWeight: '700',
    color: '#FF6B35',
  },
  expiredText: {
    textAlign: 'center',
    color: '#FF6B6B',
    marginBottom: 20,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resendText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '600',
  },
  resendDisabled: {
    color: '#CCC',
  },
});

export default ForgotPasswordScreen;
