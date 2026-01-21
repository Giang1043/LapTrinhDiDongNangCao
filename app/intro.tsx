import React, { useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function IntroScreen() {
  const router = useRouter();

  useEffect(() => {
    // Chờ 10 giây sau đó chuyển sang trang Home
    const timer = setTimeout(() => {
      // Dùng 'replace' để người dùng không thể back lại trang intro
      router.replace('/(tabs)');
    }, 10000);

    // Dọn dẹp timer nếu người dùng thoát app giữa chừng
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('@/assets/images/react-logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
        
        <ThemedText type="title" style={styles.brandName}>
          Quán ăn ngon của Giang
        </ThemedText>

        <ThemedText style={styles.slogan}>
          Hương vị đậm đà - Tinh hoa ẩm thực
        </ThemedText>
      </View>

      {/* Loading indicator để người dùng biết app đang chạy */}
      <View style={styles.footer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>Đang vào bếp chuẩn bị món...</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 80,
  },
  content: {
    alignItems: 'center',
    marginTop: 100,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  brandName: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  slogan: {
    marginTop: 10,
    fontSize: 16,
    fontStyle: 'italic',
    color: '#808080',
  },
  footer: {
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 12,
    color: '#808080',
  }
});
