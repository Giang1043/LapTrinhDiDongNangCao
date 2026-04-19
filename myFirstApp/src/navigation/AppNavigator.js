import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import useAuthStore from '../store/authStore';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import ProductDetailScreen from '../screens/product/ProductDetailScreen';
import CategoryProductsScreen from '../screens/home/CategoryProductsScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import ChangePhoneScreen from '../screens/profile/ChangePhoneScreen';
import ChangeEmailScreen from '../screens/profile/ChangeEmailScreen';
import CheckoutScreen from '../screens/cart/CheckoutScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { isLoggedIn, loadSession } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await loadSession();
      setIsReady(true);
    };
    init();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#FF6B35' }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: 'bold' } }}>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Chi tiết sản phẩm' }} />
          <Stack.Screen name="CategoryProducts" component={CategoryProductsScreen} options={{ title: 'Danh mục' }} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Chỉnh sửa hồ sơ' }} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Đổi mật khẩu' }} />
          <Stack.Screen name="ChangePhone" component={ChangePhoneScreen} options={{ title: 'Đổi số điện thoại' }} />
          <Stack.Screen name="ChangeEmail" component={ChangeEmailScreen} options={{ title: 'Đổi email' }} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Thanh toán' }} />
          <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Chi tiết đơn hàng' }} />
        </Stack.Navigator>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
