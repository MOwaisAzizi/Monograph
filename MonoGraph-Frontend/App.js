import 'react-native-gesture-handler';
import './global.css';
import React, { useEffect, useState } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context'; // add this
import RootNavigator from './src/navigation';
import { store } from './src/store';
import api from './src/services/api';
import { logout, setUser, updateTokens } from './src/store/slices/authSlice';
import { clearStoredSession, loadSession, saveSession } from './src/services/session';

function AuthBridge({ onRestored }) {
  const dispatch = useDispatch();
  useEffect(() => {
    api.setAuthCallbacks({
      onTokensChanged: (tokens) => {
        dispatch(updateTokens(tokens));
        saveSession({ ...store.getState().auth, ...tokens }).catch(() => {});
      },
      onUnauthorized: () => {
        dispatch(logout());
        clearStoredSession().catch(() => {});
      },
    });

    loadSession()
      .then((session) => {
        if (!session) return;
        api.setSession(session);
        dispatch(setUser(session));
      })
      .catch(() => clearStoredSession())
      .finally(onRestored);
  }, [dispatch, onRestored]);
  return null;
}

export default function App() {
  const [sessionRestored, setSessionRestored] = useState(false);
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AuthBridge onRestored={() => setSessionRestored(true)} />
        {sessionRestored && (
          <GestureHandlerRootView style={{ flex: 1 }}>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </GestureHandlerRootView>
        )}
      </Provider>
    </SafeAreaProvider>
  );
}