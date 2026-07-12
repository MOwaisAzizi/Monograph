
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { capitalize, normalizeItem } from '../utils/marketplace';
import { ActionPill, Chip, ScreenShell, SectionHeader } from '../components/ui';
import { ItemCard, ShopCard } from '../components/cards';

export default function ProductScreen({ route, navigation }) {
  const { id } = route.params;
  const [item, setItem] = useState(null);
  const [similarItems, setSimilarItems] = useState([]);

  useEffect(() => {
    let mounted = true;

    api
      .get(`/item/${id}`)
      .then(async (response) => {
        if (!mounted) {
          return;
        }

        const rawItem = response?.data?.data?.Item || response?.data?.data?.item || response?.data?.data || {};
        const normalized = normalizeItem(rawItem);
        setItem(normalized);

        if (rawItem?.category?._id || rawItem?.category) {
          const categoryId = rawItem.category._id || rawItem.category;
          const similarResponse = await api.get(`/item?category=${categoryId}`);
          const similarList = (similarResponse?.data?.data?.Items || []).map(normalizeItem).filter((entry) => entry.id !== normalized.id);
          if (mounted) {
            setSimilarItems(similarList.slice(0, 4));
          }
        }
      })
      .catch(() => {
        if (mounted) {
          setItem(null);
          setSimilarItems([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  const itemStatus = useMemo(() => {
    if (!item) {
      return '—';
    }

    return item.rating >= 4 ? 'GOOD' : 'GOOD';
  }, [item]);

  return (
    <ScreenShell scroll={false} contentClassName="flex-1 pb-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-2">
          <View className="h-64 rounded-[28px] bg-[#d6e3e2]">
            <View className="absolute left-4 right-4 top-4 flex-row items-center justify-between">
              <Pressable onPress={() => navigation.goBack()} className="h-9 w-9 items-center justify-center rounded-full bg-white/60">
                <Ionicons name="chevron-back" size={16} color="#2a3535" />
              </Pressable>
              <Pressable className="h-9 w-9 items-center justify-center rounded-full bg-white/60">
                <Ionicons name="heart-outline" size={16} color="#2a3535" />
              </Pressable>
            </View>

            <View className="absolute bottom-4 left-0 right-0 items-center">
              <View className="h-1.5 w-8 rounded-full bg-white/80" />
            </View>
          </View>

          <View className="mt-5">
            <Text className="text-[18px] font-bold text-[#eff5f4]">{item?.title || 'Item title'}</Text>
            <View className="mt-2 flex-row flex-wrap gap-2">
              <Chip label={itemStatus} active />
              <Chip label={item?.categoryName || 'Category'} />
            </View>

            <View className="mt-4 rounded-[24px] border border-white/10 bg-white/6 px-4 py-4">
              <ShopCard
                shop={{
                  id: item?.businessName || 'shop',
                  title: item?.businessName || 'Shop',
                  description: item?.locationText || 'Herat',
                  rating: item?.rating || '4.2',
                  businessType: item?.categoryName || 'shop',
                }}
                compact
              />
            </View>

            <View className="mt-4">
              <SectionHeader title="Description" />
              <Text className="text-[12px] leading-5 text-[#b3c2c2]">{item?.description || 'Description will be mapped from backend translation fields.'}</Text>
            </View>

            <View className="mt-4 flex-row gap-2">
              <ActionPill label="Chat" />
              <ActionPill label="Reserve item" active />
            </View>

            <View className="mt-6">
              <SectionHeader title="Similar items" />
              {similarItems.length ? (
                <View className="mt-2 space-y-3">
                  {similarItems.map((similarItem) => (
                    <ItemCard key={similarItem.id} item={similarItem} compact />
                  ))}
                </View>
              ) : (
                <View className="rounded-[24px] border border-dashed border-white/20 bg-white/5 px-4 py-5">
                  <Text className="text-[12px] text-[#89a1a1]">Similar items will appear here.</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenShell>
  );
}
