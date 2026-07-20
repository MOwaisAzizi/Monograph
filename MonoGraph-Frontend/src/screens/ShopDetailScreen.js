import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { capitalize, normalizeBusiness, normalizeItem } from '../utils/marketplace';
import { ActionPill, Chip, ScreenShell, SectionHeader } from '../components/ui';
import { ItemCard } from '../components/cards';

export default function ShopDetailScreen({ route, navigation }) {
    const { id } = route.params;
    const [shop, setShop] = useState(null);
    const [items, setItems] = useState([]);

    useEffect(() => {
        let mounted = true;

        Promise.all([api.get(`/business/${id}`), api.get(`/item?business=${id}`)])
            .then(([shopResponse, itemsResponse]) => {
                if (!mounted) {
                    return;
                }

                const rawShop = shopResponse?.data?.data?.business || shopResponse?.data?.data?.Business || shopResponse?.data?.data || {};
                setShop(normalizeBusiness(rawShop));
                setItems((itemsResponse?.data?.data?.Items || []).map(normalizeItem));
            })
            .catch(() => {
                if (mounted) {
                    setShop(null);
                    setItems([]);
                }
            });

        return () => {
            mounted = false;
        };
    }, [id]);

    return (
        <ScreenShell scroll={true} contentClassName="flex-1 pb-6">
            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="px-5 pt-2">
                    <View className="h-56 rounded-[28px] bg-[#d6e3e2]">
                        <View className="absolute left-4 top-4 h-9 w-9 items-center justify-center rounded-full bg-white/60">
                            <Pressable onPress={() => navigation.goBack()}>
                                <Ionicons name="chevron-back" size={16} color="#2a3535" />
                            </Pressable>
                        </View>
                        <View className="absolute right-4 top-4 h-9 w-9 items-center justify-center rounded-full bg-white/60">
                            <Ionicons name="heart-outline" size={16} color="#2a3535" />
                        </View>
                    </View>

                    <View className="mt-5 flex-row items-start justify-between">
                        <View>
                            <Text className="text-[18px] font-bold text-[#eff5f4]">{shop?.title || 'Shop name'}</Text>
                            <Text className="mt-1 text-[12px] text-[#9ab0b0]">{shop?.location || shop?.address || 'Herat'}</Text>
                        </View>
                        <ActionPill label="Follow" active />
                    </View>

                    <View className="mt-3 flex-row flex-wrap gap-2">
                        <Chip label={`★ ${shop?.rating || '4.2'}`} active />
                        <Chip label={capitalize(shop?.businessType || 'shop')} />
                    </View>

                    <View className="mt-4">
                        <SectionHeader title="About" />
                        <Text className="text-[12px] leading-5 text-[#b3c2c2]">
                            {shop?.description || 'A clean reusable shop detail layout that accepts backend values without changing the UI structure.'}
                        </Text>
                    </View>

                    <View className="mt-5 flex-row gap-2">
                        <Chip label="Items" active />
                        <Chip label="Reviews" />
                    </View>

                    <View className="mt-5 space-y-3">
                        {items.map((item) => (
                            <ItemCard key={item.id} item={item} compact onPress={() => navigation.navigate('Product', { id: item.id })} />
                        ))}

                        {!items.length ? (
                            <View className="rounded-[24px] border border-dashed border-white/20 bg-white/5 px-4 py-5">
                                <Text className="text-[12px] text-[#89a1a1]">Shop items will appear here.</Text>
                            </View>
                        ) : null}
                    </View>
                </View>
            </ScrollView>
        </ScreenShell>
    );
}