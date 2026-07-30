import React, { useEffect, useState } from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import api from '../services/api';
import { normalizeBusiness, normalizeItem } from '../utils/marketplace';
import { Chip, ScreenShell, ScreenHeader, TextField } from '../components/ui';
import { ItemCard, ShopCard } from '../components/cards';

export default function SearchScreen({ navigation, route }) {

  const {
    search: initialSearch = '',
    category: initialCategory = '',
  } = route.params || {};

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);

  const [selectedTab, setSelectedTab] = useState('Items');

  const [items, setItems] = useState([]);
  const [shops, setShops] = useState([]);

  const [loading, setLoading] = useState(false);

  // React Navigation reuses this screen instance when navigate() is called
  // again while it's already in the stack — route.params changes, but the
  // useState() above only ran once on first mount. Sync state to params
  // every time they change so the search/category filter actually applies.
  useEffect(() => {
    setSearch(route.params?.search ?? '');
    setCategory(route.params?.category ?? '');
  }, [route.params?.search, route.params?.category]);

  useEffect(() => {
    fetchResults();
  }, [search, category]);

  const fetchResults = async () => {

    try {

      setLoading(true);

      const params = new URLSearchParams();

      if (search.trim()) {
        params.append('search', search.trim());
      }

      if (category) {
        params.append('category', category);
      }

      const response = await api.baseURL.get(`/search?${params.toString()}`);

      const data = response?.data?.data;

      setItems((data?.items || []).map(normalizeItem));
      setShops((data?.shops || []).map(normalizeBusiness));

    } catch (error) {

      console.log('Search error:', error);

      setItems([]);
      setShops([]);

    } finally {

      setLoading(false);

    }

  };

  const results = selectedTab === 'Items' ? items : shops;

  const hasQuery = Boolean(search.trim() || category);
  const showEmptyState = !loading && hasQuery && results.length === 0;

  return (
    <ScreenShell contentClassName="pb-6">

      <ScreenHeader
        title="Search"
        onBack={() => navigation.goBack()}
      />

      <View className="px-5">

        <TextField
          placeholder="Search items or shops..."
          value={search}
          onChangeText={setSearch}
        />

        {Boolean(category) && (
          <View className="mt-3">
            <Text className="text-xs text-[#7c9291]">
              Category: {category}
            </Text>
          </View>
        )}

        {loading && (
          <ActivityIndicator className="mt-4" />
        )}

        <View className="mt-6 flex-row gap-2">

          <Chip
            label="Items"
            active={selectedTab === 'Items'}
            onPress={() => setSelectedTab('Items')}
          />

          <Chip
            label="Shops"
            active={selectedTab === 'Shops'}
            onPress={() => setSelectedTab('Shops')}
          />

        </View>

        <View className="mt-5 flex-row flex-wrap justify-between">

          {results.map((entry) => (
            <View
              key={entry.id}
              className="w-[48%] mb-3"
            >
              {selectedTab === 'Items' ? (
                <ItemCard
                  item={entry}
                  onPress={() =>
                    navigation.navigate('Product', { id: entry.id })
                  }
                />
              ) : (
                <ShopCard
                  shop={entry}
                  onPress={() =>
                    navigation.navigate('ShopDetail', { id: entry.id })
                  }
                />
              )}
            </View>
          ))}

          {showEmptyState && (
            <View className="w-full rounded-[24px] border border-dashed border-white/20 bg-white/5 px-4 py-5">
              <Text className="text-[12px] text-[#89a1a9]">
                No results found
              </Text>
            </View>
          )}

        </View>

      </View>

    </ScreenShell>
  );
}
