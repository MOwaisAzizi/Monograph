import React from 'react';
import { Text } from 'react-native';
import { ScreenShell } from '../components/ui';

export default function ShopScreen({ navigation }) {
  return (
    <ScreenShell contentClassName="pb-6">
      <Text className="text-[12px] text-[#89a1a1]">Backend shop data will appear here.</Text>
    </ScreenShell>
  );
}
