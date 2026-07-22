import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import api from '../services/api';
import { normalizeBusiness, normalizeItem } from '../utils/marketplace';
import { IconCircleButton, ScreenShell, SectionHeader } from '../components/ui';
import { ItemCard, ShopCard } from '../components/cards';

// Static category filter list (for now). Swap for backend-driven categories later.
const CATEGORY_FILTERS = [
  { key: 'all', label: 'All', icon: 'grid' },
  { key: 'electronics', label: 'Electronics', icon: 'tv' },
  { key: 'clothing', label: 'Clothing', icon: 'shirt' },
  { key: 'furniture', label: 'Furniture', icon: 'armchair' },
  { key: 'books', label: 'Books', icon: 'book' },
  { key: 'kitchen', label: 'Kitchen', icon: 'utensils' },
];

function CategoryFilterRow({ activeKey, onSelect }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="px-1 gap-5"
    >
      {CATEGORY_FILTERS.map((cat) => {
        const active = cat.key === activeKey;
        return (
          <View key={cat.key} className="items-center">
            <IconCircleButton
              icon={cat.icon}
              active={active}
              onPress={() => onSelect(cat.key)}
            />
            <Text
              className={`mt-1.5 text-[11px] ${
                active ? 'text-[#0f3d3e] font-semibold' : 'text-[#7c9291]'
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
  const [activeCategory, setActiveCategory] = useState('all');
  const [homeData, setHomeData] = useState({
    newItems: [],
    cheapItems: [],
    highRatedItems: [],
    nearestItems: [],
    nearestShops: [],
  });

  useEffect(() => {
    let mounted = true;

    api
      .get('/home')
      .then((homeResponse) => {
        if (!mounted) {
          return;
        }

        setHomeData({
          cheapItems: (homeResponse.data.data.cheapItems || []).map(normalizeItem),
          highRatedItems: (homeResponse.data.data.highRatedItems || []).map(normalizeItem),
          newItems: (homeResponse.data.data.newItems || []).map(normalizeItem),
          nearestItems: (homeResponse.data.data.nearestItems || []).map(normalizeItem),
          nearestShops: (homeResponse.data.data.nearestShops || []).map(normalizeBusiness),
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
      { key: 'Popular', title: 'Popular', actionLabel: 'See all', data: homeData.newItems, type: 'item' },
      { key: 'Highly Rated', title: 'Highly Rated', actionLabel: 'See all', data: homeData.highRatedItems, type: 'item' },
      { key: 'Cheap', title: 'Cheap', actionLabel: 'See all', data: homeData.cheapItems, type: 'item' },
      { key: 'Near You', title: 'Near You', actionLabel: 'See all', data: homeData.nearestItems, type: 'item' },
      { key: 'Shops', title: 'Shops', actionLabel: 'See all', data: homeData.nearestShops, type: 'shop' },
    ],
    [homeData],
  );

  return (
    <ScreenShell contentClassName="px-5 pb-6 pt-4">
      {/* Static category filter row - scrolls horizontally */}
      <View className="mt-2">
        <CategoryFilterRow activeKey={activeCategory} onSelect={setActiveCategory} />
      </View>

      {/* Vertically scrolling list of sections, each scrolling horizontally */}
      <View className="mt-6 space-y-7">
        {sections.map((section) => (
          <View key={section.key}>
            <SectionHeader
              title={section.title}
              actionLabel={section.actionLabel}
              onAction={() => navigation.navigate('Search')}
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