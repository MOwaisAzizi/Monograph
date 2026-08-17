import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { ScreenShell } from '../components/ui';
import api from '../services/api';
import { getText } from '../i18n';

export default function ChatScreen({ route, navigation }) {
  const language = useSelector((state) => state.language.currentLanguage);
  const { itemId, itemTitle = '', sellerId } = route?.params || {};
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadConversation = async () => {
      if (!itemId || !sellerId) return;
      try {
        setLoading(true);
        const res = await api.openConversation({ itemId, sellerId });
        const nextConversationId = res?.data?.data?.conversation?._id;
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
  }, [itemId, sellerId]);

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

  const listHeader = useMemo(
    () => (
      <View className="mb-4 rounded-[24px] bg-white/80 p-4">
        <Text className="text-[18px] font-bold text-[#203030]">{itemTitle || 'Conversation'}</Text>
        <Text className="mt-1 text-[12px] text-[#5d7676]">
          {getText(language, 'chatWithSeller')}
        </Text>
      </View>
    ),
    [itemTitle, language],
  );

  return (
    <ScreenShell contentClassName="px-4 pb-2 pt-4">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="mb-3 flex-row items-center justify-between px-1">
          <Pressable
            onPress={() => navigation.goBack()}
            className="h-9 w-9 items-center justify-center rounded-full bg-white/80"
          >
            <Text className="text-[16px] text-[#203030]">←</Text>
          </Pressable>
          <Text className="text-[15px] font-bold text-[#203030]">{getText(language, 'chat')}</Text>
          <View className="h-9 w-9" />
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-[12px] text-[#5d7676]">Loading...</Text>
          </View>
        ) : (
          <>
            {listHeader}
            <FlatList
              data={messages}
              keyExtractor={(message, index) => `${message?._id || index}`}
              contentContainerStyle={{ paddingBottom: 12 }}
              renderItem={({ item }) => (
                <View
                  className={`mb-2 max-w-[80%] rounded-2xl px-3 py-2 ${item?.sender ? 'ml-auto bg-[#0f6b75]' : 'mr-auto bg-white'}`}
                >
                  <Text className={`text-[12px] ${item?.sender ? 'text-white' : 'text-[#203030]'}`}>
                    {item?.content || ''}
                  </Text>
                </View>
              )}
            />
          </>
        )}

        <View className="mt-2 flex-row items-center gap-2 rounded-[20px] bg-white px-3 py-2">
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={getText(language, 'message') || 'Type a message'}
            className="flex-1 text-[13px] text-[#203030]"
            placeholderTextColor="#8aa0a0"
          />
          <Pressable
            onPress={sendMessage}
            disabled={!draft.trim() || !conversationId}
            className={`rounded-full px-4 py-2 ${draft.trim() && conversationId ? 'bg-[#0f6b75]' : 'bg-[#dfe8e7]'}`}
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
