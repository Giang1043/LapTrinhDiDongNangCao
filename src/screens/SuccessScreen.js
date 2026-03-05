import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';

export default function SuccessScreen({ navigation, route }) {
  const { message = 'Thành công!', countdown = 5 } = route?.params || {};
  const [timeLeft, setTimeLeft] = useState(countdown);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainStack' }],
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000); // ← Thay từ 5000 thành 1000

    return () => clearInterval(interval);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Success icon */}
        <Text style={styles.successIcon}>✅</Text>

        {/* Message */}
        <Text style={styles.message}>{message}</Text>

        {/* Countdown */}
        <View style={styles.countdownBox}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.countdownText}>
            Chuyển đến trang chủ trong {timeLeft}s...
          </Text>
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Tài khoản của bạn đã được tạo và xác thực thành công. Chúng tôi sẽ chuyển bạn tới trang chủ.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 40,
    justifyContent: 'center',
    minHeight: '100%',
  },
  successIcon: {
    fontSize: 80,
    textAlign: 'center',
    marginBottom: 24,
  },
  message: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 32,
  },
  countdownBox: {
    alignItems: 'center',
    marginBottom: 32,
  },
  countdownText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoText: {
    fontSize: 13,
    color: '#2E7D32',
    lineHeight: 20,
    textAlign: 'center',
  },
});
