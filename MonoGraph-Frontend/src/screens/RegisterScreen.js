import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import api from '../services/api';
import { ScreenShell, SubmitButton, TextField } from '../components/ui';
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

      const res = await api.register({
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
      saveSession({ user, accessToken, refreshToken }).catch(() => { });
      navigation.navigate('MainTabs');
    } catch (error) {
      const message = error?.response?.data?.message || 'Registration failed.';
      Alert.alert('Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell contentClassName="flex-1 justify-center px-6 pb-10 pt-6">
      {/* Brand / header block */}
      <View className=" items-center">
        <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-[#0f6b75]/15">
          <View className="h-9 w-9 rounded-xl bg-[#0f6b75]" />
        </View>
        <Text className="text-[24px] font-bold text-[#e9f1f0]">{getText(language, 'register')}</Text>
        <Text className=" text-center text-[13px] leading-5 text-[#99acac]">
          {getText(language, 'welcome')}
        </Text>
      </View>

      {/* Form card — groups the fields visually instead of floating on the bg */}
      <View className="gap-4 rounded-2xl  border border-[#DDEAE8] bg-[#F1F8F8] p-5 pt-2">
        <View className="gap-2">
          <Text className="text-[12px] font-medium text-[#99acac]">{getText(language, 'fullName')}</Text>
          <TextField
            placeholder={getText(language, 'fullName')}
            value={fullname}
            onChangeText={setName}
          />
        </View>

        <View className="gap-2">
          <Text className="text-[12px] font-medium text-[#99acac]">{getText(language, 'email')}</Text>
          <TextField
            placeholder={getText(language, 'email')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View className="gap-2">
          <Text className="text-[12px] font-medium text-[#99acac]">{getText(language, 'password')}</Text>
          <TextField
            placeholder={getText(language, 'password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
      </View>

      <View className="mt-6">
        <SubmitButton
          label={getText(language, 'register')}
          loadingLabel={getText(language, 'creatingAccount')}
          onPress={onRegister}
          loading={loading}
        />
      </View>

      <Pressable onPress={() => navigation.navigate('Login')} className="mt-6 py-2">
        <Text className="text-center text-[13px] text-[#c2d1d0]">
          {getText(language, 'alreadyHaveAccount')}
        </Text>
      </Pressable>
    </ScreenShell>
  );
}