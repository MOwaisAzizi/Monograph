
import React, { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import api from '../services/api';
import { normalizeBusiness, normalizeItem } from '../utils/marketplace';
import { Chip, ScreenShell, ScreenHeader, TextField } from '../components/ui';
import { ItemCard, ShopCard } from '../components/cards';

export default function SearchScreen({ navigation }) {
  const [q, setQ] = useState('');
  const [selectedTab, setSelectedTab] = useState('Items');
  const [items, setItems] = useState([]);
  const [shops, setShops] = useState([]);

  useEffect(() => {
    Promise.all([api.get('/item'), api.get('/business')])
      .then(([itemsResponse, shopsResponse]) => {
        setItems((itemsResponse?.data?.data?.Items || []).map(normalizeItem));
        setShops((shopsResponse?.data?.data?.businesses || []).map(normalizeBusiness));
      })
      .catch(() => {
        setItems([]);
        setShops([]);
      });
  }, []);

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const haystack = `${item.title} ${item.description} ${item.categoryName} ${item.businessName} ${item.city}`.toLowerCase();
        return haystack.includes(q.toLowerCase());
      }),
    [items, q],
  );

  const filteredShops = useMemo(
    () =>
      shops.filter((shop) => {
        const haystack = `${shop.title} ${shop.description} ${shop.businessType} ${shop.address} ${shop.city}`.toLowerCase();
        return haystack.includes(q.toLowerCase());
      }),
    [q, shops],
  );

  return (
    <ScreenShell contentClassName="pb-6">
      <ScreenHeader title="Search" onBack={() => navigation.goBack()} />

      <View className="px-5">
        <TextField placeholder="Search items or shops..." value={q} onChangeText={setQ} />

        <View className="mt-4 flex-row items-center gap-1">
          <Text className="text-[12px] font-bold text-[#253334]">Items</Text>
          <Text className="text-[12px] font-semibold text-[#7f9292]">Shops</Text>
        </View>

        <View className="mt-4 flex-row flex-wrap gap-2">
          {['Price', 'Condition', 'Distance', 'Rating'].map((label) => (
            <Chip key={label} label={label} />
          ))}
        </View>

        <View className="mt-6 flex-row gap-2">
          <Chip label="Items" active={selectedTab === 'Items'} onPress={() => setSelectedTab('Items')} />
          <Chip label="Shops" active={selectedTab === 'Shops'} onPress={() => setSelectedTab('Shops')} />
        </View>

        <View className="mt-5 space-y-3">
          {(selectedTab === 'Items' ? filteredItems : filteredShops).map((entry) =>
            selectedTab === 'Items' ? (
              <ItemCard key={entry.id} item={entry} onPress={() => navigation.navigate('Product', { id: entry.id })} />
            ) : (
              <ShopCard key={entry.id} shop={entry} onPress={() => navigation.navigate('ShopDetail', { id: entry.id })} />
            ),
          )}

          {!q && (selectedTab === 'Items' ? filteredItems : filteredShops).length === 0 ? (
            <View className="rounded-[24px] border border-dashed border-white/20 bg-white/5 px-4 py-5">
              <Text className="text-[12px] text-[#89a1a1]">Search results will appear here when backend data arrives.</Text>
            </View>
          ) : null}
        </View>
      </View>
    </ScreenShell>
  );
}
