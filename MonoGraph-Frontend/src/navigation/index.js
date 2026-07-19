
import React from 'react';
import { Pressable, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import ProductScreen from '../screens/ProductScreen';
import ShopScreen from '../screens/ShopScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
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
            Shops: focused ? 'storefront' : 'storefront-outline',
            Favorites: focused ? 'heart' : 'heart-outline',
            Profile: focused ? 'person' : 'person-outline',
          };

          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Shops" component={ShopScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
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
        options={({ navigation }) => ({
          title: 'MonoGraph',
          headerStyle: { backgroundColor: '#eef5f5' },
          headerTitleStyle: { color: '#203030', fontWeight: '700' },
          headerRight: () => (
            <Pressable
              onPress={() => navigation.navigate('AddListing')}
              style={{
                backgroundColor: '#0f6b75',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12 }}>
                Add Shop / Item
              </Text>
            </Pressable>
          ),
        })}
      />
      <Stack.Screen
        name="AddListing"
        component={AddListingScreen}
        options={{
          title: 'Add Business or Item',
          headerStyle: { backgroundColor: '#eef5f5' },
          headerTitleStyle: { color: '#203030', fontWeight: '700' },
        }}
      />
      <Stack.Screen name="Product" component={ProductScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ShopDetail" component={ShopDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
