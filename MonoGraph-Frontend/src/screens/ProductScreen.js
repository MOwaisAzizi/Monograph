import React, { useMemo, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useFavorite, useProduct } from '../hooks/useProduct';
import { ActionPill, Chip, DetailHeaderActions, ScreenShell, SectionHeader } from '../components/ui';
import { ItemCard, ShopCard } from '../components/cards';
import { getLocalizedValue, getText } from '../i18n';
import api from '../services/api';
import { ReviewSection } from '../components/ReviewComponents';
import { useReviews } from '../hooks/useReviews';

export default function ProductScreen({ route, navigation }) {
  const currentLanguage = useSelector((state) => state.language.currentLanguage);
  const { id } = route.params;
  const { item, similarItems } = useProduct(id);
  const user = useSelector((state) => state.auth.user);
  const { reviews, summary, saveReview } = useReviews('item', id);
  const { isFavorite, toggleFavorite } = useFavorite(id);
  const sellerId = item?.shopId || item?.owner || item?.sellerId;
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerValue, setOfferValue] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [detailTab, setDetailTab] = useState('similar');
  const itemRating = useMemo(() => {
    if (!item) {
      return '—';
    }

    return item.rating;
  }, [item]);

  const handleChat = () => {
    if (!item) return;
    navigation.navigate('Chat', {
      itemId: item.id,
      sellerId,
      itemTitle:
        getLocalizedValue(item?.translation, currentLanguage) ||
        getText(currentLanguage, 'itemTitleFallback'),
    });
  };

  const handleOfferPrice = () => {
    if (!item) return;
    const defaultOffer = `${item.price || ''}`.replace(/[^\d.]/g, '');
    setOfferValue(defaultOffer);
    setOfferModalOpen(true);
  };

  const submitOffer = async () => {
    if (!item || submittingOffer) return;

    const parsedPrice = Number(offerValue.replace(/[^\d.]/g, ''));
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      Alert.alert(getText(currentLanguage, 'offerPrice'), getText(currentLanguage, 'offerInvalidPrice'));
      return;
    }

    try {
      setSubmittingOffer(true);
      await api.createOffer({
        itemId: item.id,
        askingPrice: Number(item.price || 0),
        offeredPrice: parsedPrice,
        note: 'Buyer offer',
      });
      setOfferModalOpen(false);
      setOfferValue('');
      Alert.alert(getText(currentLanguage, 'offerPrice'), getText(currentLanguage, 'offerSaved'));
    } catch (error) {
      const message = error?.response?.data?.message || getText(currentLanguage, 'offerSaveFailed');
      Alert.alert(getText(currentLanguage, 'offerPrice'), message);
      if (error?.response?.status === 401) {
        navigation.navigate('Login');
      }
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleBuyNow = () => {
    if (!item) return;
    navigation.navigate('ConfirmBuy', {
      itemId: item.id,
      sellerId,
      itemTitle:
        getLocalizedValue(item?.translation, currentLanguage) ||
        getText(currentLanguage, 'itemTitleFallback'),
      price: Number(`${item.price || 0}`.replace(/[^\d.]/g, '')) || 0,
    });
  };
  console.log('🥞🥞🥞🧇');
  console.log(item);
  return (
    <ScreenShell scroll={false} contentClassName="flex-1 pb-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-2">
          <View className="h-64 rounded-[28px] bg-[#d6e3e2]">
            <Image
              source={{
                uri:
                  item?.coverImage ||
                  'https://via.placeholder.com/640x480/d6e3e2/566d6d?text=No+Image',
              }}
              resizeMode="cover"
              className="h-full w-full rounded-[28px]"
            />
            <DetailHeaderActions
              onBack={() => navigation.goBack()}
              onFavorite={toggleFavorite}
              favoriteActive={isFavorite}
              isRTL={currentLanguage !== 'en'}
            />

            <View className="absolute bottom-4 left-0 right-0 items-center">
              <View className="h-1.5 w-8 rounded-full bg-white/80" />
            </View>
          </View>

          <View className="mt-5">
            <Text className="text-[18px] font-bold text-[#434d4b]">
              {getLocalizedValue(item?.translation, currentLanguage) ||
                getText(currentLanguage, 'itemTitleFallback')}
            </Text>
            <View className="mt-2 flex-row flex-wrap gap-2">
              <Chip label={itemRating} active />
              <Chip
                label={
                  getLocalizedValue(item?.categoryTranslation, currentLanguage) ||
                  getText(currentLanguage, 'categoryFallback')
                }
              />
            </View>

            <View className="mt-4 rounded-[24px] border border-white/10 bg-white/6 px-4 py-4">
              <ShopCard
                shop={{
                  id: item?.shopId,
                  translation: item?.shopTranslation,
                  profile: item?.shopProfile,
                  coverImage: item?.shopCoverImage,
                  rating: item?.rating || '3',
                  category: item?.category,
                }}
                onPress={() =>
                  item?.shopId && navigation.navigate('ShopDetail', { id: item.shopId })
                }
                compact
              />
            </View>

            <View className="mt-4">
              <SectionHeader title={getText(currentLanguage, 'about')} />
              <Text className="text-[12px] leading-5 text-[#4c5858]">
                {getLocalizedValue(item?.translation, currentLanguage, 'description') ||
                  getText(currentLanguage, 'noDescription')}
              </Text>
            </View>

            <View className="mt-4 flex-row flex-wrap gap-2">
              <ActionPill label={getText(currentLanguage, 'chat')} onPress={handleChat} />
              <ActionPill
                label={getText(currentLanguage, 'offerPrice')}
                onPress={handleOfferPrice}
              />
              <ActionPill
                label={getText(currentLanguage, 'buyNow')}
                active
                onPress={handleBuyNow}
              />
            </View>
            <View className="mt-6 flex-row gap-5 border-b border-white/15">
              <Pressable onPress={() => setDetailTab('similar')} className={`pb-2 ${detailTab === 'similar' ? 'border-b-2 border-[#d99c17]' : ''}`}>
                <Text className="font-semibold text-[#1d2221]">{getText(currentLanguage, 'similarItems')}</Text>
              </Pressable>
              <Pressable onPress={() => setDetailTab('reviews')} className={`pb-2 ${detailTab === 'reviews' ? 'border-b-2 border-[#d99c17]' : ''}`}>
                <Text className="font-semibold text-[#1d2221]">{getText(currentLanguage, 'reviews')}</Text>
              </Pressable>
            </View>

            {detailTab === 'reviews' ? (
              <ReviewSection targetType="item" reviews={reviews} summary={summary} user={user} onSave={saveReview} language={currentLanguage} navigation={navigation} />
            ) : <View className="mt-6">
              <SectionHeader title={getText(currentLanguage, 'similarItems')} />

              {similarItems.length ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerClassName="gap-3 pr-5"
                  className="mt-2"
                >
                  {similarItems.map((similarItem) => (
                    <ItemCard
                      key={similarItem.id}
                      item={similarItem}
                      onPress={() => navigation.push('Product', { id: similarItem.id })}
                      style={{ width: 150 }}
                    />
                  ))}
                </ScrollView>
              ) : (
                <View className="rounded-[24px] border border-dashed border-white/20 bg-white/5 px-4 py-5">
                  <Text className="text-[12px] text-[#89a1a1]">
                    Similar items will appear here.
                  </Text>
                </View>
              )}
            </View>}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={offerModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setOfferModalOpen(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/40 px-5">
          <View className="w-full rounded-3xl bg-white p-5">
            <Text className="text-[17px] font-bold text-[#223233]">{getText(currentLanguage, 'offerPrice')}</Text>
            <Text className="mt-1 text-[12px] text-[#6b7f80]">{getText(currentLanguage, 'offerPlaceholder')}</Text>

            <TextInput
              value={offerValue}
              onChangeText={setOfferValue}
              keyboardType="decimal-pad"
              returnKeyType="done"
              onSubmitEditing={submitOffer}
              placeholder={getText(currentLanguage, 'offerPlaceholder')}
              placeholderTextColor="#9db0b0"
              className="mt-4 rounded-2xl border border-[#d6e4e4] px-4 py-3 text-[14px] text-[#203030]"
            />

            <View className="mt-4 flex-row gap-2">
              <Pressable
                onPress={() => setOfferModalOpen(false)}
                className="flex-1 rounded-2xl border border-[#d6e4e4] px-4 py-3"
              >
                <Text className="text-center text-[13px] font-semibold text-[#314243]">{getText(currentLanguage, 'cancel')}</Text>
              </Pressable>
              <Pressable
                onPress={submitOffer}
                disabled={submittingOffer}
                className={`flex-1 rounded-2xl px-4 py-3 ${submittingOffer ? 'bg-[#8aa7a8]' : 'bg-[#0f6b75]'}`}
              >
                <Text className="text-center text-[13px] font-semibold text-white">
                  {submittingOffer ? getText(currentLanguage, 'saving') : getText(currentLanguage, 'submitOffer')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenShell>
  );
}
