import React, { useEffect, useMemo, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, Text, TextInput, View, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';
import { normalizeUser, normalizeItem, normalizeShop } from '../helpers/marketplace';
import { ActionPill, ScreenShell, SectionHeader, StatTile } from '../components/ui';
import { ItemCard, ShopCard, TextRow } from '../components/cards';
import { useDispatch, useSelector } from 'react-redux';
import { logout, setUser } from '../store/slices/authSlice';
import { setLanguage } from '../store/slices/languageSlice';
import { LANGUAGE_OPTIONS, LANGUAGE_NAMES, getText } from '../i18n';
import { clearStoredSession, saveSession } from '../services/session';
// import LocationPickerMap from '../components/LocationPickerMap';

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ fullname: '', phone: '' });
  const [addressPickerOpen, setAddressPickerOpen] = useState(false);
  const [addressLocation, setAddressLocation] = useState(null);
  const [addressFields, setAddressFields] = useState({ fullAddress: '' });
  const { user, accessToken, refreshToken } = useSelector((state) => state.auth);
  const currentLanguage = useSelector((state) => state.language.currentLanguage);
  const dispatch = useDispatch();

  const logoutuser = async () => {
    try {
      await api.baseURL.post('/user/logout');
    } catch {}
    api.clearSession();
    dispatch(logout());
    clearStoredSession().catch(() => {});
    setProfile(null);
  };

  const handleSelectAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.9,
    });
    if (result.canceled || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];
    setMediaFile(asset);
  };

  const startEditing = () => {
    setForm({
      fullname: profile?.fullname?.split(' ')[0] || '',
      phone: Array.isArray(profile?.phone) ? profile.phone.join(', ') : profile?.phone || '',
    });
    setMediaFile(null);
    setEditing(true);
  };

  const openAddressPicker = () => {
    const coordinates = profile?.location?.geoPosition?.coordinates;
    setAddressLocation(coordinates ? { lng: coordinates[0], lat: coordinates[1] } : null);
    setAddressFields({ fullAddress: profile?.address || '' });
    setAddressPickerOpen(true);
  };

  const saveAddress = async () => {
    if (!addressLocation) return;
    try {
      setSaving(true);
      const payload = new FormData();
      payload.append('location', JSON.stringify({
        address: addressFields.fullAddress.trim(),
        geoPosition: { type: 'Point', coordinates: [addressLocation.lng, addressLocation.lat] },
      }));
      const updatedUser = await api.updateProfile(payload);
      const normalizedUser = normalizeUser(updatedUser);
      setProfile((current) => ({ ...current, ...normalizedUser }));
      dispatch(setUser({ user: updatedUser, accessToken, refreshToken }));
      saveSession({ user: updatedUser, accessToken, refreshToken }).catch(() => {});
      setAddressPickerOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const saveProfile = async () => {
    if (!form.fullname.trim()) return;

    try {
      setSaving(true);

      const payload = new FormData();

      payload.append('fullname', form.fullname.trim());

      payload.append(
        'phone',
        JSON.stringify(
          form.phone
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean),
        ),
      );

      if (mediaFile) {
        if (Platform.OS === 'web') {
          const response = await fetch(mediaFile.uri);
          const blob = await response.blob();

          payload.append('profile', blob, mediaFile.name || 'profile-avatar.jpg');
        } else {
          payload.append('profile', {
            uri: mediaFile.uri,
            name: mediaFile.name || 'profile-avatar.jpg',
            type: mediaFile.mimeType || 'image/jpeg',
          });
        }
      }

      const updatedUser = await api.updateProfile(payload);

      const normalizedUser = normalizeUser(updatedUser);

      setProfile((current) => ({
        ...current,
        ...normalizedUser,
      }));

      dispatch(
        setUser({
          user: updatedUser,
          accessToken,
          refreshToken,
        }),
      );

      saveSession({
        user: updatedUser,
        accessToken,
        refreshToken,
      }).catch(() => {});

      setEditing(false);
    } catch {
    } finally {
      setSaving(false);
    }
  };
  useEffect(() => {
    if (!accessToken) return;

    let mounted = true;

    api.baseURL
      .get('/user/profile', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => {
        if (!mounted) return;
        const rawUser = res?.data?.data?.user || {};
        const normalizedUser = normalizeUser(rawUser);
        setProfile({
          ...normalizedUser,
          favoriteItems: (rawUser.favoriteItems || []).map(normalizeItem),
          favoriteShops: (rawUser.favoriteShops || []).map(normalizeShop),
        });

        if (normalizedUser.preferredLanguage) {
          dispatch(setLanguage(normalizedUser.preferredLanguage));
        }
      })
      .catch(() => {
        if (mounted) setProfile(null);
      });

    return () => {
      mounted = false;
    };
  }, [accessToken, dispatch]);

  const handleToggleFavoriteItem = async (itemId) => {
    try {
      await api.toggleFavorite(itemId, null);
      setProfile((current) => ({
        ...current,
        favoriteItems: current.favoriteItems.filter((i) => i.id !== itemId),
      }));
    } catch {}
  };

  const t = useMemo(
    () => ({
      profile: getText(currentLanguage, 'profile'),
      login: getText(currentLanguage, 'login'),
      logout: getText(currentLanguage, 'logout'),
      favoriteItems: getText(currentLanguage, 'favoriteItems'),
      favoriteShops: getText(currentLanguage, 'favoriteShops'),
      settings: getText(currentLanguage, 'settings'),
      myListings: getText(currentLanguage, 'myListings'),
      ordersMessages: getText(currentLanguage, 'ordersMessages'),
      language: getText(currentLanguage, 'language'),
      noFavoriteItems: getText(currentLanguage, 'noFavoriteItems'),
      noFavoriteShops: getText(currentLanguage, 'noFavoriteShops'),
      connectedAccount: getText(currentLanguage, 'connectedAccount'),
      yourProfile: getText(currentLanguage, 'yourProfile'),
      addListing: getText(currentLanguage, 'addListing'),
    }),
    [currentLanguage],
  );

  const [stats, setStats] = useState({
    listed: 0,
    sold: 0,
    rating: 0,
  });

 useEffect(() => {
  let isMounted = true;

  const loadStats = async () => {
    try {
      const data = await api.getUserStats();
      if (isMounted) setStats(data);
    } catch (error) {
      console.error("Failed to load profile stats:", error);
    }
  };

  loadStats();
  return () => { isMounted = false; };
}, []);

  return (
    <ScreenShell contentClassName="px-5 pb-6 pt-4">
      <View className="items-center">
        <Pressable
          onPress={user ? startEditing : undefined}
          className="h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#dbe7e6]"
        >
          {profile?.avatar ? (
            <Image source={{ uri: profile.avatar }} className="h-full w-full" />
          ) : (
            <Text className="text-[20px] font-bold text-[#365354]">
              {profile?.fullname?.slice(0, 1)?.toUpperCase() || 'U'}
            </Text>
          )}
        </Pressable>

        {user ? (
          <Text className="mt-4 text-[18px] font-bold text-[#394240]">{profile?.fullname}</Text>
        ) : (
          <View className="mt-4">
            <ActionPill label={t.login} onPress={() => navigation.navigate('Login')} />
          </View>
        )}

        {/* <Text className="mt-1 text-[11px] text-[#91a7a6]">
        {profile?.email || t.connectedAccount}
      </Text>

      {user && (profile?.phone) ? (
        <View className="mt-2 items-center">
          {profile?.phone ? <Text className="text-[11px] text-[#91a7a6]">{Array.isArray(profile.phone) ? profile.phone.join(', ') : profile.phone}</Text> : null}
        </View>
      ) : null} */}
      </View>

      <View className="mt-6 flex-row gap-3">
        <StatTile value={stats.listed} label="Listed" />
        <StatTile value={stats.sold} label="Sold" />
        <StatTile value={stats.rating} label="Rating" />
      </View>

      <View className="mt-7">
        <SectionHeader title={t.favoriteItems} actionLabel="See all" />
        {profile?.favoriteItems?.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-2"
            contentContainerClassName="gap-3"
          >
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
            <Text className="text-[12px] text-[#89a1a1]">{t.noFavoriteItems}</Text>
          </View>
        )}
      </View>

      <View className="mt-5">
        <SectionHeader title={t.favoriteShops} />
        {profile?.favoriteShops?.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-2"
            contentContainerClassName="gap-4"
          >
            {profile.favoriteShops.map((shop) => (
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
            <Text className="text-[12px] text-[#89a1a1]">{t.noFavoriteShops}</Text>
          </View>
        )}
      </View>

      <View className="mt-5">
        <View className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-2">
          <TextRow label={t.settings} value="" />
          <TextRow label={t.myListings} value="" />
          <TextRow label={t.ordersMessages} value="" />
          {user ? <TextRow label="Add Address" value={profile?.address || ''} onPress={openAddressPicker} /> : null}
          <TextRow label={t.addListing} onPress={() => navigation.navigate('AddListing')} />
          {user ? <TextRow label={t.logout} onPress={logoutuser} /> : null}

          <Pressable
            onPress={() => setShowLanguageMenu(true)}
            className="flex-row items-center justify-between rounded-2xl border-b border-[#d9e3e2] py-3"
          >
            <Text className="text-[12px] text-[#213233]">{t.language}</Text>
            <Text className="text-[12px] font-semibold text-[#7a8f8f]">
              {LANGUAGE_NAMES[currentLanguage]}
            </Text>
          </Pressable>
        </View>
      </View>

      <Modal
        visible={addressPickerOpen}
        animationType="slide"
        onRequestClose={() => setAddressPickerOpen(false)}
      >
        <View className="flex-1 bg-[#eef5f5] px-5 pt-14">
          <Text className="mb-4 text-[18px] font-bold text-[#233334]">Add Address</Text>
          {/* <LocationPickerMap
            mode="profile"
            initialLocation={addressLocation}
            fields={addressFields}
            onFieldsChange={setAddressFields}
            onLocationSelected={(lat, lng) => setAddressLocation({ lat, lng })}
          /> */}
          <View className="mt-5 flex-row gap-3">
            <Pressable onPress={() => setAddressPickerOpen(false)} className="flex-1 rounded-xl border border-[#9aabab] py-3"><Text className="text-center font-semibold text-[#314243]">Cancel</Text></Pressable>
            <Pressable onPress={saveAddress} disabled={!addressLocation || saving} className="flex-1 rounded-xl bg-[#0f6b75] py-3"><Text className="text-center font-semibold text-white">{saving ? 'Saving...' : 'Save address'}</Text></Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={showLanguageMenu}
        animationType="fade"
        onRequestClose={() => setShowLanguageMenu(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setShowLanguageMenu(false)}
        >
          <View className="rounded-t-[28px] bg-[#eef5f5] p-4">
            <Text className="mb-3 text-[15px] font-bold text-[#233334]">{t.language}</Text>
            {LANGUAGE_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={async () => {
                  dispatch(setLanguage(option.value));
                  if (accessToken) {
                    try {
                      await api.baseURL.patch(
                        '/user/profile',
                        { preferredLanguage: option.value },
                        { headers: { Authorization: `Bearer ${accessToken}` } },
                      );
                    } catch {}
                  }
                  setShowLanguageMenu(false);
                }}
                className={`mb-2 rounded-2xl px-4 py-3 ${currentLanguage === option.value ? 'bg-[#0f6b75]' : 'bg-white'}`}
              >
                <Text
                  className={`text-[13px] font-semibold ${currentLanguage === option.value ? 'text-white' : 'text-[#314243]'}`}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Modal
        transparent
        visible={editing}
        animationType="slide"
        onRequestClose={() => setEditing(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="rounded-t-[28px] bg-[#eef5f5] p-5">
            <Text className="text-[18px] font-bold text-[#233334]">Edit your profile</Text>
            <Pressable
              onPress={handleSelectAvatar}
              className="mt-4 self-start rounded-xl bg-[#dbe7e6] px-4 py-3"
            >
              <Text className="font-semibold text-[#314243]">
                {mediaFile ? 'Image selected' : 'Choose profile image'}
              </Text>
            </Pressable>
            {[
              ['fullname', 'fullname'],
              ['phone', 'Phone number'],
            ].map(([key, label]) => (
              <View
                key={key}
                className="mt-3 rounded-xl border border-[#d9e5e4] bg-white px-3 py-2"
              >
                <TextInput
                  value={form[key]}
                  onChangeText={(value) => setForm((current) => ({ ...current, [key]: value }))}
                  placeholder={label}
                  placeholderTextColor="#8ba0a0"
                  className="p-1 text-[#213233]"
                />
              </View>
            ))}
            <View className="mt-5 flex-row gap-3">
              <Pressable
                onPress={() => setEditing(false)}
                className="flex-1 rounded-xl border border-[#9aabab] py-3"
              >
                <Text className="text-center font-semibold text-[#314243]">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={saveProfile}
                disabled={saving}
                className="flex-1 rounded-xl bg-[#0f6b75] py-3"
              >
                <Text className="text-center font-semibold text-white">
                  {saving ? 'Saving...' : 'Save changes'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenShell>
  );
}
