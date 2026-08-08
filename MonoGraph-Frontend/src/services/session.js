import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'monograph.auth.session';

export const saveSession = ({ user, accessToken, refreshToken }) =>
  SecureStore.setItemAsync(SESSION_KEY, JSON.stringify({ user, accessToken, refreshToken }));

export const loadSession = async () => {
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

export const clearStoredSession = () => SecureStore.deleteItemAsync(SESSION_KEY);
