
import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import api from '../services/api';
import { ScreenShell, TextField } from '../components/ui';
import { setUser } from '../store/slices/authSlice';

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter email and password.');
      return;
    }

    try {
      setLoading(true);

      const res = await api.post('/user/login', {
        email: email.trim(),
        password,
      });

      const user = res?.data?.data?.user;
      const token = res?.data?.accessToken;

      if (!user || !token) {
        throw new Error('Missing auth payload');
      }

      dispatch(setUser({ user, token }));
      Alert.alert('Success', 'You are now logged in.');
      navigation.navigate('MainTabs');
    } catch (error) {
      const message = error?.response?.data?.message || 'Login failed.';
      Alert.alert('Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell contentClassName="px-5 pb-6 pt-4">
      <Text className="text-[20px] font-bold text-[#e9f1f0]">Login</Text>
      <Text className="mt-1 text-[12px] text-[#99acac]">Sign in to add businesses and items.</Text>

      <View className="mt-5 gap-3">
        <TextField
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextField placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      </View>

      <Pressable
        onPress={onLogin}
        disabled={loading}
        className={`mt-4 rounded-2xl px-4 py-3 ${loading ? 'bg-[#96afb0]' : 'bg-[#0f6b75]'}`}
      >
        <Text className="text-center text-[13px] font-semibold text-white">{loading ? 'Logging in...' : 'Login'}</Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate('Register')} className="mt-4">
        <Text className="text-center text-[12px] text-[#c2d1d0]">No account? Register</Text>
      </Pressable>
    </ScreenShell>
  );
}
