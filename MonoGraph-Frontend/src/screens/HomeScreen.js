import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, SectionList, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { normalizeShop, normalizeItem } from '../utils/marketplace';
import { IconCircleButton, ScreenShell, SectionHeader } from '../components/ui';
import { ItemCard, ShopCard } from '../components/cards';
import { getText } from '../i18n';
/**
 * Turns raw category API objects into the shape the filter row renders.
 * Picks the label for the given language, falling back to English if
 * missing — handles both a nested `{ title }` per language (matching the
 * confirmed multipleFields shape) and a flat string per language, since
 * Category's `singleField` shape hasn't been confirmed against the schema
 * yet (see seed.js notes).
 *
 * @param {Array} categories - raw array from GET /categories
 * @param {string} lang - 'en' | 'fa' | 'ps'
 */

export function normalizeCategoryFilters(categories = [], lang = 'en') {
  return categories.map((cat) => {
    const translation = cat.translation?.[lang] ?? cat.translation?.en ?? {};
    const label =
      typeof translation === 'string'
        ? translation
        : translation?.title || '';

    return {
      key: cat._id || cat.id || '',
      label,
      icon: cat.icon || 'pricetag',
    };
  });
}

export const ALL_CATEGORY = { key: '', label: 'All', icon: 'grid' };

export function CategoryFilterRow({ categories, activeKey, onSelect }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="px-1 gap-5"
    >
      {categories.map((cat) => {
        const active = cat.key === activeKey;
        return (
          <View key={cat.key} className="items-center">
            <IconCircleButton icon={cat.icon} active={active} onPress={() => onSelect(cat.key)} />
            <Text
              className={`mt-1.5 text-[11px] ${active ? 'text-[#0f3d3e] font-semibold' : 'text-[#7c9291]'
                }`}
            >
              {cat.label}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

function HorizontalItemRow({ data, onPressItem }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-3 pr-5"
    >
      {data.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onPress={() => onPressItem(item.id)}
          style={{ width: 150 }}
        />
      ))}
    </ScrollView>
  );
}

function HorizontalShopRow({ data, onPressShop }) {
  console.log('data')
  console.log(data)
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-4 pr-5"
    >
      {data.map((shop) => (
        <ShopCard
          key={shop.id}
          shop={shop}
          onPress={() => onPressShop(shop.id)}
          style={{ width: 130 }}
        />
      ))}
    </ScrollView>
  );
}

export default function HomeScreen({ navigation }) {
  const currentLanguage = useSelector((state) => state.language.currentLanguage);
  const [activeCategory, setActiveCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [homeData, setHomeData] = useState({
    newItems: [],
    cheapItems: [],
    highRatedItems: [],
    nearestItems: [],
    nearestShops: [],
  });

  useEffect(() => {
    let mounted = true;
    const params = activeCategory ? `?category=${encodeURIComponent(activeCategory)}` : '';

    api.baseURL
      .get(`/home${params}`)
      .then((homeResponse) => {
        console.log(homeResponse.data.data)
        if (!mounted) {
          return;
        }
        console.log('homeResponse-----------------------------🍳🥞.data.data');
        setHomeData({
          cheapItems: (homeResponse.data.data.cheapItems || []).map(normalizeItem),
          highRatedItems: (homeResponse.data.data.highRatedItems || []).map(normalizeItem),
          newItems: (homeResponse.data.data.newItems || []).map(normalizeItem),
          nearestItems: (homeResponse.data.data.nearestItems || []).map(normalizeItem),
          nearestShops: (homeResponse.data.data.nearestShops || []).map(normalizeShop),
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
  }, [activeCategory]);

  useEffect(() => {
    let mounted = true;

    api.baseURL
      .get('/category')
      .then((res) => {
        if (!mounted) return;
        const list = normalizeCategoryFilters(res.data.data.categories, currentLanguage);
        setCategories([ALL_CATEGORY, ...list]);
        console.log('--------------🍞🍞🍞🧈')
        console.log(list)
        console.log('--------------🍞🍞🍞🧈')
      })
      .catch(() => {
        if (mounted) setCategories([ALL_CATEGORY]);
      });

    return () => {
      mounted = false;
    };
  }, [currentLanguage]);
  const sections = useMemo(
    () => [
      {
        key: 'New Items',
        title: getText(currentLanguage, 'newItems'),
        actionLabel: getText(currentLanguage, 'seeAll'),
        data: homeData.newItems,
        type: 'item',
      },
      {
        key: 'Highly Rated',
        title: getText(currentLanguage, 'highlyRated'),
        actionLabel: getText(currentLanguage, 'seeAll'),
        data: homeData.highRatedItems,
        type: 'item',
      },
      {
        key: 'Cheap',
        title: getText(currentLanguage, 'cheap'),
        actionLabel: getText(currentLanguage, 'seeAll'),
        data: homeData.cheapItems,
        type: 'item',
      },
      {
        key: 'Near You',
        title: getText(currentLanguage, 'nearYou'),
        actionLabel: getText(currentLanguage, 'seeAll'),
        data: homeData.nearestItems,
        type: 'item',
      },
      {
        key: 'Shops',
        title: getText(currentLanguage, 'shopsTitle'),
        actionLabel: getText(currentLanguage, 'seeAll'),
        data: homeData.nearestShops,
        type: 'shop',
      },
    ],
    [currentLanguage, homeData],
  );
  console.log('---------------------------')
  console.log(homeData)
  console.log('---------------------------')
  return (
    <ScreenShell contentClassName="px-5 pb-6 pt-4">
      <View className="mt-2">
        <CategoryFilterRow
          categories={categories}
          activeKey={activeCategory}
          onSelect={(categoryKey) => {
            const category = categories.find((cat) => cat.key === categoryKey);
            if (!category) return;
            setActiveCategory((current) => (current === category.key ? '' : category.key));
          }}
        />
      </View>
      {/* Vertically scrolling list of sections, each scrolling horizontally */}
      <View className="mt-6 space-y-7">
        {sections.map((section) => (
          <View key={section.key}>
            <SectionHeader
              title={section.title}
              actionLabel={section.actionLabel}
              onAction={() => navigation.navigate('Search', { search: '', category: activeCategory })}
            />
            {section.data.length ? (
              <View className="mt-2">
                {section.type === 'item' ? (
                  <HorizontalItemRow
                    data={section.data}
                    onPressItem={(id) => navigation.navigate('Product', { id })}
                  />
                ) : (
                  <HorizontalShopRow
                    data={section.data}
                    onPressShop={(id) => navigation.navigate('ShopDetail', { id })}
                  />
                )}
              </View>
            ) : (
              <View className="mt-2 rounded-[24px] border border-dashed border-white/20 bg-white/5 px-4 py-5">
                <Text className="text-[12px] text-[#89a1a1]">Waiting for backend data.</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScreenShell>
  );
}
