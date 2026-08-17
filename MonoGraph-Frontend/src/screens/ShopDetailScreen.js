import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, Image, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { useShopDetail } from '../hooks/useShopDetail';
import { ActionPill, Chip, ScreenShell, SectionHeader } from '../components/ui';
import { ItemCard, ShopCard } from '../components/cards';
import { getLocalizedValue, getText } from '../i18n';
import { timeAgo } from '../helpers/shopDetailScreenHelpers';

const Stars = ({ rating, size = 14 }) => (
  <Text style={{ fontSize: size, color: '#d99c17' }}>
    {'★'.repeat(Math.round(rating))}
    {'☆'.repeat(5 - Math.round(rating))}
  </Text>
);

export default function ShopDetailScreen({ route, navigation }) {
  const currentLanguage = useSelector((state) => state.language.currentLanguage);
  const { id } = route.params;
  const user = useSelector((state) => state.auth.user);
  const { shop, items, similarShops, reviews, summary, loadReviews } = useShopDetail(id);
  const [tab, setTab] = useState('items');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [rating, setRating] = useState(5);

  const [comment, setComment] = useState('');
  const [showForm, setShowForm] = useState(false);
  const submitReview = async () => {
    if (!user) return navigation.navigate('Login');
    if (!comment.trim()) return Alert.alert('Write a review', 'Please add a short comment.');
    try {
      await api.saveShopReview(id, { rating, comment: comment.trim() });
      setComment('');
      setShowForm(false);
      await loadReviews();
    } catch (error) {
      Alert.alert('Could not save review', error.response?.data?.message || 'Please try again.');
    }
  };
  const toggleFavorite = async () => {
    try {
      await api.toggleFavorite(null, id);
      setIsFavorite((value) => !value);
    } catch {
      navigation.navigate('Login');
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
  const maxCount = Math.max(...Object.values(summary.distribution || {}), 1);
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
            <Pressable
              onPress={() => navigation.goBack()}
              className="absolute left-4 top-4 h-9 w-9 items-center justify-center rounded-full bg-white/60"
            >
              <Ionicons name="chevron-back" size={16} color="#2a3535" />
            </Pressable>
            <Pressable
              onPress={toggleFavorite}
              className="absolute right-4 top-4 h-9 w-9 items-center justify-center rounded-full bg-white/60"
            >
              <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={16} color="#2a3535" />
            </Pressable>
          </View>
          <View className="mt-5 flex-row items-start justify-between">
            <View>
              <Text className="text-[18px] font-bold text-[#353f3d]">
                {getLocalizedValue(shop?.translation, currentLanguage) ||
                  getText(currentLanguage, 'shopFallback')}
              </Text>
              <Text className="mt-1 text-[12px] text-[#3f4545]">{shop?.address || 'Herat'}</Text>
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
            <View className="mt-5">
              <View className="flex-row gap-5">
                <View className="items-center justify-center">
                  <Text className="text-4xl font-bold text-[#eff5f4]">
                    {summary.average.toFixed(1)}
                  </Text>
                  <Stars rating={summary.average} />
                </View>
                <View className="flex-1 justify-center">
                  {[5, 4, 3, 2, 1].map((value) => (
                    <View key={value} className="mb-2 flex-row items-center gap-2">
                      <Text className="w-5 text-[11px] text-[#a9bbbb]">{value}★</Text>
                      <View className="h-1.5 flex-1 overflow-hidden rounded bg-[#d6e3e2]">
                        <View
                          style={{
                            width: `${((summary.distribution?.[value] || 0) / maxCount) * 100}%`,
                          }}
                          className="h-full bg-[#d99c17]"
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
              {reviews.map((review) => (
                <View key={review._id} className="mt-4 border-t border-white/15 pt-4">
                  <Text className="font-semibold text-[#eff5f4]">
                    {review.user?.fullname || 'MonoGraph user'}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Stars rating={review.rating} size={12} />
                    <Text className="text-[11px] text-[#9ab0b0]">{timeAgo(review.createdAt)}</Text>
                  </View>
                  <Text className="mt-2 text-[13px] leading-5 text-[#c2d1d0]">
                    {review.comment}
                  </Text>
                </View>
              ))}
              {!reviews.length && (
                <Text className="mt-5 text-[12px] text-[#89a1a1]">
                  No reviews yet. Be the first to review this shop.
                </Text>
              )}
              {showForm && (
                <View className=" rounded-2xl bg-white/10 p-4">
                  <Text className="font-semibold text-[#eff5f4]">
                    {getText(currentLanguage, 'yourRating')}
                  </Text>
                  <View className="mt-2 flex-row">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Pressable key={value} onPress={() => setRating(value)}>
                        <Text
                          style={{ color: value <= rating ? '#d99c17' : '#d6e3e2', fontSize: 27 }}
                        >
                          ★
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <TextInput
                    value={comment}
                    onChangeText={setComment}
                    placeholder={getText(currentLanguage, 'shareExperience')}
                    placeholderTextColor="#9ab0b0"
                    multiline
                    className="mt-2 min-h-[90px] rounded-xl bg-white px-3 py-3 text-[#314243]"
                  />
                  <Pressable onPress={submitReview} className="mt-3 rounded-xl bg-[#0f6b75] py-3">
                    <Text className="text-center font-semibold text-white">
                      {getText(currentLanguage, 'submitReview')}
                    </Text>
                  </Pressable>
                </View>
              )}
              <Pressable
                onPress={() =>
                  user ? setShowForm((value) => !value) : navigation.navigate('Login')
                }
                className="mt-5 rounded-2xl bg-[#d6e3e2] py-4"
              >
                <Text className="text-center font-semibold text-[#0d4e57]">
                  {showForm
                    ? getText(currentLanguage, 'cancelReview')
                    : getText(currentLanguage, 'addReview')}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenShell>
  );
}
