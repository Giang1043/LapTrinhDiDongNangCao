import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import profileService from '../../services/profileService';
import { sendOTP, verifyOTP } from '../../services/otpService';

const ChangePhoneScreen = ({ navigation }) => {
  const { currentUser, logout, updateAuthData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [form, setForm] = useState({
    newPhone: '',
    otp: '',
  });

  const handleRequestPhoneChange = async () => {
    if (!form.newPhone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại mới');
      return;
    }

    try {
      setLoading(true);
      
      // Step 1: Validate phone and check
      const checkResult = await profileService.requestPhoneChange(currentUser.id, form.newPhone);
      if (!checkResult.success) {
        Alert.alert('Lỗi', checkResult.message);
        return;
      }

      // Step 2: Send OTP to new phone
      const otpResult = await sendOTP(form.newPhone);
      if (!otpResult.success) {
        Alert.alert('Lỗi', otpResult.message);
        return;
      }

      Alert.alert('Thành công', `OTP đã được gửi đến ${form.newPhone}\n\n📱 OTP test: ${otpResult.otp}`);
      setStep('otp');
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Yêu cầu thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPhoneChange = async () => {
    if (!form.otp.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập OTP');
      return;
    }

    try {
      setLoading(true);
      
      // Step 1: Verify OTP first
      const verifyResult = await verifyOTP(form.newPhone, form.otp, 'signup');
      if (!verifyResult.success) {
        Alert.alert('Lỗi', verifyResult.message);
        return;
      }

      // Step 2: Update phone in database
      const updateResult = await profileService.confirmPhoneChange(
        currentUser.id,
        form.newPhone,
        form.otp
      );

      if (!updateResult.success) {
        Alert.alert('Lỗi', updateResult.message);
        return;
      }

      // Update currentUser state immediately
      if (updateAuthData) {
        await updateAuthData(updateResult.user);
      }

      Alert.alert('Thành công', 'Số điện thoại đã được thay đổi!\n\nVui lòng đăng nhập lại', [
        {
          text: 'OK',
          onPress: async () => {
            try {
              // Verify logout is a function before calling
              if (typeof logout === 'function') {
                await logout();
              } else {
                // If logout doesn't exist, force navigate to Login manually
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              }
            } catch (e) {
              console.log('Logout error:', e);
              // Ensure we navigate even if logout fails
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Xác nhận thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      const result = await sendOTP(form.newPhone);
      if (result.success) {
        Alert.alert('Thành công', `OTP mới đã được gửi\n\n📱 OTP test: ${result.otp}`);
      } else {
        Alert.alert('Lỗi', result.message);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Gửi lại OTP thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'phone') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.label}>Số điện thoại hiện tại</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={currentUser?.phone || 'Chưa có'}
            editable={false}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Số điện thoại mới</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập số điện thoại mới"
            value={form.newPhone}
            onChangeText={(text) => setForm({ ...form, newPhone: text })}
            keyboardType="phone-pad"
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleRequestPhoneChange}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Tiếp tục</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Số điện thoại mới: {form.newPhone}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Nhập OTP</Text>
        <Text style={styles.hint}>Vui lòng nhập mã OTP được gửi đến số điện thoại mới</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập 6 chữ số OTP"
          value={form.otp}
          onChangeText={(text) => setForm({ ...form, otp: text })}
          keyboardType="number-pad"
          maxLength={6}
          editable={!loading}
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleConfirmPhoneChange}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Xác nhận</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleResendOTP} disabled={loading}>
        <Text style={styles.resendText}>Gửi lại OTP</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setStep('phone')} disabled={loading}>
        <Text style={styles.backText}>← Quay lại</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  submitButton: {
    backgroundColor: '#FF6B6B',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendText: {
    textAlign: 'center',
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
  },
  backText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 16,
  },
});

export default ChangePhoneScreen;
