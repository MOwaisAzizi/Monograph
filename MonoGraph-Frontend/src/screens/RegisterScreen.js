
import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import api from '../services/api';
import { ScreenShell, TextField } from '../components/ui';
import { setUser } from '../store/slices/authSlice';

export default function RegisterScreen({ navigation }) {
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please fill name, email and password.');
      return;
    }

    try {
      setLoading(true);

      const res = await api.post('/user/signup', {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      const user = res?.data?.data?.user;
      const token = res?.data?.accessToken;

      if (!user || !token) {
        throw new Error('Missing auth payload');
      }

      dispatch(setUser({ user, token }));
      Alert.alert('Success', 'Account created and logged in.');
      navigation.navigate('MainTabs');
    } catch (error) {
      const message = error?.response?.data?.message || 'Registration failed.';
      Alert.alert('Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell contentClassName="px-5 pb-6 pt-4">
      <Text className="text-[20px] font-bold text-[#e9f1f0]">Register</Text>
      <Text className="mt-1 text-[12px] text-[#99acac]">Create your account to list shops and items.</Text>

      <View className="mt-5 gap-3">
        <TextField placeholder="Full name" value={name} onChangeText={setName} />
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
        onPress={onRegister}
        disabled={loading}
        className={`mt-4 rounded-2xl px-4 py-3 ${loading ? 'bg-[#96afb0]' : 'bg-[#0f6b75]'}`}
      >
        <Text className="text-center text-[13px] font-semibold text-white">
          {loading ? 'Creating account...' : 'Register'}
        </Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate('Login')} className="mt-4">
        <Text className="text-center text-[12px] text-[#c2d1d0]">Already have an account? Login</Text>
      </Pressable>
    </ScreenShell>
  );
}
