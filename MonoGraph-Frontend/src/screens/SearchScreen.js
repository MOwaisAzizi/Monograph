import React, { useEffect, useState } from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import api from '../services/api';
import { normalizeBusiness, normalizeItem } from '../utils/marketplace';
import { Chip, ScreenShell, ScreenHeader, TextField } from '../components/ui';
import { ItemCard, ShopCard } from '../components/cards';

export default function SearchScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState('Items');

  const [items, setItems] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const timer = setTimeout(() => {
      if (!search.trim()) {
        setItems([]);
        setShops([]);
        return;
      }

      fetchResults();

    }, 400);

    return () => clearTimeout(timer);

  }, [search]);


  const fetchResults = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/search?search=${encodeURIComponent(search)}`
      );

      const data = response?.data?.data;

      setItems(
        (data?.items || []).map(normalizeItem)
      );

      setShops(
        (data?.businesses || []).map(normalizeBusiness)
      );

    } catch (error) {
      console.log("Search error:", error);

      setItems([]);
      setShops([]);

    } finally {
      setLoading(false);
    }
  };


  const results = selectedTab === 'Items' ? items : shops;


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


        <View className="mt-5 space-y-3">

          {results.map((entry) =>
            selectedTab === 'Items' ? (

              <ItemCard
                key={entry.id}
                item={entry}
                onPress={() =>
                  navigation.navigate(
                    'Product',
                    { id: entry.id }
                  )
                }
              />

            ) : (

              <ShopCard
                key={entry.id}
                shop={entry}
                onPress={() =>
                  navigation.navigate(
                    'ShopDetail',
                    { id: entry.id }
                  )
                }
              />

            )
          )}


          {!loading && search && results.length === 0 && (
            <View className="rounded-[24px] border border-dashed border-white/20 bg-white/5 px-4 py-5">

              <Text className="text-[12px] text-[#89a1a1]">
                No results found
              </Text>

            </View>
          )}

        </View>

      </View>

    </ScreenShell>
  );
}