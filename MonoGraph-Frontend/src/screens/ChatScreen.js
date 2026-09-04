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
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { HeaderBackButton, ScreenShell } from '../components/ui';
import api from '../services/api';
import { getText } from '../i18n';
import MeetupSchedulerModal from '../components/MeetupSchedulerModal';

const OFFER_STATUS_COLOR = {
  pending: 'text-[#7f4e00]',
  confirmed: 'text-[#0a5d76]',
  completed: 'text-[#195736]',
  cancelled: 'text-[#912e2e]',
};

const OFFER_STATUS_LABEL = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const ORDER_STATUS_COLOR = {
  pending: 'text-[#7f4e00]',
  confirmed: 'text-[#0a5d76]',
  completed: 'text-[#195736]',
  cancelled: 'text-[#912e2e]',
};

const ORDER_STATUS_LABEL = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const moneyText = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    return 'AFN 0';
  }

  return `${new Intl.NumberFormat('en-US').format(number)} AFN`;
};

const senderIdFromMessage = (message) => {
  const sender = message?.sender;

  if (!sender) return '';

  if (typeof sender === 'string') {
    return sender;
  }

  return sender?._id || sender?.id || '';
};

const getMeetingPlaceLabel = (meetingPlace) => {
  if (!meetingPlace || typeof meetingPlace === 'string') return '';
  const address = meetingPlace.location?.address;
  const localizedAddress = address?.en?.title || address?.fa?.title || address?.ps?.title;
  return [meetingPlace.name, localizedAddress].filter(Boolean).join(' · ');
};

const getMeetingPlaceQuery = (meetingPlace) => {
  const coordinates = meetingPlace?.location?.geoPosition?.coordinates;
  return Array.isArray(coordinates) && coordinates.length === 2
    ? `${coordinates[1]},${coordinates[0]}`
    : getMeetingPlaceLabel(meetingPlace);
};

export default function ChatScreen({ route, navigation }) {
  const language = useSelector(
    (state) => state.language.currentLanguage
  );

  const currentUserId = useSelector(
    (state) => state.auth?.user?._id || state.auth?.user?.id
  );

  const {
    conversationId: initialConversationId,
    itemId,
    itemTitle = '',
    sellerId,
    otherParticipantName = 'User',
    otherParticipantAvatar = null,
    latestOffer = null,
    latestOrder = null,
  } = route?.params || {};

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');

  const [conversationId, setConversationId] = useState(
    initialConversationId || null
  );

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [offerState, setOfferState] = useState(latestOffer);
  const [orderState, setOrderState] = useState(latestOrder);
  const [scheduleVisible, setScheduleVisible] = useState(false);
  const [changeReasonVisible, setChangeReasonVisible] = useState(false);
  const [changeReason, setChangeReason] = useState('');

  useEffect(() => {
    setConversationId(initialConversationId || null);
    setOfferState(latestOffer);
    setOrderState(latestOrder);
  }, [initialConversationId, latestOffer, latestOrder]);

  useEffect(() => {
    const loadConversation = async () => {
      if (!initialConversationId && (!itemId || !sellerId)) {
        return;
      }

      try {
        setLoading(true);

        let nextConversationId = initialConversationId;

        if (!nextConversationId) {
          const openRes = await api.openConversation({
            itemId,
            sellerId,
          });

          nextConversationId =
            openRes?.data?.data?.conversation?._id || null;
        }

        setConversationId(nextConversationId || null);

        if (nextConversationId) {
          const messagesRes =
            await api.getConversationMessages(nextConversationId);

          setMessages(
            messagesRes?.data?.data?.messages || []
          );
        }
        if (latestOrder?._id) {
          const orderRes = await api.getOrder(latestOrder._id);
          setOrderState(orderRes?.data?.data?.order || latestOrder);
        }
      } catch (error) {
        Alert.alert(
          'Chat unavailable',
          error?.response?.data?.message ||
          'Unable to open chat.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [initialConversationId, itemId, sellerId, latestOrder]);

  /*
   * ============================
   * OFFER
   * ============================
   */

  const getUserId = (user) => {
    if (!user) return '';

    if (typeof user === 'string') {
      return user;
    }

    return user?._id || user?.id || '';
  };

  const offerBuyerId = getUserId(offerState?.buyer);
  const offerSellerId = getUserId(offerState?.seller);

  const isOfferBuyer =
    String(offerBuyerId) === String(currentUserId || '');

  const isOfferSeller =
    String(offerSellerId) === String(currentUserId || '');

  const canRespondToOffer =
    Boolean(offerState?._id) &&
    offerState?.status === 'pending' &&
    isOfferSeller;

  const canCancelOffer =
    Boolean(offerState?._id) &&
    offerState?.status === 'pending' &&
    isOfferBuyer;

  const orderSellerId = getUserId(orderState?.seller);
  const isOrderSeller = String(orderSellerId) === String(currentUserId || '');
  const canRespondToOrder =
    Boolean(orderState?._id) &&
    orderState?.status === 'pending' &&
    isOrderSeller;
  const isBuyerAwaitingMeetup = Boolean(orderState?._id) &&
    orderState?.status === 'pending' && orderState?.meetupStatus === 'pending_buyer_confirmation' && !isOrderSeller;
  const canCancelOrder = Boolean(orderState?._id) &&
    ['pending', 'confirmed'].includes(orderState?.status) && !isOrderSeller;

  const offerAmount = useMemo(() => {
    return (
      offerState?.offeredPrice ??
      offerState?.askingPrice ??
      0
    );
  }, [offerState]);

  const offerStatusText =
    OFFER_STATUS_LABEL[offerState?.status] || 'Pending';

  const offerStatusClass =
    OFFER_STATUS_COLOR[offerState?.status] ||
    OFFER_STATUS_COLOR.pending;

  /*
   * ============================
   * ORDER
   * ============================
   */

  const meetupStatusKeys = {
    pending_buyer_confirmation: 'meetupStatusPending',
    confirmed: 'meetupStatusConfirmed',
    change_requested: 'meetupStatusChangeRequested',
  };
  const orderStatusText = meetupStatusKeys[orderState?.meetupStatus]
    ? getText(language, meetupStatusKeys[orderState.meetupStatus])
    : ORDER_STATUS_LABEL[orderState?.status] || 'Pending';

  const orderStatusClass =
    ORDER_STATUS_COLOR[orderState?.status] ||
    ORDER_STATUS_COLOR.pending;

  const orderAmount = useMemo(() => {
    return orderState?.total ?? orderState?.subtotal ?? 0;
  }, [orderState]);

  /*
   * ============================
   * SEND MESSAGE
   * ============================
   */

  const sendMessage = async () => {
    if (!draft.trim() || !conversationId) {
      return;
    }

    try {
      const res = await api.sendConversationMessage(
        conversationId,
        {
          content: draft.trim(),
        }
      );

      const message = res?.data?.data?.message;

      if (message) {
        setMessages((current) => [
          ...current,
          message,
        ]);
      }

      setDraft('');
    } catch (error) {
      Alert.alert(
        'Message failed',
        error?.response?.data?.message ||
        'Unable to send message.'
      );
    }
  };

  /*
   * ============================
   * OFFER ACTION
   * ============================
   */

  const runOfferAction = async (action) => {
    if (action === 'cancel' ? !canCancelOffer : !canRespondToOffer) {
      return;
    }

    try {
      setActionLoading(true);

      const payload = {
        action,
      };

      const response = action === 'cancel'
        ? await api.cancelOffer(offerState._id)
        : await api.respondToOffer(offerState._id, payload);

      const nextOffer =
        response?.data?.data?.offer;

      const nextOrder =
        response?.data?.data?.order;

      if (nextOffer) {
        setOfferState(nextOffer);
      }

      /*
       * If accepting an offer causes the backend
       * to create an Order, update it immediately.
       */
      if (nextOrder) {
        setOrderState(nextOrder);
      }
    } catch (error) {
      Alert.alert(
        'Offer update failed',
        error?.response?.data?.message ||
        'Unable to update offer.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const runOrderAction = async (action) => {
    if (action === 'cancel' ? !canCancelOrder : !canRespondToOrder) return;

    try {
      setActionLoading(true);
      const response = action === 'cancel'
        ? await api.cancelOrder(orderState._id)
        : await api.rejectOrder(orderState._id);
      const nextOrder = response?.data?.data?.order;
      if (nextOrder) setOrderState(nextOrder);
    } catch (error) {
      Alert.alert('Order update failed', error?.response?.data?.message || 'Unable to update order.');
    } finally {
      setActionLoading(false);
    }
  };

  const submitMeetup = async (payload) => {
    try {
      setActionLoading(true);
      const response = await api.acceptOrderWithMeetup(orderState._id, payload);
      setOrderState(response?.data?.data?.order || orderState);
      setScheduleVisible(false);
    } catch (error) {
      Alert.alert(getText(language, 'orderUpdateFailed'), error?.response?.data?.message || getText(language, 'unableToUpdateOrder'));
    } finally { setActionLoading(false); }
  };
  const confirmMeetup = async () => {
    try { setActionLoading(true); const response = await api.confirmMeetup(orderState._id); setOrderState(response?.data?.data?.order || orderState); }
    catch (error) { Alert.alert(getText(language, 'orderUpdateFailed'), error?.response?.data?.message || getText(language, 'unableToUpdateOrder')); }
    finally { setActionLoading(false); }
  };
  const requestChange = async () => {
    try { setActionLoading(true); const response = await api.requestMeetupChange(orderState._id, changeReason); setOrderState(response?.data?.data?.order || orderState); setChangeReasonVisible(false); setChangeReason(''); }
    catch (error) { Alert.alert(getText(language, 'orderUpdateFailed'), error?.response?.data?.message || getText(language, 'unableToUpdateOrder')); }
    finally { setActionLoading(false); }
  };

  return (
    <ScreenShell scroll={false} contentClassName="px-3 pb-2 pt-3">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        {/* =========================
            CHAT HEADER
        ========================== */}

        <View className={`mb-2 flex-row items-center rounded-[18px] border border-[#d8e2e1] bg-white px-3 py-3 ${language !== 'en' ? 'flex-row-reverse' : ''}`}>
          <HeaderBackButton onPress={() => navigation.goBack()} isRTL={language !== 'en'} className="me-2 bg-transparent" />

          {otherParticipantAvatar ? (
            <Image
              source={{
                uri: otherParticipantAvatar,
              }}
              className="h-9 w-9 rounded-full bg-[#dce7e6]"
            />
          ) : (
            <View className="h-9 w-9 rounded-full bg-[#c7def6]" />
          )}

          <View className="ms-3 flex-1">
            <Text
              className="text-[17px] font-bold text-[#1f2e2e]"
              numberOfLines={1}
            >
              {otherParticipantName}
            </Text>

            <Text
              className="text-[12px] text-[#607575]"
              numberOfLines={1}
            >
              {itemTitle ||
                getText(
                  language,
                  'itemTitleFallback'
                )}
            </Text>
          </View>
        </View>

        {/* =========================
            OFFER CARD
        ========================== */}

        {offerState ? (
          <View className="mb-3 rounded-[16px] border border-[#e7a825] bg-[#f8dca1] px-3 py-3">
            <Text className="text-[11px] font-semibold uppercase text-[#735001]">
              {isOfferSeller ? 'OFFER RECEIVED' : 'YOUR OFFER'} · {offerStatusText}
            </Text>

            <Text className="mt-1 text-[34px] font-extrabold text-[#111111]">
              {moneyText(offerAmount)}
            </Text>

            {canRespondToOffer ? (
              <View className="mt-3 flex-row items-center gap-2">
                {/* ACCEPT */}

                <Pressable
                  onPress={() =>
                    runOfferAction('accept')
                  }
                  disabled={actionLoading}
                  className="rounded-xl bg-[#111111] px-5 py-2"
                >
                  <Text className="text-[15px] font-semibold text-white">
                    {actionLoading ? 'Saving...' : 'Accept Offer'}
                  </Text>
                </Pressable>

                {/* REJECT */}

                <Pressable
                  onPress={() =>
                    runOfferAction('reject')
                  }
                  disabled={actionLoading}
                  className="rounded-xl border border-[#d6b06b] bg-white px-5 py-2"
                >
                  <Text className="text-[15px] font-semibold text-[#992f2f]">
                    Reject Offer
                  </Text>
                </Pressable>
              </View>
            ) : canCancelOffer ? (
              <Pressable
                onPress={() => runOfferAction('cancel')}
                disabled={actionLoading}
                className="mt-3 self-start rounded-xl border border-[#d6b06b] bg-white px-5 py-2"
              >
                <Text className="text-[15px] font-semibold text-[#992f2f]">Cancel Offer</Text>
              </Pressable>
            ) : (
              <Text
                className={`mt-2 text-[13px] font-semibold ${offerStatusClass}`}
              >
                Status: {offerStatusText}
              </Text>
            )}
          </View>
        ) : null}

        {/* =========================
            ORDER CARD
        ========================== */}

        {orderState ? (
          <View className="mb-3 rounded-[16px] border border-[#cddddd] bg-white px-3 py-3">
            <Text className="text-[11px] font-semibold uppercase text-[#607575]">
              {isOrderSeller ? 'ORDER RECEIVED' : 'YOUR ORDER'} · {orderStatusText}
            </Text>

            <Text className="mt-1 text-[30px] font-extrabold text-[#111111]">
              {moneyText(orderAmount)}
            </Text>

            <Text
              className={`mt-2 text-[13px] font-semibold ${orderStatusClass}`}
            >
              Status: {orderStatusText}
            </Text>

            {getMeetingPlaceLabel(orderState.orderLocation) ? (
              <View className="mt-3 flex-row items-center">
                <Ionicons
                  name="location-outline"
                  size={16}
                  color="#607575"
                />

                <Text
                  className="ml-1 flex-1 text-[13px] text-[#607575]"
                  numberOfLines={2}
                >
                  {getMeetingPlaceLabel(orderState.orderLocation)}
                </Text>
              </View>
            ) : null}
            {canCancelOrder ? <Pressable onPress={() => runOrderAction('cancel')} disabled={actionLoading} className="mt-3 self-start rounded-xl border border-[#d6b06b] bg-white px-5 py-2"><Text className="text-[15px] font-semibold text-[#992f2f]">Cancel Order</Text></Pressable> : null}

            {orderState.meetupDate && getMeetingPlaceLabel(orderState.meetupLocation) ? (
              <View className="mt-3 rounded-xl bg-[#edf7f6] p-3">
                <Text className="text-[13px] font-bold text-[#0f6b75]">{getText(language, 'meetupInfo')}</Text>
                <Text className="mt-1 text-[13px] text-[#203030]">{new Date(orderState.meetupDate).toLocaleString()}</Text>
                <Pressable onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getMeetingPlaceQuery(orderState.meetupLocation))}`)} className="mt-2 flex-row items-center">
                  <Ionicons name="location" size={16} color="#0f6b75" /><Text className="ml-1 font-semibold text-[#0f6b75]">{getMeetingPlaceLabel(orderState.meetupLocation)} · {getText(language, 'directions')}</Text>
                </Pressable>
              </View>
            ) : null}
            {canRespondToOrder ? (
              <View className="mt-3 flex-row items-center gap-2">
                <Pressable
                  onPress={() => setScheduleVisible(true)}
                  disabled={actionLoading}
                  className="rounded-xl bg-[#111111] px-5 py-2"
                >
                  <Text className="text-[15px] font-semibold text-white">
                    {getText(language, 'acceptOrder')}
                  </Text>
                </Pressable>
                {orderState.status === 'pending' ? <Pressable
                  onPress={() => runOrderAction('reject')}
                  disabled={actionLoading}
                  className="rounded-xl border border-[#d6b06b] bg-white px-5 py-2"
                >
                  <Text className="text-[15px] font-semibold text-[#992f2f]">Reject Order</Text>
                </Pressable> : null}
              </View>
            ) : null}
            {isBuyerAwaitingMeetup ? <View className="mt-3"><View className="flex-row gap-2"><Pressable onPress={confirmMeetup} disabled={actionLoading} className="rounded-xl bg-[#111111] px-4 py-2"><Text className="font-semibold text-white">{getText(language, 'confirm')}</Text></Pressable><Pressable onPress={() => setChangeReasonVisible((value) => !value)} className="rounded-xl border border-[#0f6b75] px-4 py-2"><Text className="font-semibold text-[#0f6b75]">{getText(language, 'requestChange')}</Text></Pressable></View>{changeReasonVisible ? <View className="mt-2"><TextInput value={changeReason} onChangeText={setChangeReason} placeholder={getText(language, 'changeReasonOptional')} className="rounded-xl border border-[#d7e1e0] px-3 py-2 text-[#203030]" /><Pressable onPress={requestChange} disabled={actionLoading} className="mt-2 self-start rounded-xl bg-[#0f6b75] px-4 py-2"><Text className="font-semibold text-white">{getText(language, 'send')}</Text></Pressable></View> : null}</View> : null}
          </View>
        ) : null}

        {/* =========================
            MESSAGES
        ========================== */}

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-[12px] text-[#5d7676]">
              Loading...
            </Text>
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(message, index) =>
              `${message?._id || index}`
            }
            contentContainerStyle={{
              paddingBottom: 12,
            }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isMine =
                String(
                  senderIdFromMessage(item)
                ) ===
                String(currentUserId || '');

              return (
                <View
                  className={`mb-2 max-w-[78%] rounded-2xl px-3 py-2 ${isMine
                    ? 'ml-auto bg-[#317ad9]'
                    : 'mr-auto border border-[#dbe5e4] bg-white'
                    }`}
                >
                  <Text
                    className={`text-[13px] ${isMine
                      ? 'text-white'
                      : 'text-[#203030]'
                      }`}
                  >
                    {item?.content || ''}
                  </Text>
                </View>
              );
            }}
          />
        )}

        {/* =========================
            MESSAGE INPUT
        ========================== */}

        <View className="mt-2 flex-row items-center gap-2 rounded-[20px] border border-[#dbe5e4] bg-white px-3 py-2">
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={
              (getText(language, 'message') ||
                'Type a message') + '...'
            }
            className="flex-1 text-[13px] text-[#203030]"
            placeholderTextColor="#8aa0a0"
          />

          <Pressable
            onPress={sendMessage}
            disabled={
              !draft.trim() ||
              !conversationId
            }
            className={`rounded-full px-4 py-2 ${draft.trim() && conversationId
              ? 'bg-[#111111]'
              : 'bg-[#dfe8e7]'
              }`}
          >
            <Text
              className={`text-[12px] font-semibold ${draft.trim() && conversationId
                ? 'text-white'
                : 'text-[#5d7676]'
                }`}
            >
              {getText(language, 'send') ||
                'Send'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
      <MeetupSchedulerModal visible={scheduleVisible} onClose={() => setScheduleVisible(false)} onConfirm={submitMeetup} loading={actionLoading} language={language} />
    </ScreenShell>
  );
}
