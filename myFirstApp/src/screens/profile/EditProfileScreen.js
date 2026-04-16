import React, { useState } from 'react';
import { View, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import useAuthStore from '../../store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EditProfileScreen({ navigation }) {
  const { user } = useAuthStore();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Cần quyền truy cập thư viện ảnh');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ tên');
      return;
    }
    setLoading(true);
    // Mock update
    setTimeout(async () => {
      const updatedUser = { ...user, fullName: fullName.trim(), avatar };
      useAuthStore.setState({ user: updatedUser });
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setLoading(false);
      Alert.alert('Thành công', 'Cập nhật hồ sơ thành công');
      navigation.goBack();
    }, 500);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
        <Image source={{ uri: avatar || 'https://i.pravatar.cc/150?img=3' }} style={styles.avatar} />
        <View style={styles.editIcon}>
          <MaterialCommunityIcons name="camera" size={20} color="#fff" />
        </View>
      </TouchableOpacity>

      <TextInput
        label="Họ và tên"
        value={fullName}
        onChangeText={setFullName}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Email"
        value={user?.email}
        mode="outlined"
        disabled
        style={styles.input}
      />

      <TextInput
        label="Số điện thoại"
        value={user?.phone}
        mode="outlined"
        disabled
        style={styles.input}
      />

      <Button mode="contained" onPress={handleSave} loading={loading} style={styles.button} buttonColor="#FF6B35">
        Lưu thay đổi
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  avatarContainer: { alignSelf: 'center', marginBottom: 24 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#FF6B35' },
  editIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#FF6B35', borderRadius: 15, width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
  input: { marginBottom: 12 },
  button: { marginTop: 16, borderRadius: 8 },
});
