import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { ScreenShell } from '../components/ui';
import api from '../services/api';
import { getText } from '../i18n';

const OFFER_STATUS_COLOR = {
  pending: 'text-[#7f4e00]',
  accepted: 'text-[#195736]',
  rejected: 'text-[#912e2e]',
  countered: 'text-[#7f4e00]',
  cancelled: 'text-[#4b5b5d]',
  confirmed: 'text-[#0a5d76]',
};

const OFFER_STATUS_LABEL = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  countered: 'Countered',
  cancelled: 'Cancelled',
  confirmed: 'Confirmed',
};

const moneyText = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return 'AFN 0';
  return `${new Intl.NumberFormat('en-US').format(number)} AFN`;
};

const senderIdFromMessage = (message) => {
  const sender = message?.sender;
  if (!sender) return '';
  if (typeof sender === 'string') return sender;
  return sender?._id || sender?.id || '';
};

export default function ChatScreen({ route, navigation }) {
  const language = useSelector((state) => state.language.currentLanguage);
  const currentUserId = useSelector((state) => state.auth?.user?._id || state.auth?.user?.id);
  const {
    conversationId: initialConversationId,
    itemId,
    itemTitle = '',
    sellerId,
    otherParticipantName = 'User',
    otherParticipantAvatar = null,
    latestOffer = null,
  } = route?.params || {};

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [conversationId, setConversationId] = useState(initialConversationId || null);
  const [loading, setLoading] = useState(false);
  const [offerState, setOfferState] = useState(latestOffer);
  const [counterMode, setCounterMode] = useState(false);
  const [counterPrice, setCounterPrice] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const loadConversation = async () => {
      if (!initialConversationId && (!itemId || !sellerId)) return;

      try {
        setLoading(true);

        let nextConversationId = initialConversationId;

        if (!nextConversationId) {
          const openRes = await api.openConversation({ itemId, sellerId });
          nextConversationId = openRes?.data?.data?.conversation?._id || null;
        }

        setConversationId(nextConversationId || null);

        if (nextConversationId) {
          const messagesRes = await api.getConversationMessages(nextConversationId);
          setMessages(messagesRes?.data?.data?.messages || []);
        }
      } catch (error) {
        Alert.alert('Chat unavailable', error?.response?.data?.message || 'Unable to open chat.');
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [initialConversationId, itemId, sellerId]);

  const canRespondToOffer = offerState?._id && offerState?.status === 'pending';

  const sendMessage = async () => {
    if (!draft.trim() || !conversationId) return;

    try {
      const res = await api.sendConversationMessage(conversationId, { content: draft.trim() });
      setMessages((current) => [...current, res?.data?.data?.message]);
      setDraft('');
    } catch (error) {
      Alert.alert('Message failed', error?.response?.data?.message || 'Unable to send message.');
    }
  };

  const runOfferAction = async (action) => {
    if (!canRespondToOffer) return;

    try {
      setActionLoading(true);
      const payload = { action };

      if (action === 'counter') {
        const parsedPrice = Number(counterPrice);
        if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
          Alert.alert('Invalid amount', 'Enter a valid counter amount.');
          return;
        }
        payload.price = parsedPrice;
      }

      const response = await api.respondToOffer(offerState._id, payload);
      const nextOffer = response?.data?.data?.offer;

      if (nextOffer) {
        setOfferState({
          _id: nextOffer._id,
          status: nextOffer.status,
          price: nextOffer.proposedPrice ?? nextOffer.price,
          isDirectBuy: Boolean(nextOffer.isDirectBuy),
        });
        setCounterMode(false);
        setCounterPrice('');
      }
    } catch (error) {
      Alert.alert('Offer update failed', error?.response?.data?.message || 'Unable to update offer.');
    } finally {
      setActionLoading(false);
    }
  };

  const offerAmount = useMemo(
    () => offerState?.price ?? offerState?.proposedPrice ?? 0,
    [offerState],
  );

  const offerStatusText = OFFER_STATUS_LABEL[offerState?.status] || 'Pending';
  const offerStatusClass = OFFER_STATUS_COLOR[offerState?.status] || OFFER_STATUS_COLOR.pending;

  return (
    <ScreenShell contentClassName="px-3 pb-2 pt-3">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="mb-2 flex-row items-center rounded-[18px] border border-[#d8e2e1] bg-white px-3 py-3">
          <Pressable onPress={() => navigation.goBack()} className="mr-2 p-1">
            <Ionicons name="arrow-back" size={20} color="#203030" />
          </Pressable>

          {otherParticipantAvatar ? (
            <Image
              source={{ uri: otherParticipantAvatar }}
              className="h-9 w-9 rounded-full bg-[#dce7e6]"
            />
          ) : (
            <View className="h-9 w-9 rounded-full bg-[#c7def6]" />
          )}

          <View className="ml-3 flex-1">
            <Text className="text-[17px] font-bold text-[#1f2e2e]" numberOfLines={1}>
              {otherParticipantName}
            </Text>
            <Text className="text-[12px] text-[#607575]" numberOfLines={1}>
              {itemTitle || getText(language, 'itemTitleFallback')}
            </Text>
          </View>
        </View>

        {offerState ? (
          <View className="mb-3 rounded-[16px] border border-[#e7a825] bg-[#f8dca1] px-3 py-3">
            <Text className="text-[11px] font-semibold uppercase text-[#735001]">
              OFFER · {offerStatusText}
            </Text>
            <Text className="mt-1 text-[34px] font-extrabold text-[#111111]">{moneyText(offerAmount)}</Text>

            {canRespondToOffer ? (
              <>
                <View className="mt-3 flex-row items-center gap-2">
                  <Pressable
                    onPress={() => runOfferAction('accept')}
                    disabled={actionLoading}
                    className="rounded-xl bg-[#111111] px-5 py-2"
                  >
                    <Text className="text-[15px] font-semibold text-white">Accept</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setCounterMode((current) => !current)}
                    disabled={actionLoading}
                    className="rounded-xl border border-[#d6b06b] bg-white px-5 py-2"
                  >
                    <Text className="text-[15px] font-semibold text-[#1f2e2e]">Counter</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => runOfferAction('reject')}
                    disabled={actionLoading}
                    className="rounded-xl border border-[#d6b06b] bg-white px-5 py-2"
                  >
                    <Text className="text-[15px] font-semibold text-[#992f2f]">Reject</Text>
                  </Pressable>
                </View>

                {counterMode ? (
                  <View className="mt-3 flex-row items-center gap-2">
                    <TextInput
                      value={counterPrice}
                      onChangeText={setCounterPrice}
                      placeholder="Counter amount"
                      keyboardType="numeric"
                      placeholderTextColor="#7a8d8d"
                      className="flex-1 rounded-xl border border-[#d6b06b] bg-white px-3 py-2 text-[14px] text-[#203030]"
                    />
                    <Pressable
                      onPress={() => runOfferAction('counter')}
                      disabled={actionLoading}
                      className="rounded-xl bg-[#0f6b75] px-4 py-2"
                    >
                      <Text className="text-[13px] font-semibold text-white">
                        {actionLoading ? 'Saving...' : 'Send'}
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
              </>
            ) : (
              <Text className={`mt-2 text-[13px] font-semibold ${offerStatusClass}`}>
                Status: {offerStatusText}
              </Text>
            )}
          </View>
        ) : null}

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-[12px] text-[#5d7676]">Loading...</Text>
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(message, index) => `${message?._id || index}`}
            contentContainerStyle={{ paddingBottom: 12 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isMine = String(senderIdFromMessage(item)) === String(currentUserId || '');

              return (
                <View
                  className={`mb-2 max-w-[78%] rounded-2xl px-3 py-2 ${isMine ? 'ml-auto bg-[#317ad9]' : 'mr-auto bg-white border border-[#dbe5e4]'}`}
                >
                  <Text className={`text-[13px] ${isMine ? 'text-white' : 'text-[#203030]'}`}>
                    {item?.content || ''}
                  </Text>
                </View>
              );
            }}
          />
        )}

        <View className="mt-2 flex-row items-center gap-2 rounded-[20px] border border-[#dbe5e4] bg-white px-3 py-2">
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={(getText(language, 'message') || 'Type a message') + '...'}
            className="flex-1 text-[13px] text-[#203030]"
            placeholderTextColor="#8aa0a0"
          />
          <Pressable
            onPress={sendMessage}
            disabled={!draft.trim() || !conversationId}
            className={`rounded-full px-4 py-2 ${draft.trim() && conversationId ? 'bg-[#111111]' : 'bg-[#dfe8e7]'}`}
          >
            <Text
              className={`text-[12px] font-semibold ${draft.trim() && conversationId ? 'text-white' : 'text-[#5d7676]'}`}
            >
              {getText(language, 'send') || 'Send'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
}
