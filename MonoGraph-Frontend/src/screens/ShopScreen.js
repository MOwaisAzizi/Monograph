
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import api from '../services/api';
import { normalizeBusiness } from '../utils/marketplace';
import { Chip, ScreenHeader, ScreenShell } from '../components/ui';
import { ShopCard } from '../components/cards';

export default function ShopScreen({ navigation }) {
  const [shops, setShops] = useState([]);

  useEffect(() => {
    api
      .get('/business')
      .then((res) => setShops((res?.data?.data?.businesses || []).map(normalizeBusiness)))
      .catch(() => setShops([]));
  }, []);

  return (
    <ScreenShell contentClassName="pb-6">
      <ScreenHeader title="All Shops" rightAction={() => navigation.navigate('Search')} />

      <View className="px-5">
        <View className="flex-row flex-wrap gap-2">
          {['Category', 'Rating', 'Distance'].map((label) => (
            <Chip key={label} label={label} />
          ))}
        </View>

        <View className="mt-6 space-y-3">
          {shops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} onPress={() => navigation.navigate('ShopDetail', { id: shop.id })} />
          ))}

          {!shops.length ? (
            <View className="rounded-[24px] border border-dashed border-white/20 bg-white/5 px-4 py-5">
              <Text className="text-[12px] text-[#89a1a1]">Backend shop data will appear here.</Text>
            </View>
          ) : null}
        </View>
      </View>
    </ScreenShell>
  );
}
