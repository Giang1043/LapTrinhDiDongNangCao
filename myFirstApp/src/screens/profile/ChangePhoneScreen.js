import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import useAuthStore from '../../store/authStore';

export default function ChangePhoneScreen({ navigation }) {
  const { user } = useAuthStore();
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleUpdatePhone = async () => {
    if (!/^0\d{9}$/.test(phone)) {
      return Alert.alert('Lỗi', 'Số điện thoại không hợp lệ');
    }
    setLoading(true);
    try {
      // In a real app, you would call an API to update phone
      // For now, just show success
      Alert.alert('Thành công', 'Cập nhật số điện thoại thành công');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật số điện thoại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>SĐT hiện tại: {user?.phone}</Text>
      <TextInput 
        label="Số điện thoại mới" 
        value={phone} 
        onChangeText={setPhone} 
        mode="outlined" 
        keyboardType="phone-pad" 
        style={styles.input} 
      />
      <Button 
        mode="contained" 
        onPress={handleUpdatePhone} 
        loading={loading} 
        style={styles.button} 
        buttonColor="#FF6B35"
      >
        Cập nhật
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  label: { fontSize: 14, color: '#666', marginBottom: 16 },
  input: { marginBottom: 12 },
  button: { marginTop: 8, borderRadius: 8 },
});
