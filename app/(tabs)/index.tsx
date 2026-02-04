import { Image } from 'expo-image';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header Section */}
      <ThemedView style={styles.headerSection}>
        <View style={styles.avatarContainer}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.avatar}
          />
        </View>
        <View style={styles.greetingContainer}>
          <ThemedText type="title" style={styles.greeting}>
            Xin chào!
          </ThemedText>
          <HelloWave />
        </View>
      </ThemedView>

      {/* About Section */}
      <ThemedView style={[styles.section, { backgroundColor: isDark ? '#1D3D47' : '#A1CEDC' }]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Về Tôi
        </ThemedText>
        <ThemedText style={styles.description}>
          Tôi là Cao Cự Giang.  Là một lập trình viên.
        </ThemedText>
      </ThemedView>

      {/* Skills Section */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Kỹ Năng
        </ThemedText>
        <View style={styles.skillsContainer}>
          {['React Native', 'TypeScript', 'Expo', 'React', 'JavaScript'].map((skill, index) => (
            <View key={index} style={[styles.skillBadge, { borderColor: Colors[colorScheme ?? 'light'].tint }]}>
              <ThemedText style={styles.skillText}>{skill}</ThemedText>
            </View>
          ))}
        </View>
      </ThemedView>

      {/* Contact Section */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Liên Hệ
        </ThemedText>
        <View style={styles.contactContainer}>
          <TouchableOpacity
            style={[styles.contactButton, { borderColor: Colors[colorScheme ?? 'light'].tint }]}
            onPress={() => Linking.openURL('mailto:tigiang2004@gmail.com')}
          >
            <ThemedText style={styles.contactButtonText}>📧 Email</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.contactButton, { borderColor: Colors[colorScheme ?? 'light'].tint }]}
            onPress={() => Linking.openURL('https://github.com/Giang1043')}
          >
            <ThemedText style={styles.contactButtonText}>💻 GitHub</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.contactButton, { borderColor: Colors[colorScheme ?? 'light'].tint }]}
            onPress={() => Linking.openURL('https://www.linkedin.com/in/giang-cao-a15a3b3a0/')}
          >
            <ThemedText style={styles.contactButtonText}>💼 LinkedIn</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>

      {/* Experience Section */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Kinh Nghiệm
        </ThemedText>
        <View style={styles.experienceItem}>
          <ThemedText type="defaultSemiBold">Lập Trình Viên Mobile</ThemedText>
          <ThemedText style={styles.experienceDetails}>
            Phát triển ứng dụng di động sử dụng React Native và Expo
          </ThemedText>
        </View>
        <View style={styles.experienceItem}>
          <ThemedText type="defaultSemiBold">Lập Trình Viên Web</ThemedText>
          <ThemedText style={styles.experienceDetails}>
            Xây dựng các ứng dụng web với React và JavaScript
          </ThemedText>
        </View>
      </ThemedView>

      {/* Footer */}
      <ThemedView style={styles.footer}>
        <ThemedText style={styles.footerText}>
          © 2026 - Tất cả quyền được bảo lưu bởi Giang Cao
          Tạo cái footerText để nhìn thử. 
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

import { TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#0a7ea4',
  },
  greetingContainer: {
    alignItems: 'center',
  },
  greeting: {
    marginBottom: 8,
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  description: {
    lineHeight: 24,
    marginBottom: 8,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  skillText: {
    fontSize: 13,
    fontWeight: '500',
  },
  contactContainer: {
    gap: 10,
  },
  contactButton: {
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  experienceItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  experienceDetails: {
    marginTop: 4,
    fontSize: 13,
    opacity: 0.7,
  },
  footer: {
    marginTop: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  footerText: {
    fontSize: 12,
    opacity: 0.6,
  },
});
