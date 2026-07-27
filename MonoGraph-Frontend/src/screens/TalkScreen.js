import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import api from '../services/api';
import { normalizeBusiness } from '../utils/marketplace';
import { Chip, ScreenHeader, ScreenShell } from '../components/ui';
import { ShopCard } from '../components/cards';

export default function ShopScreen({ navigation }) {

  return (
    <ScreenShell contentClassName="pb-6">
              <Text className="text-[12px] text-[#89a1a1]">Backend shop data will appear here.</Text>
    </ScreenShell>
  );
}
