import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, SectionList, Image, Pressable, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenShell, SegmentedTabs } from '../components/ui';
import api from '../services/api';
import {
  getConversationStatusBadge,
  getConversationTitle,
  getItemImageUri,
  getLastMessagePreview,
  getOfferOrderPriceLine,
} from '../helpers/chatInbox';
import { getText } from '../i18n';
import { groupByDay } from '../helpers/dateGroups';

const STATUS_STYLES = {
  pending: 'bg-[#FAEEDA]',
  order: 'bg-[#E6F1FB]',
  cancelled: 'bg-[#FCEBEB]',
  chat: 'bg-[#ecf2f2]',
  neutral: 'bg-[#ecf2f2]',
};

const STATUS_TEXT = {
  pending: 'text-[#633806]',
  order: 'text-[#0C447C]',
  cancelled: 'text-[#791F1F]',
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
  const [conversationCache, setConversationCache] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConversations = async () => {
      if (conversationCache[activeTab]) {
        setConversations(conversationCache[activeTab]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await api.listConversations(activeTab);
        const nextConversations = response?.data?.data?.conversations || [];
        setConversations(nextConversations);
        setConversationCache((current) => ({ ...current, [activeTab]: nextConversations }));
      } catch (error) {
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [activeTab, conversationCache]);

  const sections = useMemo(() => groupByDay(conversations, 'sortAt'), [conversations]);

  const headerLabel = useMemo(() => {
    return getText(currentLanguage, activeTab);
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
      otherParticipantName: otherParticipant?.fullname || getText(currentLanguage, 'user'),
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
    const displayName = otherParticipant.fullname || getText(currentLanguage, 'user');

    return (
      <Pressable
        onPress={() => openThread(item)}
        className="mb-3 flex-row items-center rounded-[20px] border border-[#d7e1e0] bg-white px-3 py-3 active:opacity-70"
      >
        <View>
          <Image
            source={{ uri: imageUri || 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=900&q=80' }}
            resizeMode="cover"
            className="h-14 w-14 rounded-2xl bg-[#dfe9e8]"
          />
          {/* small "live" marker — reinforces this is an ongoing thread, not a closed record */}
          <View className="absolute -bottom-1 -right-1 h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-[#0f6b75]">
            <Ionicons name="chatbubble" size={8} color="white" />
          </View>
        </View>

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

        <Ionicons name="chevron-forward" size={16} color="#c3d1d1" style={{ marginLeft: 4 }} />
      </Pressable>
    );
  };

  return (
    <ScreenShell scroll={false} contentClassName="px-4 pb-5 pt-4">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-[20px] font-bold text-[#203030]">{getText(currentLanguage, 'messages')}</Text>
        <View className="flex-row items-center gap-1">
          <Ionicons name="chatbubbles-outline" size={16} color="#5d7676" />
          <Text className="text-[11px] text-[#5d7676]">{conversations.length}</Text>
        </View>
      </View>

      <SegmentedTabs
        tabs={[
          { key: 'buying', label: getText(currentLanguage, 'buying') },
          { key: 'selling', label: getText(currentLanguage, 'selling') },
        ]}
        activeKey={activeTab}
        onChange={setActiveTab}
      />

      {loading ? (
        <View className="flex-1 items-center justify-center py-12">
          <ActivityIndicator color="#0f6b75" />
        </View>
      ) : conversations.length === 0 ? (
        <View className="mt-8 items-center justify-center rounded-[20px] border border-dashed border-[#d7e1e0] bg-white/60 px-5 py-8">
          <Text className="text-[13px] text-[#5d7676]">{getText(currentLanguage, 'noConversations')}</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => String(item._id || item.threadKey)}
          renderItem={renderRow}
          renderSectionHeader={({ section }) => (
            <Text className="mb-2 mt-1 text-[12px] font-semibold text-[#5d7676]">{section.title}</Text>
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenShell>
  );
}
