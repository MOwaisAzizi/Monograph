import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const fallbackImage = 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=900&q=80';

function ItemImage({ image, title, compact = false }) {
    return image ? (
        <Image
            source={{ uri: image }}
            resizeMode="cover"
            className={`${compact ? 'h-20 w-20' : 'h-24 w-24'} rounded-2xl bg-[#dbe7e6]`}
        />
    ) : (
        <View
            className={`${compact ? 'h-20 w-20' : 'h-24 w-24'} items-center justify-center rounded-2xl bg-[#dbe7e6]`}
        >
            <Text className="text-[11px] font-bold text-[#5a7172]">{title?.slice(0, 2).toUpperCase() || 'UI'}</Text>
        </View>
    );
}

export function ItemCard({ item, onPress, compact = false }) {
    return (
        <Pressable
            onPress={onPress}
            className={`mb-4 overflow-hidden rounded-[24px] border border-[#d8e2e1] bg-white ${compact ? 'mb-3' : ''}`}
        >
            <View className={`flex-row ${compact ? 'p-3' : 'p-4'} gap-3`}>
                <ItemImage image={item.image || fallbackImage} title={item.title} compact={compact} />
                <View className="flex-1 justify-between">
                    <View>
                        <Text className="text-[14px] font-bold text-[#223233]" numberOfLines={1}>
                            {item.title}
                        </Text>
                        <Text className="mt-1 text-[11px] text-[#789091]" numberOfLines={2}>
                            {item.description || item.locationText || item.businessName}
                        </Text>
                    </View>
                    <View className="mt-3 flex-row items-center justify-between">
                        <View>
                            <Text className="text-[14px] font-bold text-[#0f6b75]">{item.price || '—'}</Text>
                            <Text className="text-[10px] text-[#7a8f8f]">{item.categoryName}</Text>
                        </View>
                        <View className="flex-row items-center gap-1 rounded-full bg-[#eef6f6] px-2 py-1">
                            <Ionicons name="star" size={11} color="#f1b33f" />
                            <Text className="text-[10px] font-semibold text-[#365354]">{item.rating}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </Pressable>
    );
}

export function ShopCard({ shop, onPress, compact = false }) {
    return (
        <Pressable
            onPress={onPress}
            className={`mb-4 overflow-hidden rounded-[24px] border border-[#d8e2e1] bg-white ${compact ? 'mb-3' : ''}`}
        >
            <View className={`flex-row ${compact ? 'p-3' : 'p-4'} gap-3`}>
                <View className="h-16 w-16 items-center justify-center rounded-2xl bg-[#dbe7e6]">
                    <Text className="text-[12px] font-bold text-[#5a7172]">{shop.title?.slice(0, 2).toUpperCase() || 'SH'}</Text>
                </View>
                <View className="flex-1 justify-between">
                    <View>
                        <Text className="text-[14px] font-bold text-[#223233]" numberOfLines={1}>
                            {shop.title}
                        </Text>
                        <Text className="mt-1 text-[11px] text-[#789091]" numberOfLines={1}>
                            {shop.description || shop.address}
                        </Text>
                    </View>
                    <View className="mt-3 flex-row items-center justify-between">
                        <Text className="text-[11px] font-semibold text-[#4e6667]">{shop.businessType}</Text>
                        <View className="flex-row items-center gap-1 rounded-full bg-[#eef6f6] px-2 py-1">
                            <Ionicons name="star" size={11} color="#f1b33f" />
                            <Text className="text-[10px] font-semibold text-[#365354]">{shop.rating}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </Pressable>
    );
}

export function TextRow({ label, value }) {
    return (
        <View className="flex-row items-center justify-between rounded-2xl border-b border-[#d9e3e2] py-3">
            <Text className="text-[12px] text-[#213233]">{label}</Text>
            <Text className="text-[12px] font-semibold text-[#7a8f8f]">{value}</Text>
        </View>
    );
}