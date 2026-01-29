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
import { validateRegisterForm } from '@/utils/validation';

const RegisterScreen: React.FC = () => {
  const router = useRouter();
  const { register, isLoading } = useAuth();

  const [step, setStep] = useState<'register' | 'otp'>('register');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    fullName: '',
    password: '',
    confirmPassword: '',
  });

  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState(0);

  const handleRegisterSubmit = useCallback(async () => {
    // Validate form
    const { valid, errors: formErrors } = validateRegisterForm(formData);

    if (!valid) {
      setErrors(formErrors);
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ và chính xác thông tin');
      return;
    }

    setErrors({});

    try {
      await register({
        email: formData.email,
        phone: formData.phone,
        fullName: formData.fullName,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

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
      Alert.alert('Lỗi đăng ký', error.message || 'Vui lòng thử lại');
    }
  }, [formData, register]);

  const handleOTPSubmit = useCallback(async () => {
    if (otp.length !== 6) {
      Alert.alert('Lỗi', 'OTP phải có 6 chữ số');
      return;
    }

    try {
      // Lấy OTP ID từ storage
      const { getRegistrationOtpId } = await import('@/utils/storage');
      const otpId = await getRegistrationOtpId();

      if (!otpId) {
        Alert.alert('Lỗi', 'Không tìm thấy OTP ID');
        return;
      }

      const { verifyOTP } = useAuth();
      await verifyOTP({ otpId, otp });

      Alert.alert('Thành công', 'Đăng ký thành công!');
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Lỗi xác minh', error.message || 'OTP không chính xác');
    }
  }, [otp, router]);

  const handleInputChange = useCallback(
    (field: string, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
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

  const handleResendOTP = useCallback(async () => {
    try {
      await register({
        email: formData.email,
        phone: formData.phone,
        fullName: formData.fullName,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

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
  }, [formData, register]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
            <Text style={styles.subtitle}>Nhập mã OTP được gửi tới {formData.email}</Text>
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
              <Text style={styles.verifyButtonText}>Xác Minh</Text>
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
            onPress={() => setStep('register')}
            disabled={isLoading}
          >
            <Text style={styles.backText}>← Quay lại</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Register Form
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
          <Text style={styles.title}>Đăng Ký</Text>
          <Text style={styles.subtitle}>Tạo tài khoản mới</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Full Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ Tên</Text>
            <View style={[styles.inputContainer, errors.fullName && styles.inputError]}>
              <TextInput
                style={styles.input}
                placeholder="Nhập họ tên"
                placeholderTextColor="#999"
                value={formData.fullName}
                onChangeText={(value) => handleInputChange('fullName', value)}
                editable={!isLoading}
              />
            </View>
            {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputContainer, errors.email && styles.inputError]}>
              <TextInput
                style={styles.input}
                placeholder="example@email.com"
                placeholderTextColor="#999"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                editable={!isLoading}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* Phone Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số Điện Thoại</Text>
            <View style={[styles.inputContainer, errors.phone && styles.inputError]}>
              <TextInput
                style={styles.input}
                placeholder="0912345678"
                placeholderTextColor="#999"
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                editable={!isLoading}
                keyboardType="phone-pad"
              />
            </View>
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật Khẩu</Text>
            <View style={[styles.inputContainer, errors.password && styles.inputError]}>
              <TextInput
                style={styles.input}
                placeholder="Ít nhất 8 ký tự, chữ hoa, chữ thường, số"
                placeholderTextColor="#999"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
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
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Xác Nhận Mật Khẩu</Text>
            <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
              <TextInput
                style={styles.input}
                placeholder="Nhập lại mật khẩu"
                placeholderTextColor="#999"
                value={formData.confirmPassword}
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

        {/* Register Button */}
        <TouchableOpacity
          style={[styles.registerButton, isLoading && styles.buttonDisabled]}
          onPress={handleRegisterSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.registerButtonText}>Tiếp Tục</Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Đã có tài khoản? </Text>
          <TouchableOpacity
            onPress={() => router.push('../login')}
            disabled={isLoading}
          >
            <Text style={styles.loginLink}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
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
  registerButton: {
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
  registerButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: '#999',
    fontSize: 14,
  },
  loginLink: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '700',
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
  verifyButton: {
    backgroundColor: '#FF6B35',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  verifyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
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
  backText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default RegisterScreen;
