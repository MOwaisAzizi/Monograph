import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import api from '../services/api';
import { normalizeUser, normalizeItem, normalizeBusiness } from '../utils/marketplace';
import { ActionPill, ScreenShell, SectionHeader, StatTile } from '../components/ui';
import { ItemCard, ShopCard, TextRow } from '../components/cards';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const logoutuser = () => {
    dispatch(logout());
    setProfile(null);
  };

  useEffect(() => {
    if (!token) return;

    let mounted = true;

    api.baseURL
      .get('/user/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (!mounted) return;
        const rawUser = res?.data?.data?.user || {};
        console.log(rawUser)
        console.log('rawUs🌭🌭🌭er')
        setProfile({
          ...normalizeUser(rawUser),
          favoriteItems: (rawUser.favoriteItems || []).map(normalizeItem),
          favoriteBusinesses: (rawUser.favoriteBusinesses || []).map(normalizeBusiness),
        });
      })
      .catch((error) => {
        console.error('Error fetching profile:', error);
        if (mounted) setProfile(null);
      });

    return () => {
      mounted = false;
    };
  }, [token]);

  const handleToggleFavoriteItem = async (itemId) => {
    try {
      await api.toggleFavoriteDishs(itemId, null, token);
      setProfile((current) => ({
        ...current,
        favoriteItems: current.favoriteItems.filter((i) => i.id !== itemId),
      }));
    } catch (error) {
      console.error('Error toggling favorite item:', error);
    }
  };

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
        <View className="mt-2">
          {user ? (
            <ActionPill label="Logout" onPress={logoutuser} />
          ) : (
            <ActionPill label="Login" onPress={() => navigation.navigate('Login')} />
          )}
        </View>
      </View>

      <View className="mt-6 flex-row gap-3">
        <StatTile value="18" label="Listed" />
        <StatTile value="27" label="Sold" />
        <StatTile value="4.9" label="Rating" />
      </View>

      <View className="mt-7">
        <SectionHeader title="Favorite Items" actionLabel="See all" />
        {profile?.favoriteItems?.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2" contentContainerClassName="gap-3">
            {profile.favoriteItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                compact
                onPress={() => navigation.navigate('Product', { id: item.id })}
                onToggleFavorite={() => handleToggleFavoriteItem(item.id)}
              />
            ))}
          </ScrollView>
        ) : (
          <View className="mt-2 rounded-[24px] border border-dashed border-white/20 bg-white/5 px-4 py-5">
            <Text className="text-[12px] text-[#89a1a1]">No favorite items yet.</Text>
          </View>
        )}
      </View>

      <View className="mt-5">
        <SectionHeader title="Favorite Shops" />
        {profile?.favoriteBusinesses?.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2" contentContainerClassName="gap-4">
            {profile.favoriteBusinesses.map((shop) => (
              <ShopCard
                key={shop.id}
                shop={shop}
                compact
                onPress={() => navigation.navigate('ShopDetail', { id: shop.id })}
              />
            ))}
          </ScrollView>
        ) : (
          <View className="mt-2 rounded-[24px] border border-dashed border-white/20 bg-white/5 px-4 py-5">
            <Text className="text-[12px] text-[#89a1a1]">No favorite shops yet.</Text>
          </View>
        )}
      </View>

      <View className="mt-5">
        <View className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-2">
          <TextRow label="Settings" value="" />
          <TextRow label="My listings" value="" />
          <TextRow label="Orders & messages" value="" />
          <TextRow label="Language: EN / عربي / فارسی" value="" />
        </View>
      </View>
    </ScreenShell>
  );
}