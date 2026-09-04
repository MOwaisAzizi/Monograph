import React, { useMemo, useState } from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { Chip, ScreenShell, SegmentedTabs, TextField } from '../components/ui';
import { SearchItemCard, ShopCard } from '../components/cards';
import { getText } from '../i18n';
import { CategoryFilterRow } from './HomeScreen';
import { useCategories } from '../hooks/useCategories';
import { useSearchResults } from '../hooks/useSearchResults';

export default function SearchScreen({ navigation, route }) {
  const currentLanguage = useSelector((state) => state.language.currentLanguage);
  const { search: initialSearch = '', category: initialCategory = '' } = route.params || {};

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);

  const [selectedTab, setSelectedTab] = useState('items');
  const [sort, setSort] = useState('');

  const { categories } = useCategories(currentLanguage);
  const { items, shops, loading } = useSearchResults({ search, category, sort });

  const results = selectedTab === 'items' ? items : shops;
  const selectedCategoryLabel = useMemo(
    () => categories.find((option) => option.key === category)?.label || category,
    [categories, category],
  );

  const hasQuery = Boolean(search.trim() || category);
  const showEmptyState = !loading && hasQuery && results.length === 0;

  const handleCategoryChange = (nextCategoryKey) => {
    const nextCategory = category === nextCategoryKey ? '' : nextCategoryKey;
    setCategory(nextCategory);
    navigation.setParams({
      ...(route.params || {}),
      search: search.trim(),
      category: nextCategory,
    });
  };

  return (
    <ScreenShell contentClassName="pb-6">
      <View className="px-5">
        <View className="mb-3 mt-6">
          <CategoryFilterRow
            categories={categories}
            activeKey={category}
            onSelect={handleCategoryChange}
          />
        </View>

        <TextField
          placeholder={getText(currentLanguage, 'searchPlaceholder')}
          value={search}
          onChangeText={setSearch}
        />

        <View className="mt-3 flex-row gap-2">
          <Chip
            label={getText(currentLanguage, 'price')}
            active={sort === 'price'}
            onPress={() => setSort((value) => (value === 'price' ? '' : 'price'))}
          />
          <Chip
            label={getText(currentLanguage, 'rating')}
            active={sort === 'rating'}
            onPress={() => setSort((value) => (value === 'rating' ? '' : 'rating'))}
          />
        </View>

        {Boolean(category) && (
          <View className="mt-3">
            <Text className="text-xs text-[#3f4949]">
              {getText(currentLanguage, 'category')}: {selectedCategoryLabel}
            </Text>
          </View>
        )}

        {loading && <ActivityIndicator className="mt-4" />}

        <SegmentedTabs
          tabs={[
            { key: 'items', label: getText(currentLanguage, 'items') },
            { key: 'shops', label: getText(currentLanguage, 'shops') },
          ]}
          activeKey={selectedTab}
          onChange={setSelectedTab}
        />

        {/* <View className="mt-5 flex-row flex-wrap justify-between">
          {results.map((entry) => (
            <View key={entry.id} className="w-[48%] mb-3">
              {selectedTab === 'items' ? (
                <SearchItemCard
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
              <Text className="text-[12px] text-[#89a1a9]">
                {getText(currentLanguage, 'noResults')}
              </Text>
            </View>
          )}
        </View> */}

        <View className="mt-5 w-full">
  {results.map((entry) => (
    <View key={entry.id} className="mb-3 w-full">
      {selectedTab === "items" ? (
        <SearchItemCard
          item={entry}
          onPress={() =>
            navigation.navigate("Product", { id: entry.id })
          }
          style={{ width: "100%" }}
        />
      ) : (
        <ShopCard
          shop={entry}
          onPress={() =>
            navigation.navigate("ShopDetail", { id: entry.id })
          }
          style={{ width: "100%" }}
        />
      )}
    </View>
  ))}

  {showEmptyState && (
    <View className="w-full rounded-[24px] border border-dashed border-white/20 bg-white/5 px-4 py-5">
      <Text className="text-[12px] text-[#89a1a9]">
        {getText(currentLanguage, "noResults")}
      </Text>
    </View>
  )}
</View>
      </View>
    </ScreenShell>
  );
}
