
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import api from '../services/api';
import { normalizeBusiness, normalizeItem } from '../utils/marketplace';
import { ActionPill, IconCircleButton, ScreenShell, SectionHeader } from '../components/ui';
import { ItemCard, ShopCard } from '../components/cards';

export default function HomeScreen({ navigation }) {
  const [homeData, setHomeData] = useState({
    newItems: [],
    cheapItems: [],
    highRatedItems: [],
    nearestItems: [],
    nearestShops: [],
  });

  useEffect(() => {
    let mounted = true;

    Promise.all([api.get('/home')])
      .then(([homeResponse]) => {
        if (!mounted) {
          return;
        }
        console.log('Home 🥩🍞response:', homeResponse?.data);
        const payload = homeResponse?.data?.data || {};
        const businessList = homeResponse?.data?.data?.businesses || [];

        setHomeData({
          cheapItems: (payload.cheapItems || []).map(normalizeItem),
          highRatedItems: (payload.highRatedItems || []).map(normalizeItem),
          newItems: (payload.newItems || []).map(normalizeItem),
          nearestItems: (payload.nearestItems || []).map(normalizeItem),
          nearestShops: businessList.map(normalizeBusiness),
        });
      })
      .catch(() => {
        if (mounted) {
          setHomeData((current) => current);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const sections = useMemo(
    () => [
      { key: 'New Items', title: 'New Items', actionLabel: 'See all', data: homeData.newItems.slice(0, 3), type: 'item' },
      { key: 'Highly Rated', title: 'Highly Rated', actionLabel: 'See all', data: homeData.highRatedItems.slice(0, 3), type: 'item' },
      { key: 'Cheap', title: 'Cheap', actionLabel: 'See all', data: homeData.cheapItems.slice(0, 3), type: 'item' },
      { key: 'Near You', title: 'Near You', actionLabel: 'See all', data: homeData.nearestItems.slice(0, 3), type: 'item' },
      { key: 'Shops', title: 'Shops', actionLabel: 'See all', data: homeData.nearestShops.slice(0, 3), type: 'shop' },
    ],
    [homeData],
  );

  return (
    <ScreenShell  contentClassName="px-5 pb-6 pt-4">

        {/* <View className="flex-row items-start justify-between"> */}
          {/* <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#0f6b75]">
              <Text className="text-[18px] font-bold text-white">↗</Text>
            </View>
            <View>
              <Text className="font-serif text-[28px] font-bold text-[#eff5f4]">Dokan</Text>
              <Text className="mt-1 text-[12px] text-[#8fa5a5]">Secondhand marketplace — full screen set</Text>
            </View>
          </View> */}

          {/* <View className="flex-row gap-2">
            <IconCircleButton icon="location-outline" />
            <IconCircleButton icon="search" onPress={() => navigation.navigate('Search')} />
          </View>
        </View> */}

        <View className="mt-8 space-y-7">
          {sections.map((section) => (
            <View key={section.key}>
              <SectionHeader title={section.title} actionLabel={section.actionLabel} onAction={() => navigation.navigate('Search')} />
              {section.data.length ? (
                <View className="mt-2 space-y-3">
                  {section.type === 'item'
                    ? section.data.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        compact
                        onPress={() => navigation.navigate('Product', { id: item.id })}
                      />
                    ))
                    : section.data.map((shop) => (
                      <ShopCard
                        key={shop.id}
                        shop={shop}
                        compact
                        onPress={() => navigation.navigate('ShopDetail', { id: shop.id })}
                      />
                    ))}
                </View>
              ) : (
                <View className="rounded-[24px] border border-dashed border-white/20 bg-white/5 px-4 py-5">
                  <Text className="text-[12px] text-[#89a1a1]">Waiting for backend data.</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View className="mt-8 flex-row gap-2">
          <ActionPill label="Curated" active />
          <ActionPill label="Fresh arrivals" />
          <ActionPill label="Nearby" />
        </View>
    </ScreenShell>
  );
}
