import React from 'react';
import { View, Text as RNText } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HomeScreen from '../screens/home/HomeScreen';
import SearchScreen from '../screens/search/SearchScreen';
import CartScreen from '../screens/cart/CartScreen';
import OrdersScreen from '../screens/orders/OrdersScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import useCartStore from '../store/cartStore';

const Tab = createBottomTabNavigator();

function CartIcon({ focused, color, size }) {
  const itemCount = useCartStore(s => s.getItemCount());
  return (
    <View>
      <MaterialCommunityIcons name={focused ? 'cart' : 'cart-outline'} size={size} color={color} />
      {itemCount > 0 && (
        <View style={{ position: 'absolute', top: -4, right: -10, backgroundColor: '#FF3B30', borderRadius: 9, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center' }}>
          <RNText style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{itemCount > 99 ? '99+' : itemCount}</RNText>
        </View>
      )}
    </View>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Cart') return <CartIcon focused={focused} color={color} size={size} />;
          let iconName;
          switch (route.name) {
            case 'Home': iconName = focused ? 'home' : 'home-outline'; break;
            case 'Search': iconName = focused ? 'magnify' : 'magnify'; break;
            case 'Orders': iconName = focused ? 'clipboard-list' : 'clipboard-list-outline'; break;
            case 'Profile': iconName = focused ? 'account' : 'account-outline'; break;
          }
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#999',
        headerStyle: { backgroundColor: '#FF6B35' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Trang chủ' }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: 'Tìm kiếm' }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{ title: 'Giỏ hàng' }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ title: 'Đơn hàng' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Tài khoản' }} />
    </Tab.Navigator>
  );
}
