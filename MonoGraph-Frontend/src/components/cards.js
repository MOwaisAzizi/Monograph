import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const fallbackImage = 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=900&q=80';

const CARD_WIDTH = 150;

function ConditionBadge({ label }) {
  if (!label) {
    return null;
  }
  return (
    <View className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1">
      <Text className="text-[9px] font-bold uppercase tracking-wide text-[#223233]">{label}</Text>
    </View>
  );
}

function FavoriteButton({ active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      className="absolute right-2 top-2 h-7 w-7 items-center justify-center rounded-full bg-white/90"
    >
      <Ionicons name={active ? 'heart' : 'heart-outline'} size={14} color={active ? '#e0555f' : '#4e6667'} />
    </Pressable>
  );
}

export function ItemCard({ item, onPress, onToggleFavorite, style, compact = false }) {
  const width = style?.width ?? (compact ? 120 : CARD_WIDTH);

  return (
    <Pressable onPress={onPress} style={[{ width }, style]} className="overflow-hidden rounded-[20px] bg-white">
      <View className="relative">
        <Image
          source={{ uri: item.image || fallbackImage }}
          resizeMode="cover"
          style={{ width, height: width }}
          className="rounded-[20px] bg-[#dbe7e6]"
        />
        <ConditionBadge label={item.condition} />
        <FavoriteButton active={item.isFavorite} onPress={onToggleFavorite} />
      </View>

      <View className="mt-2 px-0.5">
        <Text className="text-[12px] font-semibold text-[#223233]" numberOfLines={1}>
          {item.title}
        </Text>

        <View className="mt-1.5 flex-row items-center gap-1">
          <View className="h-4 w-4 items-center justify-center rounded-full bg-[#f1b33f]">
            <Ionicons name="pricetag" size={9} color="#fff" />
          </View>
          <Text className="text-[12px] font-bold text-[#223233]">{item.price || '—'}</Text>
        </View>

        {item.distanceText ? (
          <View className="mt-1 flex-row items-center gap-1">
            <Ionicons name="location" size={10} color="#c0392b" />
            <Text className="text-[10px] text-[#7a8f8f]">{item.distanceText}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

export function ShopCard({ shop, onPress, style, compact = false }) {
  const width = style?.width ?? (compact ? 110 : 130);
  const avatarSize = compact ? 56 : 68;

  return (
    <Pressable onPress={onPress} style={[{ width }, style]} className="items-center">
      <View
        style={{ width: '100%', height: avatarSize + 20 }}
        className="overflow-hidden rounded-2xl bg-[#dbe7e6]"
      >
        {shop.coverImage ? (
          <Image source={{ uri: shop.coverImage }} resizeMode="cover" className="h-full w-full" />
        ) : null}
      </View>

      <View
        style={{ width: avatarSize, height: avatarSize, marginTop: -avatarSize / 2 }}
        className="items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#c9d8d7]"
      >
        {shop.image ? (
          <Image source={{ uri: shop.image }} resizeMode="cover" className="h-full w-full" />
        ) : (
          <Text className="text-[12px] font-bold text-[#5a7172]">
            {shop.title?.slice(0, 2).toUpperCase() || 'SH'}
          </Text>
        )}
      </View>

      <Text className="mt-2 text-[12px] font-semibold text-[#223233]" numberOfLines={1}>
        {shop.title}
      </Text>

      <View className="mt-1 flex-row items-center gap-1">
        {shop.rating ? (
          <>
            <Ionicons name="star" size={10} color="#f1b33f" />
            <Text className="text-[10px] font-semibold text-[#4e6667]">{shop.rating}</Text>
            <Text className="text-[10px] text-[#7a8f8f]"> · </Text>
          </>
        ) : null}
        <Text className="text-[10px] text-[#7a8f8f]">{shop.itemsCountText || (shop.itemsCount != null ? `${shop.itemsCount} items` : '')}</Text>
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