import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import api from '../services/api';
import { ScreenShell, TextField } from '../components/ui';
import { setUser } from '../store/slices/authSlice';
import { saveSession } from '../services/session';
import { getText } from '../i18n';

export default function RegisterScreen({ navigation }) {
  const dispatch = useDispatch();
  const language = useSelector((state) => state.language.currentLanguage);

  const [fullname, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    if (!fullname.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please fill fullname, email and password.');
      return;
    }

    try {
      setLoading(true);

      const res = await api.baseURL.post('/user/signup', {
        fullname: fullname.trim(),
        email: email.trim(),
        password,
      });

      const user = res?.data?.data?.user;
      const accessToken = res?.data?.accessToken;
      const refreshToken = res?.data?.refreshToken;
      if (!user || !accessToken || !refreshToken) {
        throw new Error('Missing auth payload');
      }

      api.setSession({ accessToken, refreshToken });
      dispatch(setUser({ user, accessToken, refreshToken }));
      saveSession({ user, accessToken, refreshToken }).catch(() => {});
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
      <Text className="text-[20px] font-bold text-[#e9f1f0]">{getText(language, 'register')}</Text>
      <Text className="mt-1 text-[12px] text-[#99acac]">{getText(language, 'welcome')}</Text>

      <View className="mt-5 gap-3">
        <TextField placeholder={getText(language, 'fullName')} value={fullname} onChangeText={setName} />
        <TextField
          placeholder={getText(language, 'email')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextField
          placeholder={getText(language, 'password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <Pressable
        onPress={onRegister}
        disabled={loading}
        className={`mt-4 rounded-2xl px-4 py-3 ${loading ? 'bg-[#96afb0]' : 'bg-[#0f6b75]'}`}
      >
        <Text className="text-center text-[13px] font-semibold text-white">
          {loading ? getText(language, 'creatingAccount') : getText(language, 'register')}
        </Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate('Login')} className="mt-4">
        <Text className="text-center text-[12px] text-[#c2d1d0]">
          {getText(language, 'alreadyHaveAccount')}
        </Text>
      </Pressable>
    </ScreenShell>
  );
}
