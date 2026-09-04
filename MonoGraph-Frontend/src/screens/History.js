import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, SectionList, Image, Text, View, Pressable } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenShell, SegmentedTabs } from '../components/ui';
import { getText } from '../i18n';
import api from '../services/api';
import {
  getHistoryImage,
  getHistoryPrice,
  getHistoryTitle,
  getOrderStatusLabel,
  getUserRoleForOrder,
} from '../helpers/history';
import { groupByDay } from '../helpers/dateGroups';

// Solid light bg + dark text per status — used on the small pill badge.
const STATUS_STYLES = {
  pending: 'bg-[#FAEEDA]',
  confirmed: 'bg-[#E6F1FB]',
  completed: 'bg-[#EAF3DE]',
  cancelled: 'bg-[#FCEBEB]',
  disputed: 'bg-[#FCEBEB]',
};

const STATUS_TEXT = {
  pending: 'text-[#633806]',
  confirmed: 'text-[#0C447C]',
  completed: 'text-[#27500A]',
  cancelled: 'text-[#791F1F]',
  disputed: 'text-[#791F1F]',
};

// Left-edge stripe color per status — lets you scan outcomes without reading each pill.
const STRIPE_COLORS = {
  pending: '#854F0B',
  confirmed: '#0C447C',
  completed: '#3B6D11',
  cancelled: '#A32D2D',
  disputed: '#A32D2D',
};

const moneyText = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return '0 AFN';
  return `${new Intl.NumberFormat('en-US').format(number)} AFN`;
};

export default function HistoryScreen({ navigation }) {
  const currentLanguage = useSelector((state) => state.language.currentLanguage);
  const currentUserId = useSelector((state) => state.auth?.user?._id || state.auth?.user?.id);
  const [activeTab, setActiveTab] = useState('bought');
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  // Summary counts for the two stat tiles up top. Comes from the same
  // /user/stats endpoint the profile screen uses — expects the response
  // to include `bought` and `sold` counts alongside `listed`/`rating`.
  const [stats, setStats] = useState({ bought: 0, sold: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      try {
        const data = await api.getUserStats();
        if (isMounted) setStats({ bought: data?.bought || 0, sold: data?.sold || 0 });
      } catch (error) {
        // keep zeros on failure, no need to block the rest of the screen
      } finally {
        if (isMounted) setStatsLoading(false);
      }
    };

    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

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
        setAllOrders(allOrders);
      } catch (error) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [currentUserId]);

  useEffect(() => {
    setOrders(allOrders.filter((order) =>
      ['confirmed', 'completed'].includes(order?.status) && getUserRoleForOrder(currentUserId, order) === activeTab,
    ));
  }, [activeTab, allOrders, currentUserId]);

  const sections = useMemo(() => groupByDay(orders, 'updatedAt'), [orders]);

  const headerLabel = useMemo(() => {
    return getText(currentLanguage, activeTab);
  }, [activeTab, currentLanguage]);

  const renderRow = ({ item }) => {
    const status = getOrderStatusLabel(item?.status, currentLanguage);
    const title = getHistoryTitle(item, currentLanguage);
    const imageUri = getHistoryImage(item);
    const price = moneyText(getHistoryPrice(item));
    const role = getUserRoleForOrder(currentUserId, item);
    const stripeColor = STRIPE_COLORS[item?.status] || '#8BA0A0';

    return (
      <View className="mb-3 flex-row overflow-hidden rounded-[16px] border border-[#d7e1e0] bg-white">
        <View style={{ width: 3, backgroundColor: stripeColor }} />
        <View className="flex-1 flex-row items-center px-3 py-3">
          <Image
            source={{ uri: imageUri }}
            resizeMode="cover"
            className="h-11 w-11 rounded-xl bg-[#dfe9e8]"
          />

          <View className="ml-3 flex-1">
            <View className="flex-row items-center justify-between">
              <Text className="flex-1 text-[13px] font-medium text-[#203030]" numberOfLines={1}>
                {title}
              </Text>
              <View
                className={`ml-2 rounded-full px-2 py-1 ${STATUS_STYLES[item?.status] || 'bg-[#ecf2f2]'}`}
              >
                <Text
                  className={`text-[9px] font-semibold ${STATUS_TEXT[item?.status] || 'text-[#5f7676]'}`}
                >
                  {status}
                </Text>
              </View>
            </View>

            <Text className="mt-1 text-[11px] text-[#5d7676]" numberOfLines={1}>
              {role === 'bought' ? getText(currentLanguage, 'boughtFrom') : getText(currentLanguage, 'soldTo')} · {item?.seller?.fullname || item?.buyer?.fullname || getText(currentLanguage, 'user')}
            </Text>

            <View className="mt-1.5 flex-row items-center justify-between">
              <Text className="text-[13px] font-medium text-[#203030]">{price}</Text>
              <Text className="text-[10px] text-[#8ba0a0]">
                {item?.orderLocation?.location?.address?.[currentLanguage] || getText(currentLanguage, 'locationAccepted')}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScreenShell scroll={false} contentClassName="px-4 pb-5 pt-4">
      <View className="mb-5 flex-row items-center justify-between">
        <Text className="text-[20px] font-medium text-[#203030]">{getText(currentLanguage, 'orderHistory')}</Text>
        <Pressable onPress={() => navigation.navigate('Search')}>
          <Ionicons name="search-outline" size={20} color="#5d7676" />
        </Pressable>
      </View>

      {/* Summary tiles — this is what makes History read as a ledger rather
          than a copy of the chat inbox. */}
      <View className="mb-5 flex-row gap-3">
        <View className="flex-1 rounded-2xl border border-[#d7e1e0] bg-white p-3">
          <Text className="text-[11px] text-[#5d7676]">{getText(currentLanguage, 'totalBought')}</Text>
          <Text className="mt-1 text-[17px] font-medium text-[#203030]">
            {statsLoading ? '—' : `${stats.bought} ${getText(currentLanguage, 'orders')}`}
          </Text>
        </View>
        <View className="flex-1 rounded-2xl border border-[#d7e1e0] bg-white p-3">
          <Text className="text-[11px] text-[#5d7676]">{getText(currentLanguage, 'totalSold')}</Text>
          <Text className="mt-1 text-[17px] font-medium text-[#203030]">
            {statsLoading ? '—' : `${stats.sold} ${getText(currentLanguage, 'orders')}`}
          </Text>
        </View>
      </View>

      <SegmentedTabs
        tabs={[
          { key: 'bought', label: getText(currentLanguage, 'bought') },
          { key: 'sold', label: getText(currentLanguage, 'sold') },
        ]}
        activeKey={activeTab}
        onChange={setActiveTab}
      />

      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-[15px] font-medium text-[#203030]">{headerLabel}</Text>
        <Text className="text-[11px] text-[#5d7676]">{orders.length} {getText(currentLanguage, 'orders')}</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center py-12">
          <ActivityIndicator color="#0f6b75" />
        </View>
      ) : orders.length === 0 ? (
        <View className="mt-8 items-center justify-center rounded-[20px] border border-dashed border-[#d7e1e0] bg-white/60 px-5 py-8">
          <Text className="text-[13px] text-[#5d7676]">{getText(currentLanguage, 'noHistoryItems')}</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => String(item._id || item.id)}
          renderItem={renderRow}
          renderSectionHeader={({ section }) => (
            <Text className="mb-2 mt-1 text-[12px] font-semibold text-[#5d7676]">{section.title}</Text>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </ScreenShell>
  );
}
