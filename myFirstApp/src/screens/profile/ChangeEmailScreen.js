import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import useAuthStore from '../../store/authStore';

export default function ChangeEmailScreen({ navigation }) {
  const { user } = useAuthStore();
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  const handleUpdateEmail = async () => {
    if (!/\S+@\S+\.\S+/.test(email)) {
      return Alert.alert('Lỗi', 'Email không hợp lệ');
    }
    setLoading(true);
    try {
      // In a real app, you would call an API to update email
      // For now, just show success
      Alert.alert('Thành công', 'Cập nhật email thành công');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Email hiện tại: {user?.email}</Text>
      <TextInput 
        label="Email mới" 
        value={email} 
        onChangeText={setEmail} 
        mode="outlined" 
        keyboardType="email-address" 
        style={styles.input} 
      />
      <Button 
        mode="contained" 
        onPress={handleUpdateEmail} 
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
