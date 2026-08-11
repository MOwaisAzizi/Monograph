import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { ActionPill, Chip, ScreenShell, SectionHeader } from '../components/ui';
import { ItemCard, ShopCard } from '../components/cards';
import { getLocalizedValue, getText } from '../i18n';

export default function ProductScreen({ route, navigation }) {
  const currentLanguage = useSelector((state) => state.language.currentLanguage);
  const { id } = route.params;
  const [item, setItem] = useState(null);
  const [similarItems, setSimilarItems] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = async () => {
    try {
      await api.toggleFavorite(id, null);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      console.log('fetching---------')
      try {
        const [item, similarItems] = await Promise.all([
          api.getItem(id),
          api.similarItems(id),
        ]);
        if (mounted) {
          setItem(item);
          setSimilarItems(similarItems);
        }
      } catch (error) {
        console.log('-------------------------------')
        console.log(error)
        if (mounted) {
          setItem(null);
          setSimilarItems([]);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [id]);
  console.log('similarItems')
  console.log(similarItems)
  console.log('items')
  console.log(item)
  const itemRating = useMemo(() => {
    if (!item) {
      return '—';
    }

    return item.rating;
  }, [item]);
console.log('--------------------------------------')
console.log(item?.shopId)
  return (
    <ScreenShell scroll={true} contentClassName="flex-1 pb-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-2">
          <View className="h-64 rounded-[28px] bg-[#d6e3e2]">
            <Image
              source={{ uri: item?.coverImage || 'https://via.placeholder.com/640x480/d6e3e2/566d6d?text=No+Image' }}
              resizeMode="cover"
              className="h-full w-full rounded-[28px]"
            />
            <View className="absolute left-4 right-4 top-4 flex-row items-center justify-between">
              <Pressable
                onPress={() => navigation.goBack()}
                className="h-9 w-9 items-center justify-center rounded-full bg-white/60"
              >
                <Ionicons name="chevron-back" size={16} color="#2a3535" />
              </Pressable>
              <Pressable
                className="h-9 w-9 items-center justify-center rounded-full bg-white/60"
                onPress={toggleFavorite}
              >
                <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={16} color="#2a3535" />
              </Pressable>
            </View>

            <View className="absolute bottom-4 left-0 right-0 items-center">
              <View className="h-1.5 w-8 rounded-full bg-white/80" />
            </View>
          </View>

          <View className="mt-5">
            <Text className="text-[18px] font-bold text-[#434d4b]">
              {getLocalizedValue(item?.translation, currentLanguage) || getText(currentLanguage, 'itemTitleFallback')}
            </Text>
            <View className="mt-2 flex-row flex-wrap gap-2">
              <Chip label={itemRating} active />
              <Chip label={getLocalizedValue(item?.categoryTranslation, currentLanguage) || getText(currentLanguage, 'categoryFallback')} />
            </View>

            <View className="mt-4 rounded-[24px] border border-white/10 bg-white/6 px-4 py-4">
              <ShopCard
                shop={{
                  id: item?.shopId,
                  translation: item?.shopTranslation,
                  rating: item?.rating || '3',
                  shopType: item?.shopType || 'shop',
                }}
                onPress={() => item?.shopId && navigation.navigate('ShopDetail', { id: item.shopId })}
                compact
              />
            </View>

            <View className="mt-4">
              <SectionHeader title={getText(currentLanguage, 'about')} />
              <Text className="text-[12px] leading-5 text-[#4c5858]">
                {getLocalizedValue(item?.translation, currentLanguage, 'description') || getText(currentLanguage, 'noDescription')}
              </Text>
            </View>

            <View className="mt-4 flex-row gap-2">
              <ActionPill label={getText(currentLanguage, 'chat')} />
              <ActionPill label={getText(currentLanguage, 'reserveItem')} active />
            </View>
            <View className="mt-6 ">
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
        // onPressItem={(id) => navigation.navigate('Product', { id })}
        onPress={() => navigation.push('Product', { id: similarItem._id })}
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

            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenShell>
  );
}
