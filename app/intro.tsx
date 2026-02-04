import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function IntroScreen() {
  const router = useRouter();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
  }, 10000); 
  return () => clearTimeout(timer);
  }, []); 

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/icon.png')}
        style={styles.logo}
      />
      <Text style={styles.welcomeText}>Welcome to my app!</Text>
      <Text style={styles.authorText}>App created by Giang</Text>
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    borderRadius: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  authorText: {
    fontSize: 16,
    marginTop: 10,
    color: '#888',
  },
});