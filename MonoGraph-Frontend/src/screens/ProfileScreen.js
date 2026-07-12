
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import api from '../services/api';
import { normalizeUser } from '../utils/marketplace';
import { ActionPill, ScreenShell, SectionHeader, StatTile } from '../components/ui';
import { ItemCard, TextRow } from '../components/cards';

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api
      .get('/user/profile')
      .then((res) => setProfile(normalizeUser(res?.data?.data?.user || {})))
      .catch(() => {
        setProfile({
          name: 'Zahra Ahmadi',
          email: 'zahra.ahmadi@gmail.com',
          avatar: null,
          phone: '',
        });
      });
  }, []);

  return (
    <ScreenShell contentClassName="px-5 pb-6 pt-4">
      <View className="items-center">
        <View className="h-20 w-20 items-center justify-center rounded-full border-2 border-white bg-[#dbe7e6]">
          <Text className="text-[20px] font-bold text-[#365354]">
            {profile?.name?.slice(0, 1)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <Text className="mt-4 text-[18px] font-bold text-[#eff5f4]">{profile?.name || 'Your profile'}</Text>
        <Text className="mt-1 text-[11px] text-[#91a7a6]">{profile?.email || 'Connected account'}</Text>
        <View className="mt-3">
          <ActionPill label="Edit profile" />
        </View>
      </View>

      <View className="mt-6 flex-row gap-3">
        <StatTile value="18" label="Listed" />
        <StatTile value="27" label="Sold" />
        <StatTile value="4.9" label="Rating" />
      </View>

      <View className="mt-7">
        <SectionHeader title="Favorite Items" actionLabel="See all" />
        <View className="mt-2">
          <ItemCard
            compact
            item={{
              id: 'favorite-item',
              title: 'Saved item',
              description: 'Backend favorites will populate this slot.',
              price: '—',
              rating: '5.0',
              categoryName: 'Favorite',
            }}
          />
        </View>
      </View>

      <View className="mt-5">
        <SectionHeader title="Favorite Shops" />
        <View className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-2">
          <TextRow label="Settings" value="" />
          <TextRow label="My listings" value="" />
          <TextRow label="Orders & messages" value="" />
          <TextRow label="Language: EN / عربي / فارسی" value="" />
          <TextRow label="Log out" value="" />
        </View>
      </View>
    </ScreenShell>
  );
}
