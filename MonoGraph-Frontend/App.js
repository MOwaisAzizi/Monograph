
import 'react-native-gesture-handler';
import './global.css';
import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation';
import { store } from './src/store';
import api from './src/services/api';
import { logout, updateTokens } from './src/store/slices/authSlice';

function AuthBridge() {
  const dispatch = useDispatch();
  useEffect(() => {
    api.setAuthCallbacks({ onTokensChanged: (tokens) => dispatch(updateTokens(tokens)), onUnauthorized: () => dispatch(logout()) });
  }, [dispatch]);
  return null;
}

export default function App() {
  return (
    <Provider store={store}>
      <AuthBridge />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </GestureHandlerRootView>
    </Provider>
  );
}
