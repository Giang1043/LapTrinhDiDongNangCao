import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity, View, Switch, Alert } from 'react-native';
import React, { useState } from 'react';

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TabThreeScreen() {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);

  // Hàm xử lý đăng xuất giả lập
  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất không?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đồng ý', style: 'destructive' },
    ]);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="gear" // Hoặc icon tương ứng trong thư viện của bạn
          style={styles.headerImage}
        />
      }>
      
      {/* --- PHẦN THÔNG TIN NGƯỜI DÙNG --- */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Tài khoản</ThemedText>
      </ThemedView>

      <ThemedView style={styles.profileSection}>
        <Image
          style={styles.avatar}
          source="https://github.com/shadcn.png" // Thay bằng URL avatar thực tế
          contentFit="cover"
          transition={1000}
        />
        <View style={styles.profileInfo}>
          <ThemedText type="subtitle">Cao Cự Giang</ThemedText>
          <ThemedText style={{ color: '#808080' }}>GiangHocDiDong@example.com</ThemedText>
          <TouchableOpacity style={styles.editButton}>
            <ThemedText type="defaultSemiBold" style={styles.editButtonText}>Chỉnh sửa hồ sơ</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>

      <View style={styles.separator} />

      {/* --- NHÓM 1: CÀI ĐẶT CHUNG --- */}
      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Cài đặt chung</ThemedText>
        
        {/* Toggle Dark Mode */}
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <IconSymbol name="moon.fill" size={20} color="#808080" style={styles.rowIcon} />
            <ThemedText>Giao diện tối</ThemedText>
          </View>
          <Switch value={isDarkTheme} onValueChange={setIsDarkTheme} />
        </View>

        {/* Toggle Thông báo */}
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <IconSymbol name="bell.fill" size={20} color="#808080" style={styles.rowIcon} />
            <ThemedText>Thông báo</ThemedText>
          </View>
          <Switch value={isNotificationEnabled} onValueChange={setIsNotificationEnabled} />
        </View>
      </ThemedView>

      {/* --- NHÓM 2: TÀI KHOẢN & BẢO MẬT --- */}
      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Bảo mật</ThemedText>
        
        <TouchableOpacity style={styles.row}>
          <View style={styles.rowLeft}>
            <IconSymbol name="lock.fill" size={20} color="#808080" style={styles.rowIcon} />
            <ThemedText>Đổi mật khẩu</ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={18} color="#C7C7CC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <View style={styles.rowLeft}>
            <IconSymbol name="shield.fill" size={20} color="#808080" style={styles.rowIcon} />
            <ThemedText>Xác thực 2 lớp (2FA)</ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={18} color="#C7C7CC" />
        </TouchableOpacity>
      </ThemedView>

      {/* --- NHÓM 3: HỖ TRỢ & PHÁP LÝ (Sử dụng Collapsible & ExternalLink) --- */}
      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Thông tin khác</ThemedText>
        
        <Collapsible title="Điều khoản dịch vụ">
          <ThemedText>
            Bằng việc sử dụng ứng dụng, bạn đồng ý với các điều khoản... {' '}
            <ExternalLink href="https://example.com/terms">
              <ThemedText type="link">Xem thêm trên web</ThemedText>
            </ExternalLink>
          </ThemedText>
        </Collapsible>

        <Collapsible title="Chính sách bảo mật">
          <ThemedText>
            Chúng tôi cam kết bảo vệ dữ liệu cá nhân của bạn theo tiêu chuẩn quốc tế.
          </ThemedText>
        </Collapsible>
      </ThemedView>

      {/* --- NÚT ĐĂNG XUẤT --- */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <ThemedText style={styles.logoutText}>Đăng xuất</ThemedText>
      </TouchableOpacity>
      
      <View style={{ marginBottom: 40 }} />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  // Style cho phần Profile
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    backgroundColor: '#e1e1e1',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  editButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#007AFF',
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#38383A', // Màu divider tối nhẹ
    opacity: 0.2,
    marginBottom: 24,
  },
  // Style cho các Section
  sectionContainer: {
    marginBottom: 24,
    gap: 8,
  },
  sectionTitle: {
    marginBottom: 8,
    fontSize: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#38383A',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowIcon: {
    width: 24, 
    textAlign: 'center', // Căn giữa icon nếu kích thước khác nhau
  },
  // Nút đăng xuất
  logoutButton: {
    marginTop: 10,
    padding: 16,
    backgroundColor: '#FF3B30', // Màu đỏ cảnh báo
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});