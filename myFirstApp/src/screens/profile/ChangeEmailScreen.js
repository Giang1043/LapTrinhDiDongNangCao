import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import useAuthStore from '../../store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateOTP, storeOTP, verifyOTP } from '../../services/mockData';
import { sendOTPEmail } from '../../services/emailService';

export default function ChangeEmailScreen({ navigation }) {
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!/\S+@\S+\.\S+/.test(email)) {
      return Alert.alert('Lỗi', 'Email không hợp lệ');
    }
    setLoading(true);
    const newOtp = generateOTP();
    storeOTP(`email_${email}`, newOtp);
    // Gửi OTP đến email MỚI để xác thực
    await sendOTPEmail(email, newOtp, user?.fullName);
    setLoading(false);
    setStep(2);
    Alert.alert('OTP đã gửi', `Mã OTP đã gửi đến ${email}. Kiểm tra hộp thư.`);
  };

  const handleVerify = () => {
    if (otp.length !== 6) return Alert.alert('Lỗi', 'OTP phải có 6 số');
    setLoading(true);
    setTimeout(async () => {
      const valid = verifyOTP(`email_${email}`, otp);
      if (!valid) {
        setLoading(false);
        return Alert.alert('Lỗi', 'OTP không hợp lệ');
      }
      const updatedUser = { ...user, email };
      useAuthStore.setState({ user: updatedUser });
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setLoading(false);
      Alert.alert('Thành công', 'Đổi email thành công');
      navigation.goBack();
    }, 500);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.current}>Email hiện tại: {user?.email}</Text>
      {step === 1 ? (
        <>
          <TextInput label="Email mới" value={email} onChangeText={setEmail} mode="outlined" keyboardType="email-address" autoCapitalize="none" style={styles.input} />
          <Button mode="contained" onPress={handleSendOTP} loading={loading} style={styles.button} buttonColor="#FF6B35">Gửi OTP</Button>
        </>
      ) : (
        <>
          <Text style={styles.otpHint}>📧 OTP đã gửi qua email {email}</Text>
          <TextInput label="Nhập mã OTP" value={otp} onChangeText={t => setOtp(t.replace(/[^0-9]/g, '').slice(0, 6))} mode="outlined" keyboardType="number-pad" style={styles.input} />
          <Button mode="contained" onPress={handleVerify} loading={loading} style={styles.button} buttonColor="#FF6B35">Xác nhận</Button>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  current: { fontSize: 14, color: '#666', marginBottom: 16 },
  input: { marginBottom: 12 },
  button: { marginTop: 8, borderRadius: 8 },
  otpHint: { backgroundColor: '#fff3e0', padding: 10, borderRadius: 8, marginBottom: 12, textAlign: 'center', fontWeight: 'bold', color: '#FF6B35' },
});
