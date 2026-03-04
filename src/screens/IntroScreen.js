import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';

export default function IntroScreen({ navigation, isLoggedIn, authChecked, onIntroFinish }) {
  const [countdown, setCountdown] = useState(10);
  const hasNavigatedRef = useRef(false);

  // Effect 1: Handle navigation khi countdown = 0
  useEffect(() => {
    if (countdown === 0 && !hasNavigatedRef.current && authChecked) {
      hasNavigatedRef.current = true;
      
      // Gỏi callback để RootNavigator update isAppStarted = true
      if (onIntroFinish) {
        onIntroFinish();
      }
      
      // Sau khi finish Intro, thực hiện navigate
      if (isLoggedIn) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainStack' }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'AuthStack' }],
        });
      }
    }
  }, [countdown, authChecked, isLoggedIn]);

  // Effect 2: Countdown timer
  useEffect(() => {
    const countdownTimer = setInterval(() => {
      setCountdown(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../assets/icon.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>FoodApp</Text>
        <Text style={styles.subtitle}>Giao hàng nhanh, ăn ngon lành</Text>
        <Text style={styles.countdownText}>{countdown}s</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8f9ace',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 10,
  },
  countdownText: {
    fontSize: 14,
    color: '#fff',
    marginTop: 20,
    opacity: 0.7,
  },
});
