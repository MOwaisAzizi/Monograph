import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // add this

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import ProductScreen from '../screens/ProductScreen';
import TalkScreen from '../screens/TalkScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FavoritesScreen from '../screens/History';
import ShopDetailScreen from '../screens/ShopDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AddListingScreen from '../screens/AddListingScreen';
import ChatScreen from '../screens/ChatScreen';
import ConfirmBuyScreen from '../screens/ConfirmBuyScreen';
import OfferStatusScreen from '../screens/OfferStatusScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const insets = useSafeAreaInsets(); // add this
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0d6f7a',
        tabBarInactiveTintColor: '#8aa0a0',
        tabBarStyle: {
          backgroundColor: '#eef5f5',
          borderTopColor: '#d8e4e3',
          height: 56 + insets.bottom, // was: 66
          paddingTop: 7,
          paddingBottom: insets.bottom + 10, // was: 10
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
            if (route.params?.search || route.params?.category) {
              e.preventDefault();
              navigation.navigate('Search', { search: '', category: '' });
            }
          },
        })}
      />
      <Tab.Screen name="Talk" component={TalkScreen} />
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
        options={{ headerShown: false }}
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
      <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="ConfirmBuy"
        component={ConfirmBuyScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OfferStatus"
        component={OfferStatusScreen}
        options={{ headerShown: false }}
      />
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