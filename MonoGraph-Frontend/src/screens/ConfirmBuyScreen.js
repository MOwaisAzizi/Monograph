import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { ScreenShell, SubmitButton } from '../components/ui';
import { getText } from '../i18n';

export default function ConfirmBuyScreen({ route, navigation }) {
  const language = useSelector((state) => state.language.currentLanguage);
  const { itemId, sellerId, itemTitle, price } = route?.params || {};
  const [loading, setLoading] = useState(false);

  const handleBuyNow = async () => {
    if (!itemId) return;
    try {
      setLoading(true);
      await api.createOrder({
        itemId,
        location: { label: itemTitle || getText(language, 'purchaseLocation') },
      });
      navigation.navigate('OfferStatus', {
        itemId,
        itemTitle,
        status: 'pending',
        amount: price || 0,
      });
    } catch (error) {
      Alert.alert(
        getText(language, 'unableToBuy'),
        error?.response?.data?.message || getText(language, 'purchaseFailed'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell contentClassName="px-5 pb-6 pt-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="rounded-[28px] bg-white/80 p-5">
          <Text className="text-[22px] font-bold text-[#203030]">
            {getText(language, 'confirmPurchase')}
          </Text>
          <Text className="mt-2 text-[13px] text-[#4f6767]">
            {itemTitle || 'Product'} · Af {price || 0}
          </Text>

          <View className="mt-5 rounded-2xl bg-[#edf5f4] p-4">
            <Text className="text-[12px] text-[#5d7676]">
              This confirms the direct purchase and creates an order with the seller.
            </Text>
          </View>

          <SubmitButton
            label={getText(language, 'buyNow')}
            loadingLabel={getText(language, 'buyNow')}
            onPress={handleBuyNow}
            loading={loading}
          />

          <Pressable
            onPress={() => navigation.goBack()}
            className="mt-3 rounded-2xl border border-[#d5e3e2] bg-white px-4 py-3"
          >
            <Text className="text-center text-[13px] font-semibold text-[#203030]">Cancel</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenShell>
  );
}
