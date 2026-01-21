import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { Stack } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function HomeScreen() {
  return (
    <>
      {/* Cấu hình Header cho trang Home */}
      <Stack.Screen options={{ title: 'Trang chủ', headerShown: true }} />

      <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
        <ThemedView style={styles.container}>
          
          {/* Avatar / Ảnh đại diện */}
          <View style={styles.headerSection}>
            <Image
              source="https://github.com/shadcn.png"
              style={styles.avatar}
            />
            <ThemedText type="title">Xin chào, tôi là Cao Cự Giang</ThemedText>
            <ThemedText style={styles.subtitle}>Chủ quán & Bếp trưởng</ThemedText>
          </View>

          {/* Phần giới thiệu */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Giới thiệu</ThemedText>
            <ThemedText style={styles.paragraph}>
              Chào mừng bạn đến với ứng dụng của tôi. 
            </ThemedText>
          </View>

          {/* Phần thông tin liên hệ */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Thông tin liên hệ</ThemedText>
            
            <View style={styles.contactItem}>
              <IconSymbol name="phone.fill" size={20} color="#007AFF" />
              <ThemedText style={{ marginLeft: 10 }}>(+84) 37-5xx-4xxx</ThemedText>
            </View>
            
            <View style={styles.contactItem}>
              <IconSymbol name="envelope.fill" size={20} color="#007AFF" />
              <ThemedText style={{ marginLeft: 10 }}>22110132@student.hcmute.edu.vn</ThemedText>
            </View>

             <View style={styles.contactItem}>
              <IconSymbol name="map.fill" size={20} color="#007AFF" />
              <ThemedText style={{ marginLeft: 10 }}>Thủ Đức, TP Hồ Chí Minh</ThemedText>
            </View>
          </View>

        </ThemedView>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#e1e1e1',
  },
  subtitle: {
    fontSize: 18,
    color: '#808080',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    // Shadow nhẹ cho đẹp
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  paragraph: {
    marginTop: 8,
    lineHeight: 24,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
});