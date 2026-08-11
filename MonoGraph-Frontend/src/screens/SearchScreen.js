import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { normalizeShop, normalizeItem } from '../utils/marketplace';
import { Chip, ScreenShell, ScreenHeader, TextField } from '../components/ui';
import { ItemCard, ShopCard } from '../components/cards';
import { getText } from '../i18n';
import { ALL_CATEGORY, CategoryFilterRow, normalizeCategoryFilters } from './HomeScreen';

export default function SearchScreen({ navigation, route }) {
  const currentLanguage = useSelector((state) => state.language.currentLanguage);
  const { search: initialSearch = '', category: initialCategory = '' } = route.params || {};

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [categories, setCategories] = useState([ALL_CATEGORY]);

  const [selectedTab, setSelectedTab] = useState('Items');
  const [sort, setSort] = useState('');

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
    let mounted = true;

    api.baseURL
      .get('/category')
      .then((res) => {
        if (!mounted) return;
        const list = normalizeCategoryFilters(res.data.data.categories, currentLanguage);
        setCategories([ALL_CATEGORY, ...list]);
      })
      .catch(() => {
        if (mounted) setCategories([ALL_CATEGORY]);
      });

    return () => {
      mounted = false;
    };
  }, [currentLanguage]);

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (search.trim()) {
        params.append('search', search.trim());
      }

      if (category) {
        params.append('category', category);
      }

      if (sort) {
        params.append('sort', sort);
      }

      const response = await api.baseURL.get(`/search?${params.toString()}`);

      const data = response?.data?.data;
console.log('data[------------------------]')
console.log(data[0])
      setItems((data?.items || []).map(normalizeItem));
      setShops((data?.shops || []).map(normalizeShop));
    } catch (error) {
      console.log('Search error:', error);

      setItems([]);
      setShops([]);
    } finally {
      setLoading(false);
    }
  }, [category, search, sort]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const results = selectedTab === 'Items' ? items : shops;
  console.log('-------🥙🥙🥙🥗-----------')
  console.log(results[0])
  const selectedCategoryLabel = useMemo(
    () => categories.find((option) => option.key === category)?.label || category,
    [categories, category],
  );

  const hasQuery = Boolean(search.trim() || category);
  const showEmptyState = !loading && hasQuery && results.length === 0;

  const handleCategoryChange = (nextCategoryKey) => {
    const nextCategory = category === nextCategoryKey ? '' : nextCategoryKey;
    setCategory(nextCategory);
    navigation.setParams({ ...(route.params || {}), search: search.trim(), category: nextCategory });
  };

  return (
    <ScreenShell contentClassName="pb-6">
      {/* <ScreenHeader title={getText(currentLanguage, 'search')} onBack={() => navigation.goBack()} /> */}

      <View className="px-5">
        <View className="mb-3 mt-6">
          <CategoryFilterRow
            categories={categories}
            activeKey={category}
            onSelect={handleCategoryChange}
          />
        </View>

        <TextField placeholder={getText(currentLanguage, 'searchPlaceholder')} value={search} onChangeText={setSearch} />

        <View className="mt-3 flex-row gap-2">
          <Chip label={getText(currentLanguage, 'price')} active={sort === 'price'} onPress={() => setSort((value) => value === 'price' ? '' : 'price')} />
          <Chip label={getText(currentLanguage, 'rating')} active={sort === 'rating'} onPress={() => setSort((value) => value === 'rating' ? '' : 'rating')} />
        </View>

        {Boolean(category) && (
          <View className="mt-3">
            <Text className="text-xs text-[#3f4949]">{getText(currentLanguage, 'category')}: {selectedCategoryLabel}</Text>
          </View>
        )}

        {loading && <ActivityIndicator className="mt-4" />}

        <View className="mt-6 flex-row gap-2">
          <Chip
            label={getText(currentLanguage, 'items')}
            active={selectedTab === 'Items'}
            onPress={() => setSelectedTab('Items')}
          />

          <Chip
            label={getText(currentLanguage, 'shops')}
            active={selectedTab === 'Shops'}
            onPress={() => setSelectedTab('Shops')}
          />
        </View>

    <View className="mt-5 flex-row flex-wrap justify-between">
  {results.map((entry) => (
    <View key={entry.id} className="w-[48%] mb-3">
      {selectedTab === 'Items' ? (
        <ItemCard
          item={entry}
          onPress={() => navigation.navigate('Product', { id: entry.id })}
          style={{ width: '100%' }}
        />
      ) : (
        <ShopCard
          shop={entry}
          onPress={() => navigation.navigate('ShopDetail', { id: entry.id })}
          style={{ width: '100%' }}
        />
      )}
    </View>
  ))}

  {showEmptyState && (
    <View className="w-full rounded-[24px] border border-dashed border-white/20 bg-white/5 px-4 py-5">
      <Text className="text-[12px] text-[#89a1a9]">{getText(currentLanguage, 'noResults')}</Text>
    </View>
  )}
</View>
      </View>
    </ScreenShell>
  );
}
