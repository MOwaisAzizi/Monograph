import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenShell, ScreenHeader } from '../components/ui';
import api from '../services/api';
import {
  getHistoryImage,
  getHistoryPrice,
  getHistoryTabKey,
  getHistoryTitle,
  getOrderStatusLabel,
  getUserRoleForOrder,
} from '../helpers/history';

const TAB_OPTIONS = [
  { key: 'bought', label: 'Bought' },
  { key: 'sold', label: 'Sold' },
];

const STATUS_STYLES = {
  pending: 'bg-[#f3c76d] bg-opacity-15',
  accepted: 'bg-[#9ed0a6] bg-opacity-15',
  completed: 'bg-[#7dc1d9] bg-opacity-15',
  rejected: 'bg-[#e98c8c] bg-opacity-15',
  cancelled: 'bg-[#b4b8b8] bg-opacity-15',
  disputed: 'bg-[#e7b7d8] bg-opacity-15',
};

const STATUS_TEXT = {
  pending: 'text-[#8b5d00]',
  accepted: 'text-[#1e5d3a]',
  completed: 'text-[#0d5f78]',
  rejected: 'text-[#8d2626]',
  cancelled: 'text-[#4b5b5d]',
  disputed: 'text-[#7b2a62]',
};

const moneyText = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return 'AFN 0';
  return `${new Intl.NumberFormat('en-US').format(number)} AFN`;
};

export default function FavoritesScreen({ navigation }) {
  const currentLanguage = useSelector((state) => state.language.currentLanguage);
  const currentUserId = useSelector((state) => state.auth?.user?._id || state.auth?.user?.id);
  const [activeTab, setActiveTab] = useState('bought');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      if (!currentUserId) {
        setOrders([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.getMyOrders();
        const allOrders = response?.data?.data?.orders || [];
        const filteredOrders = allOrders.filter(
          (order) => getUserRoleForOrder(currentUserId, order) === activeTab,
        );
        setOrders(filteredOrders);
      } catch (error) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [activeTab, currentUserId]);

  const headerLabel = useMemo(() => {
    const label = activeTab === 'bought' ? 'Bought' : 'Sold';
    return getHistoryTabKey(label) === 'sold' ? 'Sold' : 'Bought';
  }, [activeTab]);

  const renderRow = ({ item }) => {
    const status = getOrderStatusLabel(item?.status);
    const title = getHistoryTitle(item, currentLanguage);
    const imageUri = getHistoryImage(item);
    const price = moneyText(getHistoryPrice(item));
    const role = getUserRoleForOrder(currentUserId, item);

    return (
      <Pressable className="mb-3 flex-row items-center rounded-[24px] border border-[#d7e1e0] bg-white px-3 py-3">
        <Image
          source={{ uri: imageUri }}
          resizeMode="cover"
          className="h-14 w-14 rounded-2xl bg-[#dfe9e8]"
        />

        <View className="ml-3 flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="flex-1 text-[13px] font-bold text-[#203030]" numberOfLines={1}>
              {title}
            </Text>
            <View
              className={`ml-2 rounded-full px-2 py-1 ${STATUS_STYLES[item?.status] || 'bg-[#ecf2f2] bg-opacity-15'}`}
            >
              <Text
                className={`text-[9px] font-semibold ${STATUS_TEXT[item?.status] || 'text-[#5f7676]'}`}
              >
                {status}
              </Text>
            </View>
          </View>

          <Text className="mt-1 text-[11px] text-[#5d7676]" numberOfLines={1}>
            {role === 'bought' ? 'Bought from' : 'Sold to'} · {item?.seller?.fullname || item?.buyer?.fullname || 'User'}
          </Text>

          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-[12px] font-semibold text-[#203030]">{price}</Text>
            <Text className="text-[11px] text-[#5d7676]">
              {item?.location?.label || 'Location accepted'}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <ScreenShell contentClassName="px-4 pb-5 pt-4">
      <ScreenHeader title="History" rightAction={() => navigation.navigate('Search')} />

      <View className="mb-4 flex-row rounded-full bg-white p-1 shadow-sm">
        {TAB_OPTIONS.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-full px-3 py-2 ${activeTab === tab.key ? 'bg-[#0f6b75]' : 'bg-transparent'}`}
          >
            <Text
              className={`text-center text-[12px] font-semibold ${activeTab === tab.key ? 'text-white' : 'text-[#425a5a]'}`}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-[18px] font-bold text-[#203030]">{headerLabel}</Text>
        <View className="flex-row items-center gap-2">
          <Ionicons name="receipt-outline" size={16} color="#5d7676" />
          <Text className="text-[11px] text-[#5d7676]">{orders.length}</Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center py-12">
          <ActivityIndicator color="#0f6b75" />
        </View>
      ) : orders.length === 0 ? (
        <View className="mt-8 items-center justify-center rounded-[24px] border border-dashed border-[#d7e1e0] bg-white/60 px-5 py-8">
          <Text className="text-[13px] text-[#5d7676]">No {activeTab} items yet.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item._id || item.id)}
          renderItem={renderRow}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </ScreenShell>
  );
}
