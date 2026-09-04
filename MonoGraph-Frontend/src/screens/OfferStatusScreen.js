import React from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { ScreenShell } from '../components/ui';
import { getText } from '../i18n';
import api from '../services/api';

export default function OfferStatusScreen({ route, navigation }) {
  const language = useSelector((state) => state.language.currentLanguage);
  const { status = 'pending', amount = 0, itemTitle = '', itemId, sellerId } = route?.params || {};

  const friendlyStatus = { pending: 'Pending', confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled' }[status] || 'Pending';

  const handleChat = async () => {
    if (!itemId) return;
    try {
      const response = await api.openConversation({ itemId, sellerId });
      navigation.navigate('Chat', {
        itemTitle,
        itemId,
        sellerId,
        conversationId: response?.data?.data?.conversation?._id,
        otherParticipantName: 'Seller',
      });
    } catch (error) {
      Alert.alert('Chat unavailable', error?.response?.data?.message || 'Unable to open chat.');
    }
  };

  return (
    <ScreenShell contentClassName="px-5 pb-6 pt-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="rounded-[28px] bg-white/80 p-5">
          <Text className="text-[22px] font-bold text-[#203030]">
            {getText(language, 'offerStatus')}
          </Text>
          <Text className="mt-2 text-[13px] text-[#4f6767]">
            {itemTitle || 'Item'} · {getText(language, 'offerSubmitted')}
          </Text>

          <View className="mt-5 rounded-2xl bg-[#edf5f4] p-4">
            <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#628080]">
              Status
            </Text>
            <Text className="mt-2 text-[20px] font-bold text-[#0b4a52]">{friendlyStatus}</Text>
            <Text className="mt-2 text-[13px] text-[#405757]">Offer: Af {amount}</Text>
          </View>

          <Pressable onPress={handleChat} className="mt-5 rounded-2xl bg-[#0f6b75] px-4 py-3">
            <Text className="text-center text-[13px] font-semibold text-white">
              {getText(language, 'chatWithSeller')}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.goBack()}
            className="mt-3 rounded-2xl border border-[#d5e3e2] bg-white px-4 py-3"
          >
            <Text className="text-center text-[13px] font-semibold text-[#203030]">
              {getText(language, 'backToProduct')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenShell>
  );
}
