import React from 'react';
import { Pressable, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import ProductScreen from '../screens/ProductScreen';
import ShopScreen from '../screens/TalkScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FavoritesScreen from '../screens/History';
import ShopDetailScreen from '../screens/ShopDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AddListingScreen from '../screens/AddListingScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0d6f7a',
        tabBarInactiveTintColor: '#8aa0a0',
        tabBarStyle: {
          backgroundColor: '#eef5f5',
          borderTopColor: '#d8e4e3',
          height: 66,
          paddingTop: 7,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size, focused }) => {
          const icons = {
            Home: focused ? 'home' : 'home-outline',
            Search: focused ? 'search' : 'search-outline',
            Talk: focused ? 'chatbubbles' : 'chatbubbles-outline',
            History: focused ? 'receipt' : 'receipt-outline',
            Profile: focused ? 'person' : 'person-outline',
          };

          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            // Tapping the Search tab icon just refocuses the existing
            // screen instance — it does NOT call navigate() with fresh
            // params, so a category filter set on a previous visit (e.g.
            // via Home's filter row, which navigates into this same tab)
            // would otherwise stay applied forever. If there's no active
            // filter/search already, there's nothing to reset — skip it
            // to avoid an unnecessary extra render/refetch on every tap.
            if (route.params?.search || route.params?.category) {
              e.preventDefault();
              navigation.navigate('Search', { search: '', category: '' });
            }
          },
        })}
      />
      <Tab.Screen name="Talk" component={ShopScreen} />
      <Tab.Screen name="History" component={FavoritesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AddListing"
        component={AddListingScreen}
        options={{
          title: '',
          headerStyle: { backgroundColor: '#eef5f5' },
          headerTitleStyle: { color: '#203030', fontWeight: '700' },
        }}
      />

      <Stack.Screen name="Product" component={ProductScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="ShopDetail"
        component={ShopDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
