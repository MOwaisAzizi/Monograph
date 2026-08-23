import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { getText } from '../i18n';

const pad = (number) => String(number).padStart(2, '0');
const dateKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
export default function MeetupSchedulerModal({ visible, onClose, onConfirm, loading, language }) {
  const dates = useMemo(() => Array.from({ length: 10 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + index);
    return date;
  }), [visible]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [hour, setHour] = useState(null);
  const [period, setPeriod] = useState(null);
  const [minute, setMinute] = useState(null);
  const [place, setPlace] = useState(null);
  const [places, setPlaces] = useState([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setSelectedDate(null); setHour(null); setPeriod(null); setMinute(null); setPlace(null); setLocationOpen(false);
    setPlacesLoading(true);
    api.getMeetingPlaces('herat')
      .then((response) => setPlaces(response?.data?.data?.meetingPlaces || []))
      .catch(() => setPlaces([]))
      .finally(() => setPlacesLoading(false));
  }, [visible]);

  const complete = selectedDate && hour !== null && period && minute !== null && place;
  const choose = () => {
    if (!complete) return;
    const hour24 = (hour % 12) + (period === 'PM' ? 12 : 0);
    onConfirm({ meetupDate: dateKey(selectedDate), meetupTime: `${pad(hour24)}:${pad(minute)}`, meetupLocationId: place._id });
  };

  const Wheel = ({ values, selected, onSelect, renderValue = String }) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
      {values.map((value) => <Pressable key={value} onPress={() => onSelect(value)} className={`mr-2 min-w-[54px] rounded-xl px-3 py-2 ${selected === value ? 'bg-[#0f6b75]' : 'bg-[#edf4f3]'}`}>
        <Text className={`text-center font-semibold ${selected === value ? 'text-white' : 'text-[#203030]'}`}>{renderValue(value)}</Text>
      </Pressable>)}
    </ScrollView>
  );

  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View className="flex-1 justify-end bg-black/40">
      <View className="max-h-[90%] rounded-t-[28px] bg-white">
      <ScrollView contentContainerClassName="px-4 pb-7 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-xl font-bold text-[#203030]">{getText(language, 'scheduleMeetup')}</Text>
          <Pressable onPress={onClose} className="p-1"><Ionicons name="close" size={24} color="#203030" /></Pressable>
        </View>
        <Text className="mb-2 font-semibold text-[#203030]">{getText(language, 'meetupDate')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          {dates.map((date) => <Pressable key={dateKey(date)} onPress={() => setSelectedDate(date)} className={`mr-2 w-[72px] rounded-2xl px-2 py-3 ${dateKey(selectedDate || new Date(0)) === dateKey(date) ? 'bg-[#0f6b75]' : 'bg-[#edf4f3]'}`}>
            <Text className={`text-center text-xs ${dateKey(selectedDate || new Date(0)) === dateKey(date) ? 'text-white' : 'text-[#607575]'}`}>{date.toLocaleDateString(language === 'fa' ? 'fa-AF' : language === 'ps' ? 'ps-AF' : 'en-US', { weekday: 'short' })}</Text>
            <Text className={`mt-1 text-center text-lg font-bold ${dateKey(selectedDate || new Date(0)) === dateKey(date) ? 'text-white' : 'text-[#203030]'}`}>{date.getDate()}</Text>
          </Pressable>)}
        </ScrollView>
        <Text className="mb-2 font-semibold text-[#203030]">{getText(language, 'meetupTime')}</Text>
        <View className="mb-4 rounded-2xl border border-[#d7e1e0] bg-white p-3">
        <Text className="mb-1 text-xs font-semibold text-[#607575]">{getText(language, 'hour')}</Text><Wheel values={Array.from({ length: 12 }, (_, index) => index + 1)} selected={hour} onSelect={setHour} />
        <Text className="mb-1 text-xs font-semibold text-[#607575]">{getText(language, 'minute')}</Text><Wheel values={Array.from({ length: 60 }, (_, index) => index)} selected={minute} onSelect={setMinute} renderValue={pad} />
        <Text className="mb-1 text-xs font-semibold text-[#607575]">{getText(language, 'period')}</Text><Wheel values={['AM', 'PM']} selected={period} onSelect={setPeriod} />
        {hour !== null && minute !== null && period ? <Text className="mb-4 text-center text-lg font-bold text-[#0f6b75]">{hour}:{pad(minute)} {period}</Text> : null}
        </View>
        <Text className="mb-2 font-semibold text-[#203030]">{getText(language, 'meetupArea')}</Text>
        {placesLoading ? <ActivityIndicator color="#0f6b75" /> : <View className="mb-4"><Pressable onPress={() => setLocationOpen((open) => !open)} className="flex-row items-center justify-between rounded-xl border border-[#0f6b75] bg-[#edf7f6] px-3 py-3"><Text className={`flex-1 font-semibold ${place ? 'text-[#203030]' : 'text-[#607575]'}`} numberOfLines={1}>{place?.name || getText(language, 'selectMeetingArea')}</Text><Ionicons name={locationOpen ? 'chevron-up' : 'chevron-down'} size={20} color="#0f6b75" /></Pressable>{locationOpen ? <View className="max-h-52 rounded-b-xl border border-t-0 border-[#d7e1e0] bg-white"><ScrollView nestedScrollEnabled>{places.map((item) => <Pressable key={item._id} onPress={() => { setPlace(item); setLocationOpen(false); }} className="border-b border-[#edf1f0] px-3 py-3"><Text className="font-semibold text-[#203030]">{item.name}</Text></Pressable>)}</ScrollView></View> : null}</View>}
        <Pressable onPress={choose} disabled={!complete || loading} className={`items-center rounded-2xl py-4 ${complete && !loading ? 'bg-[#111111]' : 'bg-[#dfe8e7]'}`}><Text className={`font-bold ${complete && !loading ? 'text-white' : 'text-[#829494]'}`}>{loading ? getText(language, 'saving') : getText(language, 'confirmMeetup')}</Text></Pressable>
      </ScrollView>
      </View>
    </View>
  </Modal>;
}
