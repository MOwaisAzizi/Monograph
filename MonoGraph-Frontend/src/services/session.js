import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'secondhand.auth.session';

const saveWebSession = (session) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

const loadWebSession = () => {
  const value = localStorage.getItem(SESSION_KEY);

  if (!value) return null;

  try {
    const session = JSON.parse(value);

    return session?.accessToken && session?.refreshToken ? session : null;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

const clearWebSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const saveSession = async ({ user, accessToken, refreshToken }) => {
  const session = {
    user,
    accessToken,
    refreshToken,
  };

  if (Platform.OS === 'web') {
    saveWebSession(session);
    return;
  }

  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
};

export const loadSession = async () => {
  if (Platform.OS === 'web') {
    return loadWebSession();
  }

  const value = await SecureStore.getItemAsync(SESSION_KEY);

  if (!value) return null;

  try {
    const session = JSON.parse(value);

    return session?.accessToken && session?.refreshToken ? session : null;
  } catch {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    return null;
  }
};

export const clearStoredSession = async () => {
  if (Platform.OS === 'web') {
    clearWebSession();
    return;
  }

  await SecureStore.deleteItemAsync(SESSION_KEY);
};
