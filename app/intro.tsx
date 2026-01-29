import React, { useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function IntroScreen() {
  const router = useRouter();

  useEffect(() => {
    // Chờ 5 giây sau đó chuyển sang login
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 5000);

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

      {/* Loading indicator */}
      <View style={styles.footer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>Đang chuẩn bị...</ThemedText>
        
        {/* Quick navigation buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/(tabs)')}
          >
            <ThemedText style={styles.buttonText}>Đăng Nhập</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.push('/(tabs)')}
          >
            <ThemedText style={styles.secondaryButtonText}>Đăng Ký</ThemedText>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
    marginTop: 20,
  },
  button: {
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
});
