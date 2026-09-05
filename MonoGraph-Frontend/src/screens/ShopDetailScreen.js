import React, { useState } from 'react';
import { Pressable, ScrollView, Text, Image, View } from 'react-native';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { useShopDetail } from '../hooks/useShopDetail';
import { ActionPill, Chip, DetailHeaderActions, ScreenShell, SectionHeader } from '../components/ui';
import { ItemCard, ShopCard } from '../components/cards';
import { getLocalizedValue, getText } from '../i18n';
import { ReviewSection } from '../components/ReviewComponents';

export default function ShopDetailScreen({ route, navigation }) {
  const currentLanguage = useSelector((state) => state.language.currentLanguage);
  const { id } = route.params;
  const user = useSelector((state) => state.auth.user);
  const { shop, items, similarShops, reviews, summary, saveReview } = useShopDetail(id);
  const [tab, setTab] = useState('items');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const toggleFavorite = async () => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }

    try {
      await api.toggleFavorite(null, id);
      setIsFavorite((value) => !value);
    } catch (error) {
      if (error?.response?.status === 401) {
        navigation.navigate('Login');
      }
    }
  };
  const toggleFollow = async () => {
    try {
      const response = await api.toggleFollowShop(id);
      setIsFollowing(response.data.data.following);
    } catch {
      navigation.navigate('Login');
    }
  };
  return (
    <ScreenShell scroll={false} contentClassName="flex-1 pb-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-2">
          <View className="h-56 rounded-[28px] bg-[#d6e3e2] overflow-hidden">
            <Image
              source={{
                uri:
                  shop?.coverImage ||
                  'https://via.placeholder.com/400x224/d6e3e2/9ab0b0?text=No+Cover',
              }}
              className="h-full w-full"
              style={{ resizeMode: 'cover' }}
            />
            <DetailHeaderActions
              onBack={() => navigation.goBack()}
              onFavorite={toggleFavorite}
              favoriteActive={isFavorite}
              isRTL={currentLanguage !== 'en'}
            />
          </View>
          <View className="mt-5 flex-row items-start justify-between">
            <View>
              <Text className="text-[18px] font-bold text-[#353f3d]">
                {getLocalizedValue(shop?.translation, currentLanguage) ||
                  getText(currentLanguage, 'shopFallback')}
              </Text>
              <Text className="mt-1 text-[12px] text-[#3f4545]">
                {getLocalizedValue(shop?.location?.address, currentLanguage) ||
                  getLocalizedValue(shop?.address, currentLanguage) ||
                  'Herat'}
              </Text>
            </View>
            <ActionPill
              label={
                isFollowing
                  ? getText(currentLanguage, 'following')
                  : getText(currentLanguage, 'follow')
              }
              active={isFollowing}
              onPress={toggleFollow}
            />
          </View>
          <View className="mt-3 flex-row flex-wrap gap-2">
            <Chip label={`★ ${(Number(shop?.rating) || summary.average || 0).toFixed(1)}`} active />
            <Chip
              label={
                getLocalizedValue(shop?.categoryTranslation, currentLanguage) ||
                getText(currentLanguage, 'categoryFallback')
              }
            />
          </View>
          <View className="mt-4">
            <SectionHeader title={getText(currentLanguage, 'about')} />
            <Text className="text-[12px] leading-5 text-[#727878]">
              {getLocalizedValue(shop?.translation, currentLanguage, 'description') ||
                getText(currentLanguage, 'noDescription')}
            </Text>
          </View>
          <View className="mt-5 flex-row gap-5 border-b border-white/15">
            {['items', 'reviews'].map((value) => (
              <Pressable
                key={value}
                onPress={() => setTab(value)}
                className={`pb-2 ${tab === value ? 'border-b-2 border-[#d99c17]' : ''}`}
              >
                <Text className="font-semibold text-[#1d2221]">
                  {getText(currentLanguage, value)}
                </Text>
              </Pressable>
            ))}
          </View>
          {tab === 'items' ? (
            <View className="mt-5">
              <View className="flex-row flex-wrap justify-between">
                {items.map((item) => (
                  <View key={item.id} className="w-[48%] mb-3">
                    <ItemCard
                      item={item}
                      onPress={() => navigation.navigate('Product', { id: item.id })}
                      style={{ width: '100%' }}
                    />
                  </View>
                ))}
                {!items.length && (
                  <Text className="text-[12px] text-[#89a1a1]">Shop items will appear here.</Text>
                )}
              </View>
              <View className="mt-7">
                <SectionHeader title={getText(currentLanguage, 'similarShops')} />
                {similarShops.length ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerClassName="gap-4 pr-5"
                  >
                    {similarShops.map((similarShop) => (
                      <ShopCard
                        key={similarShop.id}
                        shop={similarShop}
                        compact
                        onPress={() => navigation.push('ShopDetail', { id: similarShop.id })}
                      />
                    ))}
                  </ScrollView>
                ) : (
                  <Text className="text-[12px] text-[#89a1a1]">
                    Similar shops will appear here.
                  </Text>
                )}
              </View>
            </View>
          ) : (
            <ReviewSection targetType="shop" reviews={reviews} summary={summary} user={user} onSave={saveReview} language={currentLanguage} navigation={navigation} />
          )}
        </View>
      </ScrollView>
    </ScreenShell>
  );
}