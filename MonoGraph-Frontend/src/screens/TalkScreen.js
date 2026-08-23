import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenShell } from '../components/ui';
import api from '../services/api';
import {
  getConversationStatusBadge,
  getConversationTitle,
  getItemImageUri,
  getLastMessagePreview,
  getOfferOrderPriceLine,
} from '../helpers/chatInbox';
import { getText } from '../i18n';

const TAB_OPTIONS = [
  { key: 'buying', label: 'Buying' },
  { key: 'selling', label: 'Selling' },
];

const STATUS_STYLES = {
  pending: 'bg-[#f3c76d] bg-opacity-15',
  accepted: 'bg-[#9ed0a6] bg-opacity-15',
  order: 'bg-[#7dc1d9] bg-opacity-15',
  rejected: 'bg-[#e98c8c] bg-opacity-15',
  cancelled: 'bg-[#b4b8b8] bg-opacity-15',
  chat: 'bg-[#ecf2f2] bg-opacity-15',
  neutral: 'bg-[#ecf2f2] bg-opacity-15',
};

const STATUS_TEXT = {
  pending: 'text-[#8b5d00]',
  accepted: 'text-[#1e5d3a]',
  order: 'text-[#0d5f78]',
  rejected: 'text-[#8d2626]',
  cancelled: 'text-[#4b5b5d]',
  chat: 'text-[#5f7676]',
  neutral: 'text-[#5f7676]',
};

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
};

export default function TalkScreen({ navigation }) {
  const currentLanguage = useSelector((state) => state.language.currentLanguage);
  const currentUserId = useSelector((state) => state.auth?.user?._id || state.auth?.user?.id);
  const [activeTab, setActiveTab] = useState('buying');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        const response = await api.listConversations(activeTab);
        setConversations(response?.data?.data?.conversations || []);
      } catch (error) {
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [activeTab]);

  const headerLabel = useMemo(() => {
    const label = activeTab === 'buying' ? 'Buying' : 'Selling';
    return getText(currentLanguage, label.toLowerCase()) || label;
  }, [activeTab, currentLanguage]);

  const openThread = (conversation) => {
    const item = conversation?.item || {};
    const otherParticipant = conversation?.otherParticipant || {};
    navigation.navigate('Chat', {
      conversationId: conversation?._id || null,
      itemId: item?._id || item?.id,
      itemTitle: getConversationTitle(conversation, currentLanguage),
      sellerId: conversation?.sellerId || otherParticipant?._id || otherParticipant?.id,
      buyerId: conversation?.buyerId,
      otherParticipantName: otherParticipant?.fullname || 'User',
      otherParticipantAvatar: otherParticipant?.avatar || otherParticipant?.profileImage || null,
      latestOffer: conversation?.latestOffer || null,
      latestOrder: conversation?.latestOrder || null,
      hasConversation: Boolean(conversation?.hasConversation),
      activeRole: activeTab,
    });
  };

  const renderRow = ({ item }) => {
    const badge = getConversationStatusBadge({
      latestOffer: item?.latestOffer,
      latestOrder: item?.latestOrder,
      currentUserId,
      language: currentLanguage,
    });
    const priceLine = getOfferOrderPriceLine({
      latestOffer: item?.latestOffer,
      latestOrder: item?.latestOrder,
      language: currentLanguage,
    });
    const secondaryLine =
      priceLine || getLastMessagePreview({ lastMessage: item?.lastMessage, language: currentLanguage });
    const dateLabel = formatDate(badge.updatedAt);

    const otherParticipant = item?.otherParticipant || {};
    const imageUri = getItemImageUri(item?.item || {});
    const displayName = otherParticipant.fullname || 'User';

    return (
      <Pressable
        onPress={() => openThread(item)}
        className="mb-3 flex-row items-center rounded-[24px] border border-[#d7e1e0] bg-white px-3 py-3"
      >
        <Image
          source={{ uri: imageUri || 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=900&q=80' }}
          resizeMode="cover"
          className="h-14 w-14 rounded-2xl bg-[#dfe9e8]"
        />

        <View className="ml-3 flex-1">
          <View className="flex-row items-start justify-between">
            <Text className="flex-1 text-[13px] font-bold text-[#203030]" numberOfLines={1}>
              {getConversationTitle(item, currentLanguage)}
            </Text>

            <View className="ml-2 items-end">
              <View className={`rounded-full px-2 py-1 ${STATUS_STYLES[badge.pill] || STATUS_STYLES.neutral}`}>
                <Text className={`text-[9px] font-semibold ${STATUS_TEXT[badge.pill] || STATUS_TEXT.neutral}`}>
                  {badge.label}
                </Text>
              </View>
              {dateLabel ? (
                <Text className="mt-1 text-[9px] text-[#8ba0a0]">{dateLabel}</Text>
              ) : null}
            </View>
          </View>

          <Text className="mt-1 text-[11px] text-[#5d7676]" numberOfLines={1}>
            {displayName}
          </Text>

          <Text className="mt-1 text-[11px] text-[#314243]" numberOfLines={2}>
            {secondaryLine}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <ScreenShell contentClassName="px-4 pb-5 pt-4">
      <View className="mb-4 flex-row rounded-full bg-white p-1 shadow-sm">
        {TAB_OPTIONS.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-full px-3 py-2 ${activeTab === tab.key ? 'bg-[#0f6b75]' : 'bg-transparent'}`}
          >
            <Text className={`text-center text-[12px] font-semibold ${activeTab === tab.key ? 'text-white' : 'text-[#425a5a]'}`}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-[18px] font-bold text-[#203030]">{headerLabel}</Text>
        <View className="flex-row items-center gap-2">
          <Ionicons name="chatbubbles-outline" size={16} color="#5d7676" />
          <Text className="text-[11px] text-[#5d7676]">{conversations.length}</Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center py-12">
          <ActivityIndicator color="#0f6b75" />
        </View>
      ) : conversations.length === 0 ? (
        <View className="mt-8 items-center justify-center rounded-[24px] border border-dashed border-[#d7e1e0] bg-white/60 px-5 py-8">
          <Text className="text-[13px] text-[#5d7676]">No conversations yet.</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => String(item._id || item.threadKey)}
          renderItem={renderRow}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenShell>
  );
}
