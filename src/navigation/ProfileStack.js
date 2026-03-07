import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import UserScreen from '../screens/UserScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import ChangePasswordScreen from '../screens/Profile/ChangePasswordScreen';
import ChangeEmailScreen from '../screens/Profile/ChangeEmailScreen';
import ChangePhoneScreen from '../screens/Profile/ChangePhoneScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';

const Stack = createNativeStackNavigator();

export default function ProfileStack({ onLogout }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="UserProfile" 
        options={{ title: 'Tài khoản' }}
      >
        {(props) => <UserScreen {...props} onLogout={onLogout} />}
      </Stack.Screen>

      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          headerShown: true,
          title: 'Chỉnh sửa thông tin',
          headerTintColor: '#fff',
          headerStyle: { backgroundColor: '#FF6B6B' },
        }}
      />

      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{
          headerShown: true,
          title: 'Đổi mật khẩu',
          headerTintColor: '#fff',
          headerStyle: { backgroundColor: '#FF6B6B' },
        }}
      />

      <Stack.Screen
        name="ChangeEmail"
        component={ChangeEmailScreen}
        options={{
          headerShown: true,
          title: 'Đổi email',
          headerTintColor: '#fff',
          headerStyle: { backgroundColor: '#FF6B6B' },
        }}
      />

      <Stack.Screen
        name="ChangePhone"
        component={ChangePhoneScreen}
        options={{
          headerShown: true,
          title: 'Đổi số điện thoại',
          headerTintColor: '#fff',
          headerStyle: { backgroundColor: '#FF6B6B' },
        }}
      />

      <Stack.Screen
        name="OrderHistory"
        component={OrderHistoryScreen}
        options={{
          headerShown: false,
          title: 'Lịch sử mua hàng',
        }}
      />

      <Stack.Screen
        name="OrderDetails"
        component={OrderDetailsScreen}
        options={{
          headerShown: false,
          title: 'Chi tiết đơn hàng',
        }}
      />
    </Stack.Navigator>
  );
}
